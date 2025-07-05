import { Metadata } from 'next';
import { Suspense } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { ComplianceScoreCard } from '@/components/dashboard/compliance-score-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { ComplianceMetrics } from '@/components/dashboard/compliance-metrics';
import { AIInsights } from '@/components/dashboard/ai-insights';
import { WorkflowStatus } from '@/components/dashboard/workflow-status';
import { SecurityAlerts } from '@/components/dashboard/security-alerts';
import { TeamPerformance } from '@/components/dashboard/team-performance';
import { IntegrationStatus } from '@/components/dashboard/integration-status';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { requireAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Dashboard - ComplianceOS',
  description: 'Comprehensive compliance management dashboard with real-time insights, AI-powered analytics, and workflow automation.',
};

export default async function DashboardPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHeader
          title="Compliance Dashboard"
          description="Monitor your organization's compliance status with real-time insights and AI-powered analytics"
        />

        {/* Top metrics row */}
        <div className="grid gap-6 lg:grid-cols-4">
          <Suspense fallback={<LoadingSpinner />}>
            <ComplianceScoreCard />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <ComplianceMetrics />
          </Suspense>
        </div>

        {/* AI Insights and Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<LoadingSpinner />}>
              <AIInsights />
            </Suspense>
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Workflow Status and Security Alerts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<LoadingSpinner />}>
            <WorkflowStatus />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <SecurityAlerts />
          </Suspense>
        </div>

        {/* Recent Activity and Upcoming Deadlines */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<LoadingSpinner />}>
            <RecentActivity />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <UpcomingDeadlines />
          </Suspense>
        </div>

        {/* Team Performance and Integration Status */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<LoadingSpinner />}>
            <TeamPerformance />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <IntegrationStatus />
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  );
}