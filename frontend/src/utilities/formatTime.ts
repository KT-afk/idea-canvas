import { differenceInDays, differenceInHours, differenceInMinutes, differenceInMonths, differenceInWeeks, differenceInYears } from 'date-fns';
export function formatCompactTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  
  const date = new Date(dateString);
  const now = new Date();
  
  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);
  const weeks = differenceInWeeks(now, date);
  const months = differenceInMonths(now, date);
  const years = differenceInYears(now, date);
  
  // Ultra-compact format
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  if (weeks < 4) return `${weeks}w`;
  if (months < 12) return `${months}mo`;
  return `${years}y`;
}
// Helper: Determine if timestamp is "recent" (< 24 hours) for styling
export function isRecentlyOpened(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const hours = differenceInHours(new Date(), new Date(dateString));
  return hours < 24;
}

export function isStaleBoard(dateString: string | null | undefined): boolean {
    if (!dateString) return true;
    const days = differenceInDays(new Date(), new Date(dateString));
    return days >= 30;
}