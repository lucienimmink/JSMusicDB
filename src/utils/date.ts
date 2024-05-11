export const LOCALE = 'en-GB';
const ONE_DAY = 1000 * 60 * 60 * 24;

function daysBetween(date1: Date, date2: Date) {
  const differenceMs = Math.abs(date1.getTime() - date2.getTime());
  return Math.floor(differenceMs / ONE_DAY);
}

export function getRelativeTime(
  time: number,
  options = { skipToday: false },
): string {
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });

  const currentDate = new Date();
  const targetDate = new Date(time);

  const currentDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );
  const targetDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );

  const daysDifference = daysBetween(currentDay, targetDay);
  if (daysDifference === 0 && options.skipToday) return '';

  return rtf.format(-daysDifference, 'day');
}
