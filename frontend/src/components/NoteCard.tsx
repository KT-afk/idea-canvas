import { Card, type CardProps } from './Card';

// Story 1.6: Note-specific card - Clean, simple design
export function NoteCard(props: Readonly<CardProps>) {
  return (
    <Card
      {...props}
      customClassName=""
    />
  );
}
