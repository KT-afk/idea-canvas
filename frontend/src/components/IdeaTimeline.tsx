/**
 * IdeaTimeline Component
 * Epic 8, Story 8.3: Idea Evolution — scrollable activity history for a card
 * Epic 8, Story 8.6: Export trigger added to history panel
 *
 * Shows a chronological list of activity events (created, edited, graduated, etc.)
 * with human-readable labels and relative timestamps.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useActivityLog } from '../hooks/useActivityLog';
import { ExportMenu } from './ExportMenu';
import type { ActivityEventType, ActivityLogEntry, Note } from '../types/types';

interface IdeaTimelineProps {
  noteId: string;
  /** Full note object needed for export (Story 8.6) */
  note?: Note;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const EVENT_LABELS: Record<ActivityEventType, string> = {
  created: 'Created',
  edited: 'Edited',
  type_changed: 'Type changed',
  status_changed: 'Status changed',
  connected: 'Connected',
  resurfaced: 'Resurfaced',
  next_time_added: 'Next-time note added',
  next_time_completed: 'Next-time note done',
  graduated: 'Graduated to Plan',
};

const EVENT_COLORS: Record<ActivityEventType, string> = {
  created: 'bg-green-400',
  edited: 'bg-blue-400',
  type_changed: 'bg-purple-400',
  status_changed: 'bg-orange-400',
  connected: 'bg-sky-400',
  resurfaced: 'bg-yellow-400',
  next_time_added: 'bg-indigo-400',
  next_time_completed: 'bg-teal-400',
  graduated: 'bg-pink-500',
};

function EventDot({ type }: { type: ActivityEventType }) {
  return (
    <span
      className={`flex-shrink-0 w-2 h-2 rounded-full mt-1 ${EVENT_COLORS[type] ?? 'bg-gray-400'}`}
    />
  );
}

export function IdeaTimeline({ noteId, note }: IdeaTimelineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: entries = [], isLoading } = useActivityLog(noteId, isOpen);

  return (
    <div
      className="mt-2 border-t border-black/10 pt-2"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide opacity-50 hover:opacity-70 transition-opacity w-full text-left"
        aria-expanded={isOpen}
      >
        History
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div className="mt-2 max-h-36 overflow-y-auto space-y-2 pr-1">
          {isLoading && (
            <p className="text-xs opacity-40">Loading…</p>
          )}
          {!isLoading && entries.length === 0 && (
            <p className="text-xs opacity-40">No history yet.</p>
          )}
          {entries.map((entry: ActivityLogEntry) => (
            <div key={entry.id} className="flex items-start gap-2">
              <EventDot type={entry.eventType} />
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-snug">
                  {EVENT_LABELS[entry.eventType] ?? entry.eventType}
                  {entry.eventType === 'type_changed' && entry.payload && (
                    <span className="opacity-50"> ({String(entry.payload.from)} → {String(entry.payload.to)})</span>
                  )}
                  {entry.eventType === 'status_changed' && entry.payload && (
                    <span className="opacity-50"> ({String(entry.payload.from)} → {String(entry.payload.to)})</span>
                  )}
                </p>
                <p className="text-[10px] opacity-40">{formatRelativeTime(entry.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Story 8.6: Export menu — shown when history is expanded and note is provided */}
      {isOpen && note && <ExportMenu note={note} />}
    </div>
  );
}
