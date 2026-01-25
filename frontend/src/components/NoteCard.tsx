import { getColorClass } from "@/utilities/utils";
import { motion, useDragControls, useMotionValue } from "framer-motion";
import { PaintBucket, Type, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ColorPickerPopover } from "./Popover";

interface NoteCardProps {
  id: string;
  content: string;
  positionX: number;
  positionY: number;
  backgroundColor: string;
  textColor: string;
  zIndex: number;
  onColorChange: (backgroundColor: string) => void;
  onTextColorChange: (textColor: string) => void;
  onEdit: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  onDragEndSave: (id: string, positionX: number, positionY: number) => void;
}

export function NoteCard({
  id,
  content,
  positionX,
  positionY,
  backgroundColor,
  textColor,
  zIndex,
  onColorChange,
  onTextColorChange,
  onEdit,
  onDelete,
  onBringToFront,
  onDragEndSave,
}: Readonly<NoteCardProps>) {
  const [editableText, setEditableText] = useState(content);
  const [isDragging, setIsDragging] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const lastSavedPos = useRef({ positionX, positionY });
  const dragControls = useDragControls();

  // Use motion values for smooth dragging without re-renders
  // Cards use CANVAS coordinates because they're inside transformed BoardCanvas
  const motionX = useMotionValue(positionX);
  const motionY = useMotionValue(positionY);

  useEffect(() => {
    // Only update if not dragging AND position actually changed significantly
    if (!isDragging) {
      const deltaX = Math.abs(positionX - lastSavedPos.current.positionX);
      const deltaY = Math.abs(positionY - lastSavedPos.current.positionY);

      // Only update if position changed by more than 2px (avoids rounding issues)
      if (deltaX > 2 || deltaY > 2) {
        motionX.set(positionX);
        motionY.set(positionY);
        lastSavedPos.current = { positionX, positionY };
      }
    }
  }, [positionX, positionY, isDragging, motionX, motionY]);
  
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
        backgroundColor: getColorClass(backgroundColor),
        color: getColorClass(textColor),
        pointerEvents: "auto", // Issue #13 fix: Ensure notes capture pointer events
      }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      // Issue #13 fix: Remove dragConstraints so notes can move anywhere in canvas space
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
        lastSavedPos.current = { positionX: finalX, positionY: finalY };

        // Save to backend (already in canvas coordinates)
        onDragEndSave(id, Math.round(finalX), Math.round(finalY));

        // Allow props to take over again
        setIsDragging(false);
      }}
      className="relative p-4 rounded-xl w-48 shadow-[0_3px_10px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.3)] transition-shadow duration-200"
    >
      {/* Invisible drag handle area - only top section is draggable */}
      <div
        className="absolute top-0 left-0 right-0 h-10 cursor-grab active:cursor-grabbing z-0"
        onPointerDown={(e) => dragControls.start(e)}
      />

      <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-10">
        <ColorPickerPopover icon={PaintBucket} onColorChange={onColorChange}/>
        <ColorPickerPopover icon={Type} onColorChange={onTextColorChange} />
      </div>
      <button
        onClick={() => onDelete(id)}
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
        placeholder="Type something..."
      />
    </motion.div>
  );
}