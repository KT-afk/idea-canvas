import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export function ErrorState({ 
  title = "Something went wrong",
  message = "We couldn't load your notes. This might be a temporary issue.",
  onRetry,
  onGoHome
}: ErrorStateProps) {
  return (
    <div className="h-screen w-screen bg-background flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-md text-center px-4">
        {/* Error icon with red glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
          <div className="relative bg-card border-2 border-red-500/30 rounded-full p-8">
            <AlertCircle className="w-16 h-16 text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Error message */}
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-foreground tracking-tight">
            {title}
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
          {onRetry && (
            <Button 
              onClick={onRetry} 
              size="lg"
              className="gap-2 text-base"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </Button>
          )}
          {onGoHome && (
            <Button 
              onClick={onGoHome}
              variant="outline" 
              size="lg"
              className="gap-2 text-base"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Button>
          )}
        </div>

        {/* Support hint */}
        <p className="text-xs text-muted-foreground mt-6">
          If this problem persists, try refreshing the page or check your internet connection
        </p>
      </div>
    </div>
  );
}
