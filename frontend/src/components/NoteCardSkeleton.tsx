import { motion } from "framer-motion";

interface NoteCardSkeletonProps {
  positionX: number;
  positionY: number;
}

/**
 * Story 1.3: Skeleton placeholder shown immediately when creating a note.
 * Provides instant visual feedback (optimistic feel) while waiting for server response.
 * Not interactive - user can't type until real NoteCard renders.
 */
export function NoteCardSkeleton({ positionX, positionY }: NoteCardSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.8, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        position: "absolute",
        x: positionX,
        y: positionY,
        zIndex: 9999, // Always on top while creating
      }}
      className="relative p-4 rounded-lg w-52 bg-yellow-200 shadow-lg"
      aria-label="Creating new note..."
      role="status"
    >
      {/* Skeleton header buttons */}
      <div className="absolute top-2.5 left-2.5 flex gap-1.5">
        <div className="w-5 h-5 rounded bg-yellow-300/50 animate-pulse" />
        <div className="w-5 h-5 rounded bg-yellow-300/50 animate-pulse" />
      </div>
      <div className="absolute top-2.5 right-2.5">
        <div className="w-6 h-6 rounded-full bg-yellow-300/50 animate-pulse" />
      </div>

      {/* Type badge skeleton */}
      <div className="absolute top-2.5 right-10">
        <div className="w-12 h-4 rounded-full bg-yellow-300/50 animate-pulse" />
      </div>

      {/* Divider line */}
      <div className="h-px bg-black/15 mb-4 mt-8 -mx-4" />

      {/* Skeleton content area */}
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-yellow-300/50 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-yellow-300/50 rounded animate-pulse w-1/2" />
        <div className="h-4 bg-yellow-300/50 rounded animate-pulse w-2/3" />
      </div>

      {/* Bottom buttons skeleton */}
      <div className="absolute bottom-2 right-2">
        <div className="w-12 h-6 rounded-md bg-yellow-300/50 animate-pulse" />
      </div>

      {/* Creating indicator overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-yellow-200/60 backdrop-blur-[1px] rounded-lg">
        <span className="text-yellow-800 text-sm font-medium animate-pulse">
          Creating...
        </span>
      </div>
    </motion.div>
  );
}
