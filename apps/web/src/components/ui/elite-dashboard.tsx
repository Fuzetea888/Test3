/**
 * Elite Dashboard - Top 0.1% Enterprise Interface
 * Ultra-sophisticated dashboard with advanced visualizations and real-time data
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';

// =============================================================================
// ADVANCED METRICS CARDS
// =============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  description?: string;
  realTime?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  trendValue,
  icon,
  color,
  description,
  realTime = false
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (typeof value === 'number') {
      const timer = setTimeout(() => {
        let start = 0;
        const end = value;
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const current = start + (end - start) * easeOutCubic(progress);
          setAnimatedValue(current);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [value]);

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 border-blue-200',
    green: 'from-green-500 to-green-600 border-green-200',
    red: 'from-red-500 to-red-600 border-red-200',
    purple: 'from-purple-500 to-purple-600 border-purple-200',
    orange: 'from-orange-500 to-orange-600 border-orange-200'
  };

  const trendIcon = trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '➡️';
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className={`
      bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 
      transform transition-all duration-500 hover:scale-105 hover:shadow-3xl
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
      relative overflow-hidden group
    `}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5 group-hover:opacity-10 transition-opacity`} />
      
      {/* Real-time indicator */}
      {realTime && (
        <div className="absolute top-4 right-4 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
          <span className="text-xs text-gray-500 font-medium">LIVE</span>
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            {title}
          </h3>
          <div className="text-2xl">{icon}</div>
        </div>

        {/* Value */}
        <div className="mb-3">
          <div className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? 
              animatedValue.toFixed(typeof value % 1 === 0 ? 0 : 1) : 
              value
            }
            {typeof value === 'number' && value <= 100 && '%'}
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {/* Trend */}
        <div className={`flex items-center text-sm ${trendColor} font-medium`}>
          <span className="mr-1">{trendIcon}</span>
          <span>{Math.abs(trendValue)}%</span>
          <span className="text-gray-400 ml-1">vs last month</span>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// ADVANCED CHART COMPONENT
// =============================================================================

interface ChartData {
  date: string;
  value: number;
  label?: string;
}

interface AdvancedChartProps {
  data: ChartData[];
  title: string;
  type: 'line' | 'area' | 'bar';
  color: string;
  height?: number;
}

const AdvancedChart: React.FC<AdvancedChartProps> = ({
  data,
  title,
  type = 'line',
  color = '#3B82F6',
  height = 300
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const width = rect.width;
    const padding = 40;

    // Clear previous content
    svg.innerHTML = '';

    // Calculate scales
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const xScale = (width - 2 * padding) / (data.length - 1);
    const yScale = (height - 2 * padding) / (maxValue - minValue);

    // Create gradient
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'chartGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', color);
    stop1.setAttribute('stop-opacity', '0.8');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', color);
    stop2.setAttribute('stop-opacity', '0.1');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Create path for line/area chart
    if (type === 'line' || type === 'area') {
      const pathData = data.map((point, index) => {
        const x = padding + index * xScale;
        const y = height - padding - (point.value - minValue) * yScale;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');

      if (type === 'area') {
        // Area path
        const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const areaData = pathData + ` L ${padding + (data.length - 1) * xScale} ${height - padding} L ${padding} ${height - padding} Z`;
        areaPath.setAttribute('d', areaData);
        areaPath.setAttribute('fill', 'url(#chartGradient)');
        areaPath.setAttribute('stroke', 'none');
        svg.appendChild(areaPath);
      }

      // Line path
      const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      linePath.setAttribute('d', pathData);
      linePath.setAttribute('fill', 'none');
      linePath.setAttribute('stroke', color);
      linePath.setAttribute('stroke-width', '3');
      linePath.setAttribute('stroke-linecap', 'round');
      linePath.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(linePath);

      // Add points
      data.forEach((point, index) => {
        const x = padding + index * xScale;
        const y = height - padding - (point.value - minValue) * yScale;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x.toString());
        circle.setAttribute('cy', y.toString());
        circle.setAttribute('r', hoveredPoint === index ? '6' : '4');
        circle.setAttribute('fill', color);
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', '2');
        circle.style.cursor = 'pointer';
        circle.style.transition = 'all 0.3s ease';

        circle.addEventListener('mouseenter', () => setHoveredPoint(index));
        circle.addEventListener('mouseleave', () => setHoveredPoint(null));

        svg.appendChild(circle);
      });
    }

    // Add grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * (height - 2 * padding)) / 5;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.toString());
      line.setAttribute('y1', y.toString());
      line.setAttribute('x2', (width - padding).toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', '#E5E7EB');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.5');
      svg.appendChild(line);
    }

  }, [data, type, color, height, hoveredPoint]);

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm text-gray-500">Real-time data</span>
        </div>
      </div>
      
      <div className="relative">
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          className="overflow-visible"
        />
        
        {/* Tooltip */}
        {hoveredPoint !== null && (
          <div className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium">
            <div>{data[hoveredPoint].label || data[hoveredPoint].date}</div>
            <div className="font-bold">{data[hoveredPoint].value}%</div>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// AI INSIGHTS PANEL
// =============================================================================

interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
}

const AIInsightsPanel: React.FC = () => {
  const [insights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'prediction',
      title: 'Compliance Score Trend',
      description: 'AI predicts 15% improvement in compliance score over next quarter based on current training completion rates.',
      confidence: 94,
      priority: 'high',
      timeframe: '3 months'
    },
    {
      id: '2',
      type: 'alert',
      title: 'Regulatory Change Detected',
      description: 'New GDPR guidelines may impact current data processing procedures. Review recommended.',
      confidence: 89,
      priority: 'critical',
      timeframe: '2 weeks'
    },
    {
      id: '3',
      type: 'opportunity',
      title: 'Automation Potential',
      description: 'Document review process can be automated, saving approximately 12 hours weekly.',
      confidence: 97,
      priority: 'medium',
      timeframe: '1 month'
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return '🔮';
      case 'recommendation': return '💡';
      case 'alert': return '⚠️';
      case 'opportunity': return '🚀';
      default: return '🤖';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          🤖 AI Insights
          <span className="ml-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-2xl border-2 ${getPriorityColor(insight.priority)} transition-all duration-300 hover:shadow-lg`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <span className="text-xl mr-3">{getTypeIcon(insight.type)}</span>
                <h4 className="font-semibold text-gray-900">{insight.title}</h4>
              </div>
              <div className="text-xs bg-white px-2 py-1 rounded-full font-medium">
                {insight.confidence}% confidence
              </div>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {insight.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Timeframe: {insight.timeframe}</span>
              <span className="capitalize font-medium">{insight.priority} priority</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// MAIN ELITE DASHBOARD
// =============================================================================

export const EliteDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock real-time data
  const complianceData: ChartData[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    value: 85 + Math.random() * 10 + Math.sin(i / 7) * 5,
    label: `Day ${i + 1}`
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Elite Compliance Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Real-time insights powered by Llama 3.1 Nemotron Ultra AI
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Last updated</div>
              <div className="text-lg font-semibold text-gray-900">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                <span className="text-sm text-gray-600">System Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Compliance Score"
            value={94.2}
            trend="up"
            trendValue={5.2}
            icon="🎯"
            color="blue"
            description="Overall compliance rating"
            realTime
          />
          <MetricCard
            title="Active Violations"
            value={23}
            trend="down"
            trendValue={18.5}
            icon="⚠️"
            color="red"
            description="Requiring immediate attention"
            realTime
          />
          <MetricCard
            title="Training Completion"
            value={87.5}
            trend="up"
            trendValue={12.3}
            icon="🎓"
            color="green"
            description="Staff training progress"
            realTime
          />
          <MetricCard
            title="AI Efficiency"
            value={96.8}
            trend="up"
            trendValue={8.7}
            icon="🤖"
            color="purple"
            description="Automation performance"
            realTime
          />
        </div>

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <AdvancedChart
              data={complianceData}
              title="Compliance Trends (30 Days)"
              type="area"
              color="#3B82F6"
              height={400}
            />
          </div>
          
          <div>
            <AIInsightsPanel />
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* System Status */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              🖥️ System Status
            </h3>
            <div className="space-y-3">
              {[
                { name: 'API Gateway', status: 'operational', uptime: '99.99%' },
                { name: 'AI Engine', status: 'operational', uptime: '99.97%' },
                { name: 'Database', status: 'operational', uptime: '99.98%' },
                { name: 'Notifications', status: 'operational', uptime: '99.95%' }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                    <span className="font-medium text-gray-900">{service.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{service.uptime}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              📊 Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { action: 'AI Risk Assessment', time: '2 min ago', status: 'completed' },
                { action: 'Document Review', time: '5 min ago', status: 'completed' },
                { action: 'Compliance Scan', time: '12 min ago', status: 'completed' },
                { action: 'Training Reminder', time: '18 min ago', status: 'sent' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div>
                    <div className="font-medium text-gray-900">{activity.action}</div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              ⚡ Quick Actions
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Run AI Analysis', icon: '🤖', color: 'bg-blue-500' },
                { name: 'Generate Report', icon: '📊', color: 'bg-green-500' },
                { name: 'Schedule Audit', icon: '📅', color: 'bg-purple-500' },
                { name: 'Send Notifications', icon: '🔔', color: 'bg-orange-500' }
              ].map((action, index) => (
                <button
                  key={index}
                  className={`w-full p-4 ${action.color} text-white rounded-2xl font-medium hover:opacity-90 transform hover:scale-105 transition-all duration-200 flex items-center`}
                >
                  <span className="mr-3 text-xl">{action.icon}</span>
                  {action.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};