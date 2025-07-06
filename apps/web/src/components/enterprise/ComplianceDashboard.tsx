'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// =============================================================================
// ENTERPRISE COMPLIANCE DASHBOARD - TOP 0.1% FEATURES
// =============================================================================

interface ComplianceMetrics {
  overallScore: number;
  frameworks: {
    [key: string]: {
      score: number;
      status: 'compliant' | 'non-compliant' | 'partially-compliant';
      lastAssessed: string;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    };
  };
  trends: {
    timestamp: string;
    score: number;
  }[];
  alerts: {
    id: string;
    level: 'info' | 'warning' | 'critical' | 'fatal';
    title: string;
    description: string;
    timestamp: string;
    framework?: string;
  }[];
  predictions: {
    type: 'risk_increase' | 'compliance_degradation' | 'audit_risk';
    probability: number;
    timeframe: string;
    impact: string;
  }[];
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}

export default function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // =============================================================================
  // REAL-TIME DATA FETCHING
  // =============================================================================

  useEffect(() => {
    // Initial data load
    fetchComplianceMetrics();
    fetchSystemHealth();

    // Set up real-time updates
    let interval: NodeJS.Timeout;
    if (isRealTimeEnabled) {
      interval = setInterval(() => {
        fetchComplianceMetrics();
        fetchSystemHealth();
      }, 30000); // Update every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRealTimeEnabled, timeRange]);

  const fetchComplianceMetrics = async () => {
    try {
      // Mock data - in real implementation, this would call your API
      const mockMetrics: ComplianceMetrics = {
        overallScore: 94,
        frameworks: {
          'soc2': {
            score: 96,
            status: 'compliant',
            lastAssessed: new Date().toISOString(),
            riskLevel: 'low'
          },
          'gdpr': {
            score: 92,
            status: 'compliant',
            lastAssessed: new Date().toISOString(),
            riskLevel: 'medium'
          },
          'hipaa': {
            score: 95,
            status: 'compliant',
            lastAssessed: new Date().toISOString(),
            riskLevel: 'low'
          },
          'iso27001': {
            score: 91,
            status: 'compliant',
            lastAssessed: new Date().toISOString(),
            riskLevel: 'medium'
          }
        },
        trends: generateTrendData(),
        alerts: generateAlerts(),
        predictions: generatePredictions()
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch compliance metrics:', error);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const mockHealth: SystemHealth = {
        status: 'healthy',
        uptime: Math.floor(Date.now() / 1000) - 3600, // 1 hour uptime
        responseTime: 150 + Math.random() * 50, // 150-200ms
        errorRate: Math.random() * 2, // 0-2%
        throughput: 100 + Math.random() * 50 // 100-150 req/s
      };
      
      setSystemHealth(mockHealth);
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    }
  };

  // =============================================================================
  // DATA PROCESSING
  // =============================================================================

  const processedFrameworks = useMemo(() => {
    if (!metrics) return [];
    
    return Object.entries(metrics.frameworks).map(([id, framework]) => ({
      id,
      name: getFrameworkDisplayName(id),
      ...framework
    }));
  }, [metrics]);

  const filteredAlerts = useMemo(() => {
    if (!metrics) return [];
    
    return metrics.alerts
      .filter(alert => selectedFramework === 'all' || alert.framework === selectedFramework)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [metrics, selectedFramework]);

  const chartData = useMemo(() => {
    if (!metrics) return null;

    // Compliance Trend Chart
    const trendData = {
      labels: metrics.trends.map(t => new Date(t.timestamp).toLocaleDateString()),
      datasets: [
        {
          label: 'Overall Compliance Score',
          data: metrics.trends.map(t => t.score),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Framework Scores Bar Chart
    const frameworkData = {
      labels: processedFrameworks.map(f => f.name),
      datasets: [
        {
          label: 'Compliance Score',
          data: processedFrameworks.map(f => f.score),
          backgroundColor: processedFrameworks.map(f => 
            f.score >= 95 ? 'rgba(34, 197, 94, 0.8)' :
            f.score >= 90 ? 'rgba(59, 130, 246, 0.8)' :
            f.score >= 85 ? 'rgba(245, 158, 11, 0.8)' :
            'rgba(239, 68, 68, 0.8)'
          ),
          borderColor: processedFrameworks.map(f => 
            f.score >= 95 ? 'rgb(34, 197, 94)' :
            f.score >= 90 ? 'rgb(59, 130, 246)' :
            f.score >= 85 ? 'rgb(245, 158, 11)' :
            'rgb(239, 68, 68)'
          ),
          borderWidth: 1
        }
      ]
    };

    // Risk Distribution Doughnut
    const riskCounts = processedFrameworks.reduce((acc, f) => {
      acc[f.riskLevel] = (acc[f.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const riskData = {
      labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
      datasets: [
        {
          data: [
            riskCounts.low || 0,
            riskCounts.medium || 0,
            riskCounts.high || 0,
            riskCounts.critical || 0
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(245, 158, 11)',
            'rgb(249, 115, 22)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 2
        }
      ]
    };

    return { trendData, frameworkData, riskData };
  }, [metrics, processedFrameworks]);

  // =============================================================================
  // COMPONENT RENDER
  // =============================================================================

  if (!metrics || !systemHealth || !chartData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Enterprise Compliance Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time compliance monitoring and analytics - Top 0.1% Enterprise Grade
            </p>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Frameworks</option>
              {processedFrameworks.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            
            <button
              onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isRealTimeEnabled
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {isRealTimeEnabled ? '🟢 Live' : '⚫ Paused'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Overall Compliance"
          value={`${metrics.overallScore}%`}
          change="+2.3%"
          trend="up"
          color="blue"
          icon="🏆"
        />
        <KPICard
          title="System Health"
          value={systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
          change={`${systemHealth.responseTime.toFixed(0)}ms`}
          trend="stable"
          color="green"
          icon="💚"
        />
        <KPICard
          title="Active Alerts"
          value={filteredAlerts.length.toString()}
          change={`${filteredAlerts.filter(a => a.level === 'critical').length} critical`}
          trend="down"
          color="orange"
          icon="🚨"
        />
        <KPICard
          title="Audit Ready"
          value={processedFrameworks.filter(f => f.score >= 90).length.toString()}
          change={`of ${processedFrameworks.length} frameworks`}
          trend="up"
          color="purple"
          icon="✅"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Compliance Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Compliance Trend Analysis</h2>
          <div className="h-80">
            <Line
              data={chartData.trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    min: 0,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Risk Distribution</h2>
          <div className="h-80">
            <Doughnut
              data={chartData.riskData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Framework Scores and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Framework Scores */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Framework Compliance Scores</h2>
          <div className="h-80">
            <Bar
              data={chartData.frameworkData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    min: 0,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {filteredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </div>

      {/* AI Predictions */}
      {metrics.predictions.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">🔮 AI Compliance Predictions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.predictions.map((prediction, index) => (
              <PredictionCard key={index} prediction={prediction} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPONENT HELPERS
// =============================================================================

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  color: 'blue' | 'green' | 'orange' | 'purple';
  icon: string;
}

function KPICard({ title, value, change, trend, color, icon }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700'
  };

  const trendIcons = {
    up: '📈',
    down: '📉',
    stable: '➡️'
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className="mr-1">{trendIcons[trend]}</span>
        <span>{change}</span>
      </div>
    </div>
  );
}

interface AlertCardProps {
  alert: ComplianceMetrics['alerts'][0];
}

function AlertCard({ alert }: AlertCardProps) {
  const levelColors = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    critical: 'bg-red-50 border-red-200 text-red-700',
    fatal: 'bg-red-100 border-red-300 text-red-800'
  };

  const levelIcons = {
    info: 'ℹ️',
    warning: '⚠️',
    critical: '🚨',
    fatal: '☢️'
  };

  return (
    <div className={`p-4 rounded-lg border ${levelColors[alert.level]}`}>
      <div className="flex items-start space-x-3">
        <span className="text-lg">{levelIcons[alert.level]}</span>
        <div className="flex-1">
          <h3 className="font-medium">{alert.title}</h3>
          <p className="text-sm opacity-75 mt-1">{alert.description}</p>
          <p className="text-xs mt-2">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

interface PredictionCardProps {
  prediction: ComplianceMetrics['predictions'][0];
}

function PredictionCard({ prediction }: PredictionCardProps) {
  return (
    <div className="p-4 rounded-lg border border-purple-200 bg-purple-50">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-purple-600">🔮</span>
        <h3 className="font-medium text-purple-800">
          {prediction.type.replace(/_/g, ' ').toUpperCase()}
        </h3>
      </div>
      <p className="text-sm text-purple-700 mb-2">{prediction.impact}</p>
      <div className="flex justify-between text-xs text-purple-600">
        <span>Risk: {Math.round(prediction.probability * 100)}%</span>
        <span>{prediction.timeframe}</span>
      </div>
    </div>
  );
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getFrameworkDisplayName(id: string): string {
  const names = {
    soc2: 'SOC 2',
    gdpr: 'GDPR',
    hipaa: 'HIPAA',
    iso27001: 'ISO 27001',
    'pci-dss': 'PCI DSS'
  };
  return names[id as keyof typeof names] || id.toUpperCase();
}

function generateTrendData() {
  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      timestamp: date.toISOString(),
      score: 85 + Math.random() * 10 + (30 - i) * 0.3 // Gradual improvement
    });
  }
  
  return data;
}

function generateAlerts() {
  return [
    {
      id: '1',
      level: 'warning' as const,
      title: 'GDPR Data Retention Review Due',
      description: 'Annual data retention policy review required within 30 days',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      framework: 'gdpr'
    },
    {
      id: '2',
      level: 'info' as const,
      title: 'SOC 2 Audit Preparation',
      description: 'Quarterly SOC 2 documentation review completed successfully',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      framework: 'soc2'
    },
    {
      id: '3',
      level: 'critical' as const,
      title: 'Access Control Anomaly Detected',
      description: 'Unusual privileged access pattern detected - immediate review required',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      framework: 'iso27001'
    }
  ];
}

function generatePredictions() {
  return [
    {
      type: 'audit_risk' as const,
      probability: 0.25,
      timeframe: 'Next 6 months',
      impact: 'Potential audit findings in access management controls'
    },
    {
      type: 'compliance_degradation' as const,
      probability: 0.15,
      timeframe: 'Next quarter',
      impact: 'GDPR compliance score may decrease due to policy updates'
    },
    {
      type: 'risk_increase' as const,
      probability: 0.35,
      timeframe: 'Next 3 months',
      impact: 'Increased security risk due to planned infrastructure changes'
    }
  ];
}