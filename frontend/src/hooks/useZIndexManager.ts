import { useEffect, useState } from "react";
import type { Note } from "../types/types";

const MAX_Z_INDEX = 1000;

export function useZIndexManager(notes: Note[]) {
  const [order, setOrder] = useState<Record<string, number>>({});

  const bringToFront = (id: string) => {
    setOrder((prev: Record<string, number>) => {
      const currentZIndices = Object.values(prev);
      if (currentZIndices.length === 0) return prev;
      const currentMaxZ = Math.max(...currentZIndices);
      if (prev[id] === currentMaxZ) return prev;

      const newOrder = { ...prev };
      newOrder[id] = currentMaxZ + 1;

      if (currentMaxZ > MAX_Z_INDEX) {
        const sortedNotes = Object.entries(newOrder)
          .sort((a, b) => a[1] - b[1])
          .map(([id, index]) => [id, index + 1]);
        return Object.fromEntries(sortedNotes);
      }
      return newOrder;
    });
  };

  useEffect(() => {
    if (notes.length === 0) return;

    setOrder((prev) => {
      const newOrder = { ...prev };
      let maxZIndex = 0;

      Object.entries(prev).forEach(([id, zIndex]) => {
        if (notes.some((note: Note) => note.id === id)) {
          newOrder[id] = zIndex;
          maxZIndex = Math.max(maxZIndex, zIndex);
        }
      });
      notes.forEach((note: Note) => {
        if (newOrder[note.id] === undefined) {
          newOrder[note.id] = maxZIndex;
          maxZIndex++;
        }
      });
      return newOrder;
    });
  }, [notes]);

  return { order, bringToFront };
}
