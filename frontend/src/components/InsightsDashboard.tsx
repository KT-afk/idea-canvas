/**
 * InsightsDashboard
 * Epic 8, Story 8.5: Idea Lifecycle Analytics Dashboard
 *
 * A dialog showing meaningful lifecycle metrics — not vanity numbers.
 * Focus: how ideas are progressing, graduating, and connecting.
 */

import { useQuery } from '@tanstack/react-query';
import { BarChart3, Lightbulb, ClipboardList, Archive, GitBranch, Repeat2, GraduationCap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { fetchAnalytics, type AnalyticsData } from '../services/analyticsService';

interface InsightsDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}

function StatCard({ icon: Icon, label, value, sub, accent = 'bg-primary/10 text-primary' }: StatCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-card p-4">
      <div className={`flex-shrink-0 rounded-md p-2 ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function LifecycleBar({ data }: { data: AnalyticsData }) {
  const total = data.activeIdeas + data.archivedIdeas + data.graduatedIdeas;
  if (total === 0) return null;

  const activeW = Math.round((data.activeIdeas / total) * 100);
  const archivedW = Math.round((data.archivedIdeas / total) * 100);
  const graduatedW = 100 - activeW - archivedW;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Idea lifecycle breakdown
      </p>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted gap-0.5">
        {activeW > 0 && (
          <div
            className="h-full bg-yellow-400 transition-all"
            style={{ width: `${activeW}%` }}
            title={`Active: ${data.activeIdeas}`}
          />
        )}
        {archivedW > 0 && (
          <div
            className="h-full bg-muted-foreground/40 transition-all"
            style={{ width: `${archivedW}%` }}
            title={`Archived: ${data.archivedIdeas}`}
          />
        )}
        {graduatedW > 0 && (
          <div
            className="h-full bg-amber-400 transition-all"
            style={{ width: `${graduatedW}%` }}
            title={`Graduated: ${data.graduatedIdeas}`}
          />
        )}
      </div>
      <div className="flex gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-yellow-400" /> Active ({data.activeIdeas})</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40" /> Archived ({data.archivedIdeas})</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-amber-400" /> Graduated ({data.graduatedIdeas})</span>
      </div>
    </div>
  );
}

function EmptyInsights() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-3 text-muted-foreground">
      <BarChart3 className="w-10 h-10 opacity-30" />
      <p className="text-sm font-medium">No data yet</p>
      <p className="text-xs max-w-[200px]">Start adding ideas and plans — your lifecycle stats will appear here.</p>
    </div>
  );
}

export function InsightsDashboard({ open, onOpenChange }: InsightsDashboardProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    enabled: open, // Only fetch when dashboard is open
    staleTime: 30_000, // 30s cache — analytics don't need to be live
  });

  const isEmpty = data && data.totalItems === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Idea Insights
          </DialogTitle>
          <DialogDescription>
            A snapshot of your idea lifecycle — how many are active, archived, and graduating to plans.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground animate-pulse">Loading insights…</div>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-destructive">Failed to load insights. Try again later.</div>
          </div>
        )}

        {data && isEmpty && <EmptyInsights />}

        {data && !isEmpty && (
          <div className="space-y-5 pt-1">
            {/* Lifecycle Bar */}
            <LifecycleBar data={data} />

            {/* Key stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Lightbulb}
                label="Total ideas"
                value={data.totalIdeas}
                sub={`${data.activeIdeas} active`}
                accent="bg-yellow-400/20 text-yellow-600"
              />
              <StatCard
                icon={GraduationCap}
                label="Graduated to plans"
                value={data.graduationEvents}
                sub={data.graduationEvents === 1 ? '1 graduation event' : `${data.graduationEvents} graduation events`}
                accent="bg-amber-400/20 text-amber-600"
              />
              <StatCard
                icon={ClipboardList}
                label="Active plans"
                value={data.activePlans}
                sub={`${data.totalPlans} plans total`}
                accent="bg-blue-400/20 text-blue-600"
              />
              <StatCard
                icon={Archive}
                label="Archived items"
                value={data.totalArchivedAll}
                sub="across all types"
                accent="bg-muted text-muted-foreground"
              />
              <StatCard
                icon={GitBranch}
                label="Connections made"
                value={data.totalConnections}
                sub={`${data.connectedNotes} cards connected`}
                accent="bg-sky-400/20 text-sky-600"
              />
              <StatCard
                icon={Repeat2}
                label="Resurface rate"
                value={`${data.resurfaceActedOnRate}%`}
                sub={`${data.resurfaceEvents} resurfaces, ${data.actedOnCount} acted on`}
                accent="bg-green-400/20 text-green-600"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
