/**
 * NextTimeNotes Component
 * Epic 8, Story 8.1: "Next Time" follow-up notes on Idea/Plan cards
 *
 * Shows an inline list of follow-up thoughts. User can add, complete, and delete them.
 */

import { useState, useRef, useEffect } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { useNextTimeNotes } from '../hooks/useNextTimeNotes';
import type { NextTimeNote } from '../types/types';

interface NextTimeNotesProps {
  parentNoteId: string;
  textColor?: string;
}

export function NextTimeNotes({ parentNoteId, textColor: _textColor }: NextTimeNotesProps) {
  const { notes, addNote, completeNote, removeNote } = useNextTimeNotes(parentNoteId);
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setIsAdding(false);
      setInputValue('');
      return;
    }
    addNote.mutate(trimmed, {
      onSuccess: () => {
        setInputValue('');
        setIsAdding(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') {
      setIsAdding(false);
      setInputValue('');
    }
  };

  const pending = notes.filter((n: NextTimeNote) => !n.completedAt);
  const completed = notes.filter((n: NextTimeNote) => !!n.completedAt);

  return (
    <div
      className="mt-2 border-t border-black/10 pt-2"
      // Stop pointer events from bubbling to canvas drag handler
      onPointerDown={(e) => e.stopPropagation()}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-50 mb-1.5">
        Next time
      </p>

      {/* Pending items */}
      <ul className="space-y-1">
        {pending.map((note: NextTimeNote) => (
          <li key={note.id} className="flex items-start gap-1 group">
            <button
              onClick={() => completeNote.mutate(note.id)}
              className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border border-current opacity-40 hover:opacity-70 flex items-center justify-center transition-opacity"
              aria-label="Mark as done"
            >
              <Check className="w-2.5 h-2.5" />
            </button>
            <span className="flex-1 text-xs leading-snug break-words">{note.content}</span>
            <button
              onClick={() => removeNote.mutate(note.id)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-40 hover:!opacity-70 transition-opacity"
              aria-label="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </li>
        ))}
      </ul>

      {/* Add input */}
      {isAdding ? (
        <div className="flex items-center gap-1 mt-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAdd}
            placeholder="Add a follow-up thought…"
            className="flex-1 text-xs bg-transparent border-b border-current/30 focus:border-current/60 focus:outline-none py-0.5 placeholder:opacity-40"
            style={{ color: 'inherit' }}
          />
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 text-xs opacity-40 hover:opacity-70 transition-opacity mt-1"
          aria-label="Add next-time note"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      )}

      {/* Completed items (collapsed) */}
      {completed.length > 0 && (
        <ul className="space-y-0.5 mt-1.5">
          {completed.map((note: NextTimeNote) => (
            <li key={note.id} className="flex items-start gap-1 opacity-40 group">
              <Check className="mt-0.5 flex-shrink-0 w-3 h-3" />
              <span className="flex-1 text-xs leading-snug line-through break-words">{note.content}</span>
              <button
                onClick={() => removeNote.mutate(note.id)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                aria-label="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
