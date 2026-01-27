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

  // Refs for debouncing timeouts
  const showSavedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideSavedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track when "Saving..." was last shown (for minimum display duration)
  const savingShownAtRef = useRef<number | null>(null);

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

    // Clear all pending timeouts when mutation state changes
    const clearAllTimeouts = () => {
      if (showSavedTimeoutRef.current) {
        clearTimeout(showSavedTimeoutRef.current);
        showSavedTimeoutRef.current = null;
      }
      if (hideSavedTimeoutRef.current) {
        clearTimeout(hideSavedTimeoutRef.current);
        hideSavedTimeoutRef.current = null;
      }
    };

    // Handle offline state (highest priority)
    if (!isOnline) {
      clearAllTimeouts();
      setStatus('offline');
      return;
    }

    // New mutation started (wasn't saving before, is saving now)
    if (!wasSaving && isSaving) {
      clearAllTimeouts();

      // Show "Saving..." immediately and record when we showed it
      savingShownAtRef.current = Date.now();
      setStatus('saving');

      return () => clearAllTimeouts();
    }

    // Mutation completed (was saving before, not saving now)
    if (wasSaving && !isSaving && isOnline) {
      clearAllTimeouts();

      // Calculate how long "Saving..." has been shown
      const savingDuration = savingShownAtRef.current
        ? Date.now() - savingShownAtRef.current
        : 0;

      // Minimum display time for "Saving..." is 200ms
      // This ensures users see feedback even for very fast mutations
      const MIN_SAVING_DISPLAY = 200;
      const remainingTime = Math.max(0, MIN_SAVING_DISPLAY - savingDuration);

      if (remainingTime > 0) {
        // Wait for minimum display time before showing "Saved"
        showSavedTimeoutRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;

          setStatus('saved');

          // Hide "Saved" after 2 seconds
          hideSavedTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              setStatus('idle');
            }
          }, 2000);
        }, remainingTime);
      } else {
        // Minimum time already elapsed, show "Saved" immediately
        setStatus('saved');

        // Hide "Saved" after 2 seconds
        hideSavedTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setStatus('idle');
          }
        }, 2000);
      }

      return () => clearAllTimeouts();
    }

    // Cleanup function
    return () => clearAllTimeouts();
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
      className="fixed bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-background/90 backdrop-blur-sm shadow-lg border text-sm transition-opacity duration-200"
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
