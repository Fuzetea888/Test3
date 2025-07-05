'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Brain,
  Target,
  Zap,
  Clock,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComplianceScoreCardProps {
  className?: string;
}

interface ScoreData {
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
  nextReview: Date;
}

interface Insight {
  id: string;
  type: 'opportunity' | 'risk' | 'achievement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

const mockScoreData: ScoreData = {
  current: 94.2,
  previous: 91.8,
  trend: 'up',
  change: 2.4,
  riskLevel: 'low',
  lastUpdated: new Date(),
  nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
};

const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Automate HIPAA assessments',
    description: 'AI detected 15 manual processes that can be automated to improve efficiency',
    impact: 'high',
    actionable: true,
  },
  {
    id: '2',
    type: 'achievement',
    title: 'ISO 27001 readiness at 98%',
    description: 'Your organization is ready for ISO 27001 certification',
    impact: 'high',
    actionable: false,
  },
  {
    id: '3',
    type: 'risk',
    title: 'Pending policy updates',
    description: '3 policies require review due to recent regulatory changes',
    impact: 'medium',
    actionable: true,
  },
];

export function ComplianceScoreCard({ className }: ComplianceScoreCardProps) {
  const [scoreData, setScoreData] = useState<ScoreData>(mockScoreData);
  const [insights, setInsights] = useState<Insight[]>(mockInsights);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [currentInsight, setCurrentInsight] = useState(0);

  // Animate score counter
  useEffect(() => {
    const timer = setTimeout(() => {
      const increment = scoreData.current / 50;
      const interval = setInterval(() => {
        setAnimatedScore(prev => {
          const next = prev + increment;
          if (next >= scoreData.current) {
            clearInterval(interval);
            return scoreData.current;
          }
          return next;
        });
      }, 20);
      
      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(timer);
  }, [scoreData.current]);

  // Cycle through insights
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsight(prev => (prev + 1) % insights.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [insights.length]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Zap className="w-4 h-4 text-blue-600" />;
      case 'achievement': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'risk': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default: return <Brain className="w-4 h-4 text-purple-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className={cn('p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Compliance Score</h3>
            <p className="text-sm text-muted-foreground">AI-powered assessment</p>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" className="gap-2">
          <BarChart3 className="w-4 h-4" />
          Details
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Score Display */}
      <div className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="space-y-1">
            <motion.div 
              className={cn('text-4xl font-bold', getScoreColor(scoreData.current))}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {animatedScore.toFixed(1)}%
            </motion.div>
            <div className="flex items-center gap-2">
              {scoreData.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : scoreData.trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-red-600" />
              ) : null}
              <span className={cn(
                'text-sm font-medium',
                scoreData.trend === 'up' ? 'text-green-600' : 
                scoreData.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              )}>
                {scoreData.trend === 'up' ? '+' : scoreData.trend === 'down' ? '-' : ''}
                {scoreData.change}% from last month
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to 100%</span>
              <span className="font-medium">{100 - scoreData.current}% to go</span>
            </div>
            <Progress value={scoreData.current} className="h-2" />
          </div>
        </div>

        {/* Risk Level */}
        <div className="flex items-center justify-between">
          <Badge className={cn('border', getRiskLevelColor(scoreData.riskLevel))}>
            {scoreData.riskLevel.toUpperCase()} RISK
          </Badge>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Next review in 7 days</span>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium">AI Insights</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentInsight}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-muted/50 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-start gap-3">
              {getInsightIcon(insights[currentInsight].type)}
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-medium">
                  {insights[currentInsight].title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {insights[currentInsight].description}
                </p>
              </div>
              {insights[currentInsight].actionable && (
                <Button size="sm" variant="outline">
                  Act
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs',
                  insights[currentInsight].impact === 'high' ? 'border-red-200 text-red-700' :
                  insights[currentInsight].impact === 'medium' ? 'border-yellow-200 text-yellow-700' :
                  'border-gray-200 text-gray-700'
                )}
              >
                {insights[currentInsight].impact} impact
              </Badge>
              
              {/* Insight indicators */}
              <div className="flex gap-1 ml-auto">
                {insights.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      index === currentInsight ? 'bg-primary' : 'bg-muted'
                    )}
                    onClick={() => setCurrentInsight(index)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button size="sm" className="flex-1">
          View Report
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          Schedule Review
        </Button>
      </div>
    </Card>
  );
}