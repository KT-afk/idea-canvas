/**
 * Component: ConnectionSuggestionsPanel
 * Story 6.3: Connection Suggestions UI
 * 
 * Modal/Panel that displays all connection suggestions with actions
 */

import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2, Lightbulb } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useConnectionSuggestions } from '../../hooks/useConnectionSuggestions';
import { Button } from '../ui/button';
import { SuggestionCard } from './SuggestionCard';
import type { ConnectionSuggestion } from '../../types/types';

interface ConnectionSuggestionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string | null;
  onConnectionCreated?: () => void; // Callback when connection is accepted
}

export function ConnectionSuggestionsPanel({
  isOpen,
  onClose,
  boardId,
  onConnectionCreated,
}: ConnectionSuggestionsPanelProps) {
  const {
    suggestions,
    isLoading,
    isError,
    error,
    loadSuggestions,
    acceptSuggestion,
    rejectSuggestion,
    clearRejections,
    hasRejections,
    isAccepting,
  } = useConnectionSuggestions(boardId);

  // Load suggestions when panel opens
  useEffect(() => {
    if (isOpen && boardId) {
      loadSuggestions();
    }
  }, [isOpen, boardId, loadSuggestions]);

  const handleAccept = async (suggestion: ConnectionSuggestion) => {
    const result = await acceptSuggestion(suggestion);
    if (result.success) {
      onConnectionCreated?.();
      toast.success('Connection created successfully! ✨');
    } else {
      toast.error(`Failed to create connection: ${result.error || 'Unknown error'}`);
      console.error('Failed to create connection:', result.error);
    }
  };

  const handleReject = (suggestion: ConnectionSuggestion) => {
    rejectSuggestion(suggestion);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Connection Suggestions</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Finding connections...
                  </p>
                </div>
              )}

              {/* Error State */}
              {isError && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="text-4xl">⚠️</div>
                  <p className="text-sm text-muted-foreground text-center">
                    {error?.message || 'Failed to load suggestions'}
                  </p>
                  <Button size="sm" onClick={loadSuggestions}>
                    Try Again
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !isError && suggestions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="text-4xl">🔍</div>
                  <p className="text-sm text-muted-foreground text-center max-w-[250px]">
                    No connection suggestions found. 
                    {' '}Cards may not have enough keywords in common, or you've rejected all suggestions.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={loadSuggestions}>
                      Refresh
                    </Button>
                    {hasRejections && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={clearRejections}
                        className="text-xs"
                      >
                        Clear Rejections
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Suggestions List */}
              {!isLoading && !isError && suggestions.length > 0 && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Found {suggestions.length} potential connection{suggestions.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-1">
                      {hasRejections && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={clearRejections}
                          className="h-8 text-xs"
                          title="Clear rejected suggestions"
                        >
                          Clear Rejections
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={loadSuggestions}
                        className="h-8 text-xs"
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <AnimatePresence mode="popLayout">
                    {suggestions.map((suggestion) => (
                      <SuggestionCard
                        key={`${suggestion.sourceCardId}-${suggestion.targetCardId}`}
                        suggestion={suggestion}
                        onAccept={() => handleAccept(suggestion)}
                        onReject={() => handleReject(suggestion)}
                        isAccepting={isAccepting}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer hint */}
            {!isLoading && suggestions.length > 0 && (
              <div className="p-4 border-t border-border/50 bg-muted/20">
                <p className="text-xs text-muted-foreground text-center">
                  💡 Tip: Accept connections to create relationships between cards
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
