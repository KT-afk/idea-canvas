/**
 * Component: SuggestionCard
 * Story 6.3: Connection Suggestions UI
 * 
 * Displays a single connection suggestion with accept/reject actions
 */

import { motion } from 'framer-motion';
import { Check, X, ArrowDown, Navigation } from 'lucide-react';
import type { ConnectionSuggestion } from '../../types/types';
import { Button } from '../ui/button';

interface SuggestionCardProps {
  suggestion: ConnectionSuggestion;
  onAccept: () => void;
  onReject: () => void;
  isAccepting: boolean;
  onNavigateTo?: (positionX: number, positionY: number) => void; // Story 6.6
}

export function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
  isAccepting,
  onNavigateTo,
}: SuggestionCardProps) {
  const confidencePercent = Math.round(suggestion.confidence * 100);
  
  // Color-code confidence: high (green), medium (yellow), low (blue)
  const confidenceColor =
    confidencePercent >= 30
      ? 'bg-green-500'
      : confidencePercent >= 15
      ? 'bg-yellow-500'
      : 'bg-blue-500';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all"
    >
      {/* Header: Confidence Badge */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-muted-foreground">
          Connection Suggestion
        </span>
        <span
          className={`${confidenceColor} text-white text-xs font-bold px-2 py-1 rounded-full`}
        >
          {confidencePercent}%
        </span>
      </div>

      {/* Source Card Preview */}
      <div className="bg-muted/50 rounded-lg p-3 mb-2">
        <div className="flex items-start gap-2">
          <span className="text-lg shrink-0">
            {suggestion.sourceCard?.type === 'idea' ? '💡' : 
             suggestion.sourceCard?.type === 'plan' ? '📋' : '📝'}
          </span>
          <p className="text-sm text-foreground line-clamp-2 flex-1">
            {suggestion.sourceCard?.content || '(empty)'}
          </p>
          {onNavigateTo && suggestion.sourceCard && (
            <button
              onClick={() => onNavigateTo(Number(suggestion.sourceCard!.positionX), Number(suggestion.sourceCard!.positionY))}
              className="shrink-0 text-primary hover:text-primary/70 transition-colors"
              title="Jump to this card"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Arrow Indicator */}
      <div className="flex justify-center my-2">
        <div className="bg-primary/10 rounded-full p-1">
          <ArrowDown className="w-4 h-4 text-primary" />
        </div>
      </div>

      {/* Target Card Preview */}
      <div className="bg-muted/50 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <span className="text-lg shrink-0">
            {suggestion.targetCard?.type === 'idea' ? '💡' : 
             suggestion.targetCard?.type === 'plan' ? '📋' : '📝'}
          </span>
          <p className="text-sm text-foreground line-clamp-2 flex-1">
            {suggestion.targetCard?.content || '(empty)'}
          </p>
          {onNavigateTo && suggestion.targetCard && (
            <button
              onClick={() => onNavigateTo(Number(suggestion.targetCard!.positionX), Number(suggestion.targetCard!.positionY))}
              className="shrink-0 text-primary hover:text-primary/70 transition-colors"
              title="Jump to this card"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="bg-primary/5 rounded-lg p-2 mb-3">
        <p className="text-xs text-muted-foreground italic">
          💡 {suggestion.reason}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onAccept}
          disabled={isAccepting}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="w-4 h-4 mr-1" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={isAccepting}
          className="flex-1 border-red-500/50 text-red-600 hover:bg-red-500/10"
        >
          <X className="w-4 h-4 mr-1" />
          Reject
        </Button>
      </div>
    </motion.div>
  );
}
