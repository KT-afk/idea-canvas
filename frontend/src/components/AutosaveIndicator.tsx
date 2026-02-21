import { Check, CloudOff, Loader2, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";

type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

export function AutosaveIndicator() {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const isMutating = useIsMutating(); // Count of active mutations
  const queryClient = useQueryClient();

  // Refs for tracking state transitions
  const prevMutatingRef = useRef(0);
  const isMountedRef = useRef(true);

  // Ref for hide timeout
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track if component is mounted for cleanup safety
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // TanStack Query will auto-retry failed mutations when back online
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to mutation cache for errors
  useEffect(() => {
    const mutationCache = queryClient.getMutationCache();

    const unsubscribe = mutationCache.subscribe((event) => {
      if (!isMountedRef.current || !event?.mutation) return;

      const mutation = event.mutation;

      // Set error state when mutation fails
      // Main state machine (below) will clear this when new mutations start
      if (mutation.state.status === 'error') {
        setStatus('error');
      }
    });

    return unsubscribe;
  }, [queryClient]);

  // Main state machine: Handle mutation state transitions
  // FIXED: Uses ref to track previous value, removing status from dependencies
  useEffect(() => {
    const wasSaving = prevMutatingRef.current > 0;
    const isSaving = isMutating > 0;

    // Update ref for next render
    prevMutatingRef.current = isMutating;

    // Clear pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Handle offline state (highest priority)
    if (!isOnline) {
      setStatus('offline');
      return;
    }

    // New mutation started (wasn't saving before, is saving now)
    if (!wasSaving && isSaving) {
      setStatus('saving');
      return;
    }

    // Mutation completed (was saving before, not saving now)
    if (wasSaving && !isSaving && isOnline) {
      // Show "Saved" immediately
      setStatus('saved');

      // Hide after 2 seconds
      hideTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setStatus('idle');
        }
      }, 2000);

      return () => {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      };
    }
  }, [isMutating, isOnline]); // Removed status from dependencies - using ref instead

  // Handle retry
  const handleRetry = () => {
    // Invalidate queries to trigger refetch
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    setStatus('idle');
  };

  // Don't render when idle
  if (status === 'idle') {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-md shadow-lg border border-border/50 text-sm transition-opacity duration-200"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {status === 'saving' && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-muted-foreground">Saved</span>
        </>
      )}

      {status === 'error' && (
        <>
          <RotateCw className="w-4 h-4 text-red-500" />
          <span className="text-muted-foreground">Save failed</span>
          <span className="text-muted-foreground">·</span>
          <button
            onClick={handleRetry}
            className="text-blue-500 hover:text-blue-600 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
            aria-label="Retry save"
          >
            Retry
          </button>
        </>
      )}

      {status === 'offline' && (
        <>
          <CloudOff className="w-4 h-4 text-orange-500" />
          <span className="text-muted-foreground">Offline</span>
        </>
      )}
    </div>
  );
}
