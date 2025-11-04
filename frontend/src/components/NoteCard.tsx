import { motion } from "framer-motion";
import React from "react";

interface NoteCardProps {
  id: number;
  text: string;
  onEdit: (id: number, newText: string) => void;
  onDelete: (id: number) => void;
  dragRef: React.RefObject<HTMLDivElement | null>;
}

export function NoteCard({
  id,
  text,
  onEdit,
  onDelete,
  dragRef,
}: Readonly<NoteCardProps>) {
  const [editableText, setEditableText] = React.useState(text);
  const handleBlur = () => {
    onEdit(id, editableText);
  };
  return (
    <motion.div
      drag
      dragConstraints={dragRef ?? undefined}
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
  );
}
