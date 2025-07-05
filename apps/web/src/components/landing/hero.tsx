'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Brain, 
  Zap, 
  TrendingUp,
  Users,
  Award,
  Play
} from 'lucide-react';

interface HeroProps {}

const stats = [
  { label: 'Enterprise Clients', value: '10K+', icon: Users },
  { label: 'Compliance Score Avg', value: '98.2%', icon: TrendingUp },
  { label: 'Automated Tasks', value: '2M+', icon: Zap },
  { label: 'Certifications', value: 'SOC2, ISO27001', icon: Award },
];

const sectors = [
  'Dental Practices',
  'Restaurants', 
  'Laboratories',
  'Healthcare Facilities',
  'Manufacturing',
  'Financial Services'
];

export function Hero({}: HeroProps) {
  const [currentSector, setCurrentSector] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSector((prev) => (prev + 1) % sectors.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="inline-flex items-center gap-2 px-4 py-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">SOC 2 Type II Certified</span>
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI-Powered
                </span>
                <br />
                Compliance
                <br />
                Management
              </h1>
              
              <div className="text-xl lg:text-2xl text-muted-foreground">
                Transform compliance operations for{' '}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentSector}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="font-semibold text-primary"
                  >
                    {sectors[currentSector]}
                  </motion.span>
                </AnimatePresence>
                <br />
                with intelligent automation & real-time monitoring
              </div>
            </motion.div>

            {/* Value Props */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-3"
            >
              {[
                'Reduce compliance costs by 60% with AI automation',
                'Real-time regulatory intelligence & updates',
                'Enterprise-grade security & audit trails'
              ].map((text, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-muted-foreground">{text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" className="group">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setIsVideoPlaying(true)}
                className="group"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                    <stat.icon className="w-4 h-4 text-primary" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Dashboard Preview */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border overflow-hidden">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 p-4 bg-gray-100 dark:bg-gray-800 border-b">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground bg-white dark:bg-gray-700 rounded px-3 py-1 inline-block">
                    app.complianceos.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Compliance Dashboard</h3>
                    <p className="text-sm text-muted-foreground">Real-time compliance monitoring</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium">AI Active</span>
                  </div>
                </div>

                {/* Compliance Score */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Compliance Score</span>
                    <span className="text-2xl font-bold text-green-600">94.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '94.2%' }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                    />
                  </div>
                </div>

                {/* Mini Charts */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Risk Level', value: 'Low', color: 'green' },
                    { label: 'Active Tasks', value: '12', color: 'blue' },
                    { label: 'Overdue', value: '2', color: 'red' },
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                      <div className={`text-lg font-bold text-${item.color}-600`}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Recent AI Insights</h4>
                  {[
                    { text: 'New HIPAA regulation detected', time: '2 min ago', type: 'alert' },
                    { text: 'Workflow optimization suggested', time: '1 hour ago', type: 'suggestion' },
                    { text: 'Compliance training completed', time: '3 hours ago', type: 'success' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 text-xs">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'alert' ? 'bg-red-500' :
                        activity.type === 'suggestion' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <span className="flex-1">{activity.text}</span>
                      <span className="text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 1, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-4 -left-4 bg-primary/10 backdrop-blur-sm rounded-lg p-4 border"
            >
              <Brain className="w-8 h-8 text-primary" />
            </motion.div>

            <motion.div
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -1, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-4 -right-4 bg-green-500/10 backdrop-blur-sm rounded-lg p-4 border"
            >
              <Shield className="w-8 h-8 text-green-600" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-4xl mx-4 aspect-video bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                className="w-full h-full"
                controls
                autoPlay
                src="/demo-video.mp4"
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}