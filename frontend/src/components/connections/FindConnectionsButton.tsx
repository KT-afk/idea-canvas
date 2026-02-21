/**
 * Component: FindConnectionsButton
 * Story 6.3: Connection Suggestions UI
 * 
 * Button in toolbar to open connection suggestions panel
 */

import { Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

interface FindConnectionsButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function FindConnectionsButton({ onClick, disabled }: FindConnectionsButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10"
      aria-label="Find Connections"
    >
      <Sparkles className="w-4 h-4" />
      <span className="hidden sm:inline">Find Connections</span>
    </Button>
  );
}
