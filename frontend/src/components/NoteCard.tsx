import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface NoteCardProps {
  id: string;
  content: string;
  x: number;
  y: number;
  onEdit: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onDragEndSave: (id: string, x: number, y: number) => void;
  dragRef: React.RefObject<HTMLDivElement | null>;
}

export function NoteCard({
  id,
  content,
  x,
  y,
  onEdit,
  onDelete,
  onDragEndSave,
  dragRef,
}: Readonly<NoteCardProps>) {
  const [editableText, setEditableText] = React.useState(content);
  const [ready, setReady] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const rect = dragRef.current?.getBoundingClientRect();

  const handleBlur = () => {
    onEdit(id, editableText);
  };
  useEffect(() => {
    setReady(true);
  }, []);
  useEffect(() => {
    setEditableText(content);
  }, [content]);
  return ready ? (
    <motion.div
      drag
      ref={noteRef}
      animate={{ x, y }}
      initial={false}
      dragConstraints={{
        left: 0,
        top: 0,
        right: (rect?.width ?? 0) - 192,
        bottom: (rect?.height ?? 0) - 96,
      }}
      dragElastic={0}
      onDrag={(e, info) => {
        const el = noteRef.current;
        const board = dragRef.current?.getBoundingClientRect();
        if (!board || !el) return;
        const NOTE_W = 192;
        const NOTE_H = 96;
        const maxX = board.width - NOTE_W;
        const maxY = board.height - NOTE_H;
        let nx = x + info.offset.x;
        let ny = y + info.offset.y;
        nx = Math.max(0, Math.min(nx, maxX));
        ny = Math.max(0, Math.min(ny, maxY));
        el.style.transform = `translate3d(${nx}px, ${ny}px, 0)`;
      }}
      onDragEnd={(_, info) => {
        const board = dragRef.current?.getBoundingClientRect();
        if (!board) return;

        const NOTE_W = 192;
        const NOTE_H = 96;
        const nx = Math.max(
          0,
          Math.min(x + info.offset.x, board.width - NOTE_W)
        );
        const ny = Math.max(
          0,
          Math.min(y + info.offset.y, board.height - NOTE_H)
        );
        onDragEndSave(id, nx, ny);
      }}
      style={{ position: "absolute" }}
      className="relative bg-yellow-200 p-4 rounded-lg shadow-lg w-48 cursor-grab active:cursor-grabbing"
    >
      <button
        onClick={() => onDelete(id)}
        className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
      >
        x
      </button>
      <textarea
        value={editableText}
        onChange={(e) => setEditableText(e.target.value)}
        className="w-full h-24 bg-transparent resize-none text-gray-800 focus:outline-none"
        onBlur={handleBlur}
      />
    </motion.div>
  ) : null;
}
