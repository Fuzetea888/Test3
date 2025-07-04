import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import swaggerUi from 'swagger-ui-express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { register } from 'prom-client';
import prometheusMiddleware from 'express-prometheus-middleware';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { container } from 'tsyringe';

// ComplianceOS imports
import {
  authenticate,
  authorize,
  securityHeaders,
  corsConfig,
  auditLogger,
  rateLimitAPI,
  validateEnvironment,
  getAuthHealthCheck,
} from '@complianceos/auth';

// Local imports
import { trpcRouter } from './trpc/router';
import { createTRPCContext } from './trpc/context';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { healthCheck } from './middleware/health.middleware';
import { swaggerSpec } from './utils/swagger';
import { WebSocketManager } from './services/websocket.service';
import { QueueManager } from './services/queue.service';
import { EmailService } from './services/email.service';
import { FileService } from './services/file.service';
import { DatabaseService } from './services/database.service';
import { MetricsService } from './services/metrics.service';
import { CacheService } from './services/cache.service';
import { initializeServices } from './utils/container';

// API routes
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { companyRoutes } from './routes/company.routes';
import { workflowRoutes } from './routes/workflow.routes';
import { documentRoutes } from './routes/document.routes';
import { reportRoutes } from './routes/report.routes';
import { integrationRoutes } from './routes/integration.routes';
import { adminRoutes } from './routes/admin.routes';

// =============================================================================
// CONSTANTS
// =============================================================================

const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_VERSION = process.env.API_VERSION || 'v1';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_URL;

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================

class ComplianceOSServer {
  private app: express.Application;
  private server: any;
  private io: Server;
  private wsManager: WebSocketManager;
  private queueManager: QueueManager;
  private metricsService: MetricsService;
  private cacheService: CacheService;
  private isShuttingDown = false;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: CORS_ORIGIN.split(','),
        credentials: true,
      },
    });

    // Initialize services
    this.initializeContainer();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeWebSocket();
    this.initializeErrorHandling();
    this.setupGracefulShutdown();
  }

  private initializeContainer(): void {
    try {
      // Initialize dependency injection container
      initializeServices();
      
      // Get service instances
      this.wsManager = container.resolve(WebSocketManager);
      this.queueManager = container.resolve(QueueManager);
      this.metricsService = container.resolve(MetricsService);
      this.cacheService = container.resolve(CacheService);
      
      logger.info('✅ Dependency injection container initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize container:', error);
      process.exit(1);
    }
  }

  private initializeMiddleware(): void {
    // Trust proxy (for load balancers)
    this.app.set('trust proxy', process.env.TRUST_PROXY !== 'false');

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
        },
      },
    }));

    // Custom security headers
    this.app.use(securityHeaders);

    // CORS configuration
    this.app.use(cors(corsConfig));

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression());

    // Logging
    const logFormat = NODE_ENV === 'production' 
      ? 'combined' 
      : 'dev';
    this.app.use(morgan(logFormat, {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }));

    // Rate limiting
    const globalRateLimit = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: NODE_ENV === 'production' ? 100 : 1000, // requests per windowMs
      message: {
        error: 'Too many requests from this IP',
        retryAfter: '15 minutes',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    const speedLimiter = slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 50, // allow 50 requests per windowMs without delay
      delayMs: 500, // add 500ms delay per request after delayAfter
    });

    this.app.use(globalRateLimit);
    this.app.use(speedLimiter);

    // Prometheus metrics
    this.app.use(prometheusMiddleware({
      metricsPath: '/metrics',
      collectDefaultMetrics: true,
      requestDurationBuckets: [0.1, 0.5, 1, 1.5, 2, 3, 5, 10],
    }));

    // Health check (before authentication)
    this.app.use('/health', healthCheck);

    logger.info('✅ Middleware initialized');
  }

  private initializeRoutes(): void {
    // API documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // tRPC router
    this.app.use('/trpc', (req, res, next) => {
      // Create tRPC context
      const ctx = createTRPCContext({ req, res });
      
      // Handle tRPC requests
      trpcRouter.createCaller(ctx)(req, res, next);
    });

    // REST API routes
    const apiRouter = express.Router();
    
    // Authentication routes (public)
    apiRouter.use('/auth', authRoutes);
    
    // Protected routes (require authentication)
    apiRouter.use('/users', authenticate, userRoutes);
    apiRouter.use('/companies', authenticate, companyRoutes);
    apiRouter.use('/workflows', authenticate, workflowRoutes);
    apiRouter.use('/documents', authenticate, documentRoutes);
    apiRouter.use('/reports', authenticate, reportRoutes);
    apiRouter.use('/integrations', authenticate, integrationRoutes);
    apiRouter.use('/admin', authenticate, authorize(['ADMIN']), adminRoutes);

    // Mount API routes
    this.app.use(`/api/${API_VERSION}`, apiRouter);

    // Serve static files (if needed)
    this.app.use('/uploads', express.static('uploads'));

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'ComplianceOS API',
        version: API_VERSION,
        description: 'Enterprise compliance management platform',
        environment: NODE_ENV,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        docs: '/api-docs',
        health: '/health',
        metrics: '/metrics',
      });
    });

    logger.info('✅ Routes initialized');
  }

  private initializeWebSocket(): void {
    // Initialize WebSocket manager
    this.wsManager.initialize(this.io);

    // WebSocket authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          throw new Error('No token provided');
        }

        // Verify token using auth service
        const user = await container.resolve('AuthService').verifyToken(token);
        
        if (!user) {
          throw new Error('Invalid token');
        }

        socket.data.user = user;
        next();
      } catch (error) {
        logger.error('WebSocket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });

    // WebSocket connection handling
    this.io.on('connection', (socket) => {
      logger.info(`WebSocket client connected: ${socket.id}`);
      
      // Handle client events
      socket.on('join-room', (room: string) => {
        socket.join(room);
        logger.info(`Client ${socket.id} joined room: ${room}`);
      });

      socket.on('leave-room', (room: string) => {
        socket.leave(room);
        logger.info(`Client ${socket.id} left room: ${room}`);
      });

      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${socket.id}`);
      });
    });

    logger.info('✅ WebSocket initialized');
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown('SIGTERM');
    });

    // Unhandled promise rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.gracefulShutdown('SIGTERM');
    });

    logger.info('✅ Error handling initialized');
  }

  private setupGracefulShutdown(): void {
    // Handle termination signals
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
      process.on(signal, () => {
        logger.info(`Received ${signal}, starting graceful shutdown...`);
        this.gracefulShutdown(signal);
      });
    });
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.info('Shutdown already in progress...');
      return;
    }

    this.isShuttingDown = true;
    logger.info(`Starting graceful shutdown (${signal})...`);

    try {
      // Stop accepting new connections
      this.server.close(() => {
        logger.info('HTTP server closed');
      });

      // Close WebSocket connections
      this.io.close(() => {
        logger.info('WebSocket server closed');
      });

      // Close database connections
      await container.resolve(DatabaseService).disconnect();
      logger.info('Database connections closed');

      // Close queue connections
      await this.queueManager.close();
      logger.info('Queue connections closed');

      // Close cache connections
      await this.cacheService.disconnect();
      logger.info('Cache connections closed');

      // Wait for ongoing requests to complete (max 30 seconds)
      const shutdownTimeout = setTimeout(() => {
        logger.error('Graceful shutdown timeout, forcing exit...');
        process.exit(1);
      }, 30000);

      // Clear timeout if shutdown completes
      clearTimeout(shutdownTimeout);

      logger.info('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    try {
      // Validate environment
      validateEnvironment();

      // Check health of dependencies
      const healthStatus = await getAuthHealthCheck();
      if (!healthStatus.healthy) {
        throw new Error('Authentication service health check failed');
      }

      // Initialize background services
      await this.queueManager.initialize();
      await this.metricsService.initialize();

      // Start server
      this.server.listen(PORT, () => {
        logger.info(`
🚀 ComplianceOS Server Started Successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server:       http://localhost:${PORT}
📚 API Docs:     http://localhost:${PORT}/api-docs
🔍 Health:       http://localhost:${PORT}/health
📊 Metrics:      http://localhost:${PORT}/metrics
⚡ Environment:  ${NODE_ENV}
🔧 API Version:  ${API_VERSION}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 Security Features:
   • JWT Authentication with MFA
   • Role-based Access Control (RBAC)
   • Rate Limiting & DDoS Protection
   • Security Headers & CSP
   • Audit Logging & Monitoring
   • Data Encryption & Validation

🏗️ Architecture:
   • Express.js with TypeScript
   • tRPC for type-safe APIs
   • Supabase for Database
   • Redis for Caching & Sessions
   • WebSocket for Real-time Updates
   • Background Job Processing
   • Prometheus Metrics
   • Structured Logging

Ready to handle enterprise compliance workflows! 🎯
        `);
      });

      // Log startup metrics
      this.metricsService.recordStartup();

    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// =============================================================================
// BOOTSTRAP APPLICATION
// =============================================================================

const server = new ComplianceOSServer();

// Start the server
server.start().catch((error) => {
  logger.error('Failed to start ComplianceOS server:', error);
  process.exit(1);
});

// Export for testing
export { server };
export default server;