import { getColorClass } from "@/utilities/utils";
import { motion, useMotionValue } from "framer-motion";
import { PaintBucket, Type, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ColorPickerPopover } from "./Popover";

interface NoteCardProps {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
  textColor: string;
  zIndex: number;
  onColorChange: (color: string) => void;
  onTextColorChange: (textColor: string) => void;
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
  color,
  textColor,
  zIndex,
  onColorChange,
  onTextColorChange,
  onEdit,
  onDelete,
  onBringToFront,
  onDragEndSave,
  dragRef,
}: Readonly<NoteCardProps>) {
  const [editableText, setEditableText] = useState(content);
  const [isDragging, setIsDragging] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const lastSavedPos = useRef({ x, y });

  // Use motion values for smooth dragging without re-renders
  const motionX = useMotionValue(x);
  const motionY = useMotionValue(y);
  useEffect(() => {
    // Only update if not dragging AND position actually changed significantly
    if (!isDragging) {
      const deltaX = Math.abs(x - lastSavedPos.current.x);
      const deltaY = Math.abs(y - lastSavedPos.current.y);

      // Only update if position changed by more than 2px (avoids rounding issues)
      if (deltaX > 2 || deltaY > 2) {
        motionX.set(x);
        motionY.set(y);
        lastSavedPos.current = { x, y };
      }
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
        backgroundColor: getColorClass(color),
        color: getColorClass(textColor),
      }}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={dragRef}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
      whileDrag={{ scale: 1.05, rotate: 2 }}
      onDragStart={() => {
        setIsDragging(true);
        onBringToFront(id);
      }}
      onDragEnd={() => {
        // Get the final position from Framer Motion's drag info
        const finalX = motionX.get();
        const finalY = motionY.get();

        // Update last saved position to prevent reset
        lastSavedPos.current = { x: finalX, y: finalY };

        // Save to backend
        onDragEndSave(id, Math.round(finalX), Math.round(finalY));

        // Allow props to take over again
        setIsDragging(false);
      }}
      className="relative p-4 rounded-xl w-48 cursor-grab active:cursor-grabbing shadow-[0_3px_10px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.3)] transition-shadow duration-200"
    >
      <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-10" onPointerDown={(e) => e.stopPropagation()}>
        <ColorPickerPopover icon={PaintBucket} onColorChange={onColorChange}/>
        <ColorPickerPopover icon={Type} onColorChange={onTextColorChange} />
      </div>
      <button
        onClick={() => onDelete(id)}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center hover:text-red-600 transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="h-px bg-black/15 mb-4 mt-8 -mx-4" />

      <textarea
        style={{color: getColorClass(textColor)}}
        className="w-full h-24 bg-transparent resize-none focus:outline-none text-base leading-relaxed"
        value={editableText}
        onChange={(e) => setEditableText(e.target.value)}
        onBlur={() => onEdit(id, editableText)}
        onPointerDown= {(e) => e.stopPropagation()}
        placeholder="Type something..."
      />
    </motion.div>
  );
}