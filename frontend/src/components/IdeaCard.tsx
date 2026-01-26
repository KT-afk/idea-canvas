import { Card, type CardProps } from './Card';

// Story 1.6: Idea-specific card with ticket-stub shape styling
export function IdeaCard(props: Readonly<CardProps>) {
  return (
    <Card
      {...props}
      customClassName="
        idea-card
        border-l-4 border-l-dashed border-l-purple-400
        rounded-l-lg
        relative
        before:content-['']
        before:absolute
        before:left-[-2px]
        before:top-0
        before:bottom-0
        before:w-[6px]
        before:bg-gradient-to-b
        before:from-transparent
        before:via-purple-300
        before:to-transparent
        before:opacity-50
      "
    />
  );
}
