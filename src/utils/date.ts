const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
export const LOCALE = 'en-gb';

export function getRelativeTime(timestamp: number): string {
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  const diff = Math.ceil(
    (timestamp - new Date().getTime()) / DAY_IN_MILLISECONDS,
  );
  return rtf.format(diff, 'day');
}
