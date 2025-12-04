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
  dragRef: HTMLElement;
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
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  const noteRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => setEditableText(content), [content]);

  return (
    <motion.div
      style={{
        position: "absolute",
        left: x,
        top: y,
        x: dx,
        y: dy,
        zIndex: zIndex ?? 0,
      }}
      drag
      dragConstraints={{ current: dragRef }}
      onDragStart={() => onBringToFront(id)}
      onMouseDown={()=> onBringToFront(id)}
      onDragEnd={() => {
        const board = dragRef.getBoundingClientRect();
        const rect = noteRef.current?.getBoundingClientRect();
        if (!rect) return;

        const NOTE_W = rect.width;
        const NOTE_H = rect.height;

        // get note's position relative to board
        let nx = rect.left - board.left;
        let ny = rect.top - board.top;

        // clamp
        nx = Math.max(0, Math.min(nx, board.width - NOTE_W));
        ny = Math.max(0, Math.min(ny, board.height - NOTE_H));

        onDragEndSave(id, nx, ny);
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
