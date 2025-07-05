'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Users,
  FileText,
  Zap,
  Brain,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Bell,
  Settings,
  Download,
  Share,
  Maximize,
  Filter,
  Search,
  Eye,
  EyeOff,
  RefreshCw,
  MessageCircle,
  Camera,
  FileImage,
  Gauge
} from 'lucide-react';

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================

const generateTimeSeriesData = (days: number = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      compliance_score: 85 + Math.random() * 10 + Math.sin(i / 7) * 5,
      violations: Math.max(0, Math.floor(Math.random() * 5)),
      training_completion: 75 + Math.random() * 20,
      document_currency: 90 + Math.random() * 8,
      risk_level: Math.random() * 100,
      efficiency: 70 + Math.random() * 25
    });
  }
  
  return data;
};

const generateSectorData = () => [
  { sector: 'Healthcare', score: 94, count: 156, trend: 'up' },
  { sector: 'Dental', score: 91, count: 89, trend: 'up' },
  { sector: 'Restaurant', score: 87, count: 203, trend: 'stable' },
  { sector: 'Laboratory', score: 96, count: 67, trend: 'up' },
  { sector: 'Manufacturing', score: 83, count: 124, trend: 'down' }
];

const generateViolationData = () => [
  { type: 'Data Protection', count: 12, severity: 'high', change: -23 },
  { type: 'Staff Training', count: 8, severity: 'medium', change: -15 },
  { type: 'Documentation', count: 5, severity: 'low', change: -45 },
  { type: 'Safety Protocols', count: 15, severity: 'critical', change: -8 },
  { type: 'Audit Compliance', count: 3, severity: 'medium', change: -67 }
];

// =============================================================================
// ADVANCED COMPONENTS
// =============================================================================

const RealTimeMetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue',
  trend = 'up',
  description,
  actionable = false 
}) => {
  const [isLive, setIsLive] = useState(true);
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      const variance = Math.random() * 4 - 2; // ±2% variance
      setCurrentValue(prev => Math.max(0, Math.min(100, prev + variance)));
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5 group-hover:opacity-10 transition-opacity`} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {isLive && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
          <Icon className={`h-4 w-4 text-${color}-500`} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold">
              {typeof currentValue === 'number' ? currentValue.toFixed(1) : currentValue}
              {typeof value === 'number' && value <= 100 && '%'}
            </div>
            {change && (
              <div className={`flex items-center text-sm ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(change)}%
              </div>
            )}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          
          {actionable && (
            <Button variant="ghost" size="sm" className="w-full mt-2 h-8 text-xs">
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AdvancedChart = ({ 
  title, 
  data, 
  type = 'line', 
  height = 300,
  showControls = true,
  interactive = true 
}) => {
  const [chartType, setChartType] = useState(type);
  const [timeRange, setTimeRange] = useState('30d');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const renderChart = () => {
    const commonProps = {
      data,
      width: '100%',
      height
    };

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="compliance_score" 
                stroke="#3B82F6" 
                fill="url(#colorCompliance)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="compliance_score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="compliance_score" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#3B82F6' }}
                activeDot={{ r: 6, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="1y">1 Year</option>
              </select>
              
              <div className="flex border rounded">
                <button
                  onClick={() => setChartType('line')}
                  className={`p-1 ${chartType === 'line' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                >
                  <Activity className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`p-1 ${chartType === 'area' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-1 ${chartType === 'bar' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
              </div>
              
              <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

const AIInsightsPanel = () => {
  const [insights, setInsights] = useState([
    {
      id: 1,
      type: 'prediction',
      severity: 'medium',
      title: 'Predicted Compliance Risk',
      description: 'AI detected potential GDPR violation risk in customer data handling processes',
      confidence: 87,
      timeframe: '2-3 weeks',
      actions: ['Review data processing procedures', 'Update privacy policies', 'Train customer service team']
    },
    {
      id: 2,
      type: 'opportunity',
      severity: 'low',
      title: 'Automation Opportunity',
      description: 'Training completion tracking can be automated to save 12 hours weekly',
      confidence: 94,
      timeframe: '1 week',
      actions: ['Implement automated tracking', 'Setup notification system', 'Create progress dashboard']
    },
    {
      id: 3,
      type: 'anomaly',
      severity: 'high',
      title: 'Unusual Pattern Detected',
      description: 'Compliance score dropped 15% in laboratory sector - investigate immediately',
      confidence: 96,
      timeframe: 'immediate',
      actions: ['Contact laboratory compliance officer', 'Schedule emergency audit', 'Review recent changes']
    }
  ]);

  const severityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500', 
    high: 'bg-red-500',
    critical: 'bg-red-700'
  };

  const typeIcons = {
    prediction: Target,
    opportunity: TrendingUp,
    anomaly: AlertTriangle,
    recommendation: Brain
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span>AI Insights</span>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {insights.map((insight) => {
          const Icon = typeIcons[insight.type] || Brain;
          
          return (
            <div key={insight.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className={`w-3 h-3 rounded-full ${severityColors[insight.severity]} mt-2`} />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{insight.title}</span>
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Timeframe: {insight.timeframe}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      View Actions
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        <Button variant="outline" className="w-full">
          <Eye className="h-4 w-4 mr-2" />
          View All Insights
        </Button>
      </CardContent>
    </Card>
  );
};

const ComplianceHeatmap = () => {
  const heatmapData = [
    { day: 'Mon', hour: '08', violations: 0, score: 95 },
    { day: 'Mon', hour: '12', violations: 2, score: 87 },
    { day: 'Mon', hour: '16', violations: 1, score: 91 },
    { day: 'Tue', hour: '08', violations: 0, score: 94 },
    { day: 'Tue', hour: '12', violations: 3, score: 82 },
    { day: 'Tue', hour: '16', violations: 0, score: 96 },
    // ... more data
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Compliance Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-xs font-medium p-2">
              {day}
            </div>
          ))}
          
          {Array.from({ length: 7 * 24 }).map((_, index) => {
            const intensity = Math.random();
            const color = intensity > 0.7 ? 'bg-red-500' : 
                         intensity > 0.4 ? 'bg-yellow-500' : 'bg-green-500';
            
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded ${color} opacity-${Math.floor(intensity * 10)}`}
                title={`${Math.floor(index / 24)} violations`}
              />
            );
          })}
        </div>
        
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Less violations</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded opacity-30" />
            <div className="w-3 h-3 bg-green-500 rounded opacity-50" />
            <div className="w-3 h-3 bg-yellow-500 rounded opacity-70" />
            <div className="w-3 h-3 bg-red-500 rounded opacity-90" />
          </div>
          <span>More violations</span>
        </div>
      </CardContent>
    </Card>
  );
};

// =============================================================================
// MAIN DASHBOARD COMPONENT
// =============================================================================

export const AdvancedDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeSeriesData] = useState(() => generateTimeSeriesData());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Compliance Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time insights powered by Llama 3.1 Nemotron Ultra AI
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RealTimeMetricCard
            title="Overall Compliance Score"
            value={94.2}
            change={+2.3}
            icon={Gauge}
            color="blue"
            description="Based on 147 compliance checkpoints"
            actionable
          />
          <RealTimeMetricCard
            title="Active Violations"
            value={23}
            change={-15.8}
            icon={AlertTriangle}
            color="red"
            description="3 critical, 8 high, 12 medium"
            actionable
          />
          <RealTimeMetricCard
            title="Training Completion"
            value={87.5}
            change={+5.2}
            icon={Users}
            color="green"
            description="156 of 178 staff members"
            actionable
          />
          <RealTimeMetricCard
            title="Documents Current"
            value={96.1}
            change={+1.8}
            icon={FileText}
            color="purple"
            description="342 of 356 documents up to date"
            actionable
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AdvancedChart
                  title="Compliance Trends"
                  data={timeSeriesData}
                  type="area"
                  height={400}
                />
              </div>
              <div className="space-y-6">
                <AIInsightsPanel />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComplianceHeatmap />
              
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { time: '2 min ago', action: 'Policy updated', user: 'Sarah Chen', status: 'success' },
                    { time: '15 min ago', action: 'Training completed', user: 'Mike Johnson', status: 'success' },
                    { time: '1 hour ago', action: 'Violation reported', user: 'System Alert', status: 'warning' },
                    { time: '2 hours ago', action: 'Audit scheduled', user: 'Jennifer Walsh', status: 'info' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-yellow-500' :
                        activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdvancedChart
                title="Violation Trends by Type"
                data={timeSeriesData}
                type="bar"
                height={350}
              />
              <AdvancedChart
                title="Training Completion Rate"
                data={timeSeriesData}
                type="line"
                height={350}
              />
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Real-time Monitoring</h3>
              <p className="text-muted-foreground">
                Advanced monitoring features coming soon...
              </p>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIInsightsPanel />
              
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced AI Analysis</h3>
                    <p className="text-muted-foreground">
                      Detailed AI insights and recommendations coming soon...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};