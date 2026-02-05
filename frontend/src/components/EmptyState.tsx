import { Plus, Lightbulb, StickyNote } from "lucide-react";
import { Button } from "./ui/button";

export function EmptyState({ onAdd }: Readonly<{ onAdd: () => void }>) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        {/* Decorative icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
          <div className="relative bg-card border-2 border-primary/30 rounded-full p-8">
            <Lightbulb className="w-16 h-16 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-foreground tracking-tight">
            Your canvas awaits
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Capture ideas, take notes, and watch them evolve into plans.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button 
            onClick={onAdd} 
            size="lg"
            className="gap-2 text-base"
          >
            <Plus className="w-5 h-5" />
            Create First Note
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="gap-2 text-base"
            asChild
          >
            <a href="#" onClick={(e) => e.preventDefault()}>
              <StickyNote className="w-5 h-5" />
              Learn More
            </a>
          </Button>
        </div>

        {/* Helpful hint */}
        <p className="text-xs text-muted-foreground mt-6">
          💡 Tip: Double-click anywhere on the canvas to create a note
        </p>
      </div>
    </div>
  );
}
