const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
export const LOCALE = 'en-GB';

export function getRelativeTime(
  time: number,
  options = { skipToday: false },
): string {
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  const currentTime = Date.now();
  const timeDifference = Math.abs(currentTime - new Date(time).getTime());
  let daysDifference = Math.floor(timeDifference / DAY_IN_MILLISECONDS);

  const currentHour = new Date().getHours();
  const targetHour = new Date(time).getHours();

  if (daysDifference < 1) {
    if (currentHour < targetHour && !options.skipToday) {
      return rtf.format(-1, 'day');
    }
    return ''; // Skip today if requested
  }

  if (currentHour < targetHour) {
    daysDifference += 1;
  }

  return rtf.format(-daysDifference, 'day');
}
