import { Card, type CardProps } from './Card';

// Story 1.6: Note-specific card with tag shape styling
export function NoteCard(props: Readonly<CardProps>) {
  return (
    <Card
      {...props}
      customClassName="
        note-card
        border-l-2 border-l-gray-400
        rounded-tl-none
        relative
        before:content-['']
        before:absolute
        before:top-2
        before:left-2
        before:w-2
        before:h-2
        before:rounded-full
        before:bg-black/30
        before:z-[5]
      "
    />
  );
}
