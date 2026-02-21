/**
 * Analytics Service
 * Epic 8, Story 8.5: Idea Lifecycle Analytics Dashboard
 *
 * Fetches aggregated lifecycle metrics from the backend.
 */

const API_URL = import.meta.env.VITE_API_URL || '';

export interface AnalyticsData {
  // Overview
  totalItems: number;
  totalNotes: number;
  totalIdeas: number;
  totalPlans: number;

  // Idea lifecycle
  activeIdeas: number;
  archivedIdeas: number;
  graduatedIdeas: number;
  activePlans: number;
  totalArchivedAll: number;

  // Graduation
  graduationEvents: number;

  // Connections
  totalConnections: number;

  // Resurfacing
  resurfaceEvents: number;
  actedOnCount: number;
}

export async function fetchAnalytics(signal?: AbortSignal): Promise<AnalyticsData> {
  const res = await fetch(`${API_URL}/api/analytics`, { signal });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  const json = await res.json();
  if (!json || typeof json.data !== 'object' || json.data === null) {
    throw new Error('Unexpected analytics response shape');
  }
  return json.data as AnalyticsData;
}
