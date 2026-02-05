import { Card, type CardProps } from './Card';

// Story 1.6: Idea-specific card - Ticket-stub perforated left border
export function IdeaCard(props: Readonly<CardProps>) {
  return (
    <Card
      {...props}
      customClassName="border-l-4 border-l-dashed border-l-black/20"
    />
  );
}
