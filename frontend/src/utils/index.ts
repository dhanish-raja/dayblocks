import { format, parseISO, isToday, isYesterday } from 'date-fns';

/** Format "HH:MM" to "9:00 AM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

/** Format a date string to a human-readable date */
export function formatDate(dateStr: string, fmt = 'MMMM d, yyyy'): string {
  const d = new Date(dateStr + 'T00:00:00');
  return format(d, fmt);
}

/** Format date to YYYY-MM-DD */
export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Get today's date string */
export function todayString(): string {
  return toDateString(new Date());
}

/** Human-friendly relative date */
export function relativeDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
}

/** Duration in minutes between two HH:MM strings */
export function durationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

/** Current time as HH:MM */
export function nowTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

/** Percentage of day elapsed between day start and end */
export function dayProgress(startTime: string, endTime: string): number {
  const now = nowTime();
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const [nh, nm] = now.split(':').map(Number);

  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const nowMin = nh * 60 + nm;

  if (nowMin <= startMin) return 0;
  if (nowMin >= endMin) return 100;

  return Math.round(((nowMin - startMin) / (endMin - startMin)) * 100);
}

/** Is the block currently active (now is within its time range, today)? */
export function isBlockActive(startTime: string, endTime: string): boolean {
  const now = nowTime();
  return now >= startTime && now < endTime;
}

/** Content preview: strip HTML tags */
export function contentPreview(html: string | null | undefined, maxLen = 120): string {
  if (!html) return '';
  const stripped = html.replace(/<[^>]*>/g, '').trim();
  if (stripped.length <= maxLen) return stripped;
  return stripped.slice(0, maxLen).trimEnd() + '…';
}

/** Debounce a function */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
