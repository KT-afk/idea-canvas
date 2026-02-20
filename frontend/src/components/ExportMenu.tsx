/**
 * ExportMenu
 * Epic 8, Story 8.6: Export idea history
 *
 * Provides "Export as Markdown" and "Export as JSON" downloads for a single
 * idea or plan card, including its content, activity history, and next-time notes.
 *
 * Pure frontend implementation — uses existing service calls.
 */

import { useState } from 'react';
import { Download, FileText, FileJson, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchActivityLog } from '../services/activityLogService';
import { fetchNextTimeNotes } from '../services/nextTimeNotesService';
import type { Note, ActivityLogEntry, NextTimeNote } from '../types/types';

interface ExportMenuProps {
  note: Note;
}

const EVENT_LABELS: Record<string, string> = {
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildMarkdown(note: Note, activity: ActivityLogEntry[], nextTime: NextTimeNote[]): string {
  const lines: string[] = [];

  lines.push(`# ${note.type === 'plan' ? 'Plan' : 'Idea'}: ${note.content.slice(0, 60).trim()}`);
  lines.push('');
  lines.push(`**Type:** ${note.type ?? 'note'}`);
  lines.push(`**Status:** ${note.status ?? 'active'}`);
  if (note.createdAt) lines.push(`**Created:** ${formatDate(note.createdAt)}`);
  if (note.updatedAt) lines.push(`**Last updated:** ${formatDate(note.updatedAt)}`);
  lines.push('');
  lines.push('## Content');
  lines.push('');
  lines.push(note.content.trim());

  if (nextTime.length > 0) {
    lines.push('');
    lines.push('## Next-time notes');
    lines.push('');
    for (const nt of nextTime) {
      const done = nt.completedAt ? '~~' : '';
      lines.push(`- ${done}${nt.content.trim()}${done}${nt.completedAt ? ` *(done ${formatDate(nt.completedAt)})*` : ''}`);
    }
  }

  if (activity.length > 0) {
    lines.push('');
    lines.push('## Activity history');
    lines.push('');
    for (const entry of activity) {
      const label = EVENT_LABELS[entry.eventType] ?? entry.eventType;
      let detail = '';
      if (entry.eventType === 'type_changed' && entry.payload) {
        detail = ` (${entry.payload.from} → ${entry.payload.to})`;
      } else if (entry.eventType === 'status_changed' && entry.payload) {
        detail = ` (${entry.payload.from} → ${entry.payload.to})`;
      }
      lines.push(`- **${label}**${detail} — ${formatDate(entry.createdAt)}`);
    }
  }

  lines.push('');
  lines.push(`---`);
  lines.push(`*Exported from idea-canvas on ${formatDate(new Date().toISOString())}*`);

  return lines.join('\n');
}

function buildJSON(note: Note, activity: ActivityLogEntry[], nextTime: NextTimeNote[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      note: {
        id: note.id,
        content: note.content,
        type: note.type,
        status: note.status,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
      nextTimeNotes: nextTime.map((nt) => ({
        id: nt.id,
        content: nt.content,
        completedAt: nt.completedAt,
        createdAt: nt.createdAt,
      })),
      activityHistory: activity.map((entry) => ({
        id: entry.id,
        eventType: entry.eventType,
        payload: entry.payload,
        createdAt: entry.createdAt,
      })),
    },
    null,
    2
  );
}

function safeFilename(content: string): string {
  return content
    .slice(0, 40)
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    || 'idea';
}

export function ExportMenu({ note }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const doExport = async (format: 'md' | 'json') => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const [activity, nextTime] = await Promise.all([
        fetchActivityLog(note.id),
        fetchNextTimeNotes(note.id),
      ]);

      const filename = safeFilename(note.content);

      if (format === 'md') {
        const content = buildMarkdown(note, activity, nextTime);
        triggerDownload(`${filename}.md`, content, 'text/markdown');
      } else {
        const content = buildJSON(note, activity, nextTime);
        triggerDownload(`${filename}.json`, content, 'application/json');
      }
    } catch (_err) {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isExporting) {
    return (
      <div className="flex items-center gap-1 text-[10px] opacity-50 mt-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        Exporting…
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-1" onPointerDown={(e) => e.stopPropagation()}>
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide opacity-50">
        <Download className="w-3 h-3" />
        Export:
      </span>
      <button
        onClick={() => doExport('md')}
        className="flex items-center gap-0.5 text-[10px] opacity-50 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded px-1"
        aria-label="Export as Markdown"
        title="Export as Markdown (.md)"
      >
        <FileText className="w-3 h-3" />
        MD
      </button>
      <span className="text-[10px] opacity-30">·</span>
      <button
        onClick={() => doExport('json')}
        className="flex items-center gap-0.5 text-[10px] opacity-50 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded px-1"
        aria-label="Export as JSON"
        title="Export as JSON (.json)"
      >
        <FileJson className="w-3 h-3" />
        JSON
      </button>
    </div>
  );
}
