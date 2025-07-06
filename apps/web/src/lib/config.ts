// =============================================================================
// CONFIGURATION MANAGEMENT - CLIENT SIDE
// =============================================================================

/**
 * Configuration sécurisée côté client
 * Les clés API sensibles doivent être gérées côté serveur uniquement
 */
export const config = {
  app: {
    name: 'ComplianceOS',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 30000,
  },
  
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  stripe: {
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
  },
  
  oauth: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    },
    microsoft: {
      clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '',
    },
  },
  
  features: {
    aiEnabled: true,
    debugMode: process.env.NODE_ENV === 'development',
    analyticsEnabled: process.env.NODE_ENV === 'production',
  },
} as const;

/**
 * Validation de la configuration
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.supabase.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  
  if (!config.supabase.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }
  
  if (config.app.environment === 'production') {
    if (!config.stripe.publicKey) {
      errors.push('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is required for production');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Utilitaire pour les URLs d'API
 */
export function getApiUrl(endpoint: string): string {
  return `${config.api.baseUrl}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}