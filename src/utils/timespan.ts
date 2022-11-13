function leftPad0(n: number) {
  if (n === 0) {
    return '00';
  }
  return (n < 10 ? '0' : '') + n;
}
function getDays(days: number) {
  if (days) return `${days} day${days > 1 ? 's' : ''}, `;
}

export default function timeSpan(mseconds: number, humanize = false) {
  if (!mseconds) return '';
  const seconds = mseconds / 1000;
  const days = Math.floor(seconds / 3600 / 24);
  const hours = Math.floor((seconds / 3600) % 24);
  const minutes = Math.floor((seconds % 3600) / 60);
  const value = [];
  if (humanize) {
    value.push(getDays(days));
    if (hours) {
      value.push(`${hours} hr`);
    }
    if (minutes) {
      value.push(`${minutes} min`);
    }
    return value.join(' ');
  }
  if (hours) {
    value.push(leftPad0(hours));
  }
  value.push(leftPad0(minutes));
  value.push(leftPad0(Math.floor(seconds % 60)));
  if (days) {
    return `${getDays(days)}${value.join(':')}`;
  }
  return value.join(':');
}
