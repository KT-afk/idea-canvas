import { motion } from "framer-motion";

interface NoteCardProps {
    text : string;
}

export function NoteCard({ text } : NoteCardProps){
    return (
        <motion.div
            drag
            className="bg-yellow-200 p-4 rounded-lg shadow-lg w-48 cursor-grab active:cursor-grabbing"
        >
            {text}
        </motion.div>
    );
}