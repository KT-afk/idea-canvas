import { Card, type CardProps } from './Card';

// Story 1.6: Plan-specific card with graduated/formal styling
export function PlanCard(props: Readonly<CardProps>) {
  return (
    <Card
      {...props}
      customClassName="
        plan-card
        border-2 border-blue-500
        rounded-lg
        relative
        before:content-['']
        before:absolute
        before:top-0
        before:right-0
        before:w-0
        before:h-0
        before:border-l-[20px]
        before:border-l-transparent
        before:border-t-[20px]
        before:border-t-blue-500
      "
    />
  );
}
