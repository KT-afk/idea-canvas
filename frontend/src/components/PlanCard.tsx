import { Card, type CardProps } from './Card';

/**
 * PlanCard
 * Story 1.6 / Story 8.4: Visually differentiated card for "graduated" plans.
 *
 * Design intent:
 * - Solid gold/amber ring to signal "promoted" status (ideas aspire to become this)
 * - Heavier shadow for visual weight — plans are more important than raw ideas
 * - Subtle inner glow to make it feel intentional and polished
 */
export function PlanCard(props: Readonly<CardProps>) {
  return (
    <Card
      {...props}
      customClassName="ring-2 ring-amber-400/80 ring-offset-2 ring-offset-background shadow-xl shadow-amber-500/20"
    />
  );
}
