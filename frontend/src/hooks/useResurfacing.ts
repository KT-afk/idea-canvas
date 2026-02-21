import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { fetchResurfaceIdea, markResurfaceActedOn } from '../services/resurfacingService';
import type { Note } from '../types/types';

interface UseResurfacingOptions {
  /** Called when the user clicks "View" on the resurface toast */
  onView?: (note: Note) => void;
  /** User's resurface frequency preference: 'low' | 'normal' | 'high' */
  frequency?: string;
  /** Set to false to disable resurfacing entirely */
  enabled?: boolean;
}

/**
 * On mount (once per session), fetches a forgotten idea and shows a
 * "Remember this?" Sonner toast with View / Dismiss actions.
 */
export function useResurfacing({ onView, frequency = 'normal', enabled = true }: UseResurfacingOptions = {}) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!enabled || hasFired.current) return;
    hasFired.current = true;

    // Small delay so it doesn't pop up before the canvas finishes loading
    const timer = setTimeout(async () => {
      try {
        const idea = await fetchResurfaceIdea(frequency);
        if (!idea) return;

        const snippet = idea.content.length > 80
          ? idea.content.slice(0, 80).trimEnd() + '…'
          : idea.content;

        toast('Remember this?', {
          description: `"${snippet}"`,
          duration: 12000,
          action: {
            label: 'View',
            onClick: async () => {
              try {
                await markResurfaceActedOn(idea.id);
              } catch {
                // Non-critical — ignore
              }
              onView?.(idea);
            },
          },
          cancel: {
            label: 'Dismiss',
            onClick: () => {/* just close */},
          },
        });
      } catch {
        // Resurfacing is non-critical — swallow errors silently
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [enabled, frequency, onView]);
}
