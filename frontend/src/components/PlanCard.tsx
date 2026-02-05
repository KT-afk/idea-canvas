import { Card, type CardProps } from './Card';

// Story 1.6: Plan-specific card - Solid border for "graduated" status
export function PlanCard(props: Readonly<CardProps>) {
  return (
    <Card
      {...props}
      customClassName="ring-2 ring-blue-500/50 ring-offset-2 ring-offset-background"
    />
  );
}
