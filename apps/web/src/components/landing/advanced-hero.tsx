'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Play, 
  Shield, 
  Zap, 
  TrendingUp, 
  Users,
  Clock,
  CheckCircle,
  Sparkles,
  Brain,
  Gauge,
  Target
} from 'lucide-react';

// Live data simulation
const useLiveData = () => {
  const [data, setData] = useState({
    violationsReduced: 95.7,
    timesSaved: 847,
    companiesServed: 12847,
    complianceScore: 97.3,
    costsReduced: 68.2,
    activeUsers: 23456
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        violationsReduced: Math.min(99.9, prev.violationsReduced + Math.random() * 0.1),
        timesSaved: prev.timesSaved + Math.floor(Math.random() * 3),
        companiesServed: prev.companiesServed + Math.floor(Math.random() * 2),
        complianceScore: Math.min(99.9, prev.complianceScore + (Math.random() - 0.5) * 0.2),
        costsReduced: Math.min(99.9, prev.costsReduced + Math.random() * 0.1),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return data;
};

// Animated number component
const AnimatedNumber = ({ value, suffix = '', prefix = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="font-mono">
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

// Floating metrics cards
const MetricCard = ({ icon: Icon, label, value, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ 
      duration: 0.8, 
      delay,
      type: "spring",
      stiffness: 100
    }}
    className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 shadow-2xl"
  >
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-white/80 font-medium">{label}</p>
        <p className="text-lg font-bold text-white">
          <AnimatedNumber value={value} />
          {trend && (
            <span className="text-green-400 text-sm ml-1">
              +{trend}%
            </span>
          )}
        </p>
      </div>
    </div>
  </motion.div>
);

// AI-powered insights component
const AIInsight = ({ insight, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay }}
    className="flex items-start space-x-3 backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10"
  >
    <div className="flex-shrink-0">
      <div className="p-1.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg">
        <Brain className="h-4 w-4 text-emerald-400" />
      </div>
    </div>
    <div>
      <p className="text-sm text-white/90 leading-relaxed">{insight}</p>
    </div>
  </motion.div>
);

// Interactive dashboard preview
const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const liveData = useLiveData();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Gauge },
    { id: 'risk', label: 'Risk Analysis', icon: Shield },
    { id: 'performance', label: 'Performance', icon: TrendingUp }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="relative max-w-4xl mx-auto"
    >
      {/* Dashboard mockup */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <h3 className="text-white font-semibold">ComplianceOS Dashboard</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-white/70">Live</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-4 bg-black/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white/80 hover:bg-white/10'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-4"
            >
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Compliance Score</p>
                    <p className="text-2xl font-bold text-white">
                      <AnimatedNumber value={liveData.complianceScore} decimals={1} suffix="%" />
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Violations Reduced</p>
                    <p className="text-2xl font-bold text-white">
                      <AnimatedNumber value={liveData.violationsReduced} decimals={1} suffix="%" />
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Hours Saved</p>
                    <p className="text-2xl font-bold text-white">
                      <AnimatedNumber value={liveData.timesSaved} />
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'risk' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">Risk Assessment</h4>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Low Risk
                </Badge>
              </div>
              
              <div className="space-y-3">
                {[
                  { name: 'Data Protection', score: 96, color: 'emerald' },
                  { name: 'Staff Training', score: 89, color: 'blue' },
                  { name: 'Documentation', score: 94, color: 'emerald' },
                  { name: 'Monitoring', score: 92, color: 'emerald' }
                ].map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">{item.name}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-500`}
                        />
                      </div>
                      <span className="text-white text-sm font-medium w-10">
                        {item.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating action button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="absolute -bottom-4 -right-4 p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
      >
        <Play className="h-6 w-6 text-white" />
      </motion.button>
    </motion.div>
  );
};

export const AdvancedHero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const liveData = useLiveData();

  const [currentInsight, setCurrentInsight] = useState(0);
  
  const insights = [
    "AI detected 3 potential compliance risks in your industry this week",
    "Predicted 23% reduction in audit time with automated workflows",
    "Regulatory change alert: New GDPR guidelines affecting 89% of clients",
    "Smart recommendation: Update training protocols for maximum efficiency"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(147,51,234,0.2),transparent_50%)]" />
        
        {/* Animated particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left content */}
          <motion.div
            style={{ y: y1 }}
            className="space-y-8"
          >
            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center space-x-4 text-sm"
            >
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Top 0.1% Platform
              </Badge>
              <div className="flex items-center space-x-2 text-white/70">
                <Shield className="h-4 w-4" />
                <span>SOC 2 Type II Certified</span>
              </div>
            </motion.div>

            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                AI-Powered
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                  Compliance
                </span>
                <span className="block">Revolution</span>
              </h1>
              
              <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
                Transform compliance from a cost center into a competitive advantage. 
                Our Llama 3.1 Nemotron Ultra AI reduces violations by{' '}
                <span className="text-emerald-400 font-semibold">
                  <AnimatedNumber value={liveData.violationsReduced} decimals={1} suffix="%" />
                </span>{' '}
                and saves{' '}
                <span className="text-blue-400 font-semibold">
                  <AnimatedNumber value={liveData.timesSaved} suffix=" hours" />
                </span>{' '}
                monthly.
              </p>
            </motion.div>

            {/* Live AI insights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-400" />
                <span className="text-white/90 font-medium">Live AI Insights</span>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              </div>
              
              <AIInsight insight={insights[currentInsight]} />
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 group"
              >
                <span className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Live metrics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="grid grid-cols-3 gap-4 pt-8"
            >
              <MetricCard
                icon={Users}
                label="Companies Served"
                value={liveData.companiesServed}
                delay={0.2}
              />
              <MetricCard
                icon={TrendingUp}
                label="Cost Reduction"
                value={liveData.costsReduced}
                trend={12}
                delay={0.4}
              />
              <MetricCard
                icon={Zap}
                label="Active Users"
                value={liveData.activeUsers}
                delay={0.6}
              />
            </motion.div>
          </motion.div>

          {/* Right content - Interactive Dashboard */}
          <motion.div
            style={{ y: y2 }}
            className="relative"
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};