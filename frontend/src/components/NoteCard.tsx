import { motion, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface NoteCardProps {
  id: string;
  content: string;
  x: number;
  y: number;
  zIndex: number;
  onEdit: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  onDragEndSave: (id: string, x: number, y: number) => void;
  dragRef: React.RefObject<HTMLDivElement | null>;
}

export function NoteCard({
  id,
  content,
  x,
  y,
  zIndex,
  onEdit, 
  onDelete,
  onBringToFront,
  onDragEndSave,
  dragRef,
}: Readonly<NoteCardProps>) {
  const [editableText, setEditableText] = useState(content);
  const [isDragging, setIsDragging] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  
  // Use motion values for smooth dragging without re-renders
  const motionX = useMotionValue(x);
  const motionY = useMotionValue(y);
  
  // Sync motion values with props only when not dragging
  useEffect(() => {
    if (!isDragging) {
      motionX.set(x);
      motionY.set(y);
    }
  }, [x, y, isDragging, motionX, motionY]);
  
  useEffect(() => {
    setEditableText(content);
  }, [content]);

  return (
    <motion.div
      ref={noteRef}
      style={{
        position: "absolute",
        x: motionX,
        y: motionY,
        zIndex: zIndex ?? 0,
      }}
      drag
      dragMomentum={false}
      dragElastic={0.3}
      dragConstraints={dragRef}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
      whileDrag={{ scale: 1.05, rotate: 2 }}
      onDragStart={() => {
        setIsDragging(true);
        onBringToFront(id);
      }}
      onDragEnd={() => {
        if (!dragRef.current || !noteRef.current) {
          setIsDragging(false);
          return;
        }

        const container = dragRef.current.getBoundingClientRect();
        const noteRect = noteRef.current.getBoundingClientRect();

        // Get final position relative to container
        const finalX = noteRect.left - container.left;
        const finalY = noteRect.top - container.top;

        // Update motion values immediately to prevent snap-back
        motionX.set(finalX);
        motionY.set(finalY);

        // Save to backend
        onDragEndSave(id, Math.round(finalX), Math.round(finalY));
        
        // Allow props to take over again
        setIsDragging(false);
      }}
      className="relative bg-yellow-200 p-4 rounded-lg shadow-lg w-48 cursor-grab active:cursor-grabbing"
    >
      <button
        onClick={() => onDelete(id)}
        className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
      >
        x
      </button>

      <textarea
        className="w-full h-24 bg-transparent resize-none text-gray-800 focus:outline-none"
        value={editableText}
        onChange={(e) => setEditableText(e.target.value)}
        onBlur={() => onEdit(id, editableText)}
      />
    </motion.div>
  );
}