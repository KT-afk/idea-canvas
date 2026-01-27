import { Check, CloudOff, Loader2, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";

type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

export function AutosaveIndicator() {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastError, setLastError] = useState<Error | null>(null);
  const isMutating = useIsMutating(); // Count of active mutations
  const queryClient = useQueryClient();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // When coming back online, TanStack Query will auto-retry failed mutations
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
      if (event?.type === 'updated' && event.mutation) {
        const mutation = event.mutation;

        if (mutation.state.status === 'error') {
          setLastError(mutation.state.error as Error);
          setStatus('error');
        }
      }
    });

    return unsubscribe;
  }, [queryClient]);

  // Update status based on mutation state and online status
  useEffect(() => {
    if (!isOnline) {
      setStatus('offline');
      return;
    }

    if (isMutating > 0) {
      setStatus('saving');
      setLastError(null); // Clear previous errors while saving
    } else if (status === 'saving' && isOnline) {
      // Mutation just completed successfully - show "Saved" briefly
      setStatus('saved');
      const timeout = setTimeout(() => {
        setStatus('idle');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isMutating, isOnline, status]);

  // Handle retry
  const handleRetry = () => {
    // TanStack Query will auto-retry, but we can manually invalidate queries
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    setStatus('idle');
    setLastError(null);
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
