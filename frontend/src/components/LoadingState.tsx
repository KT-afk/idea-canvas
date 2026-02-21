import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading your ideas..." }: LoadingStateProps) {
  return (
    <div className="h-screen w-screen bg-background flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        {/* Animated spinner with purple glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse"></div>
          <div className="relative">
            <Loader2 className="w-16 h-16 text-primary animate-spin" strokeWidth={2} />
          </div>
        </div>

        {/* Loading message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            {message}
          </h2>
          <p className="text-sm text-muted-foreground">
            Setting up your canvas
          </p>
        </div>

        {/* Subtle loading dots animation */}
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
