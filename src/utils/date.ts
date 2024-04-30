const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
export const LOCALE = 'en-GB';

export function getRelativeTime(
  time: number,
  options = { skipToday: false },
): string {
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  const now = Date.now();
  const diffTime = Math.abs(now - new Date(time).getTime());
  const diffDays = Math.floor(diffTime / DAY_IN_MILLISECONDS);

  if (diffDays === 0) {
    const currentHour = new Date().getHours();
    const targetHour = new Date(time).getHours();
    if (currentHour < targetHour) {
      return rtf.format(-1, 'day');
    } else if (options.skipToday === true) {
      return '';
    }
  }

  return rtf.format(diffDays, 'day');
}
