function leftPad0(n: number) {
  if (n === 0) {
    return '00';
  }
  return (n < 10 ? '0' : '') + n;
}

export default function timeSpan(mseconds: number) {
  const seconds = mseconds / 1000;
  const days = Math.floor(seconds / 3600 / 24);
  const hours = Math.floor((seconds / 3600) % 24);
  const minutes = Math.floor((seconds % 3600) / 60);
  const value = [];
  if (hours) {
    value.push(leftPad0(hours));
  }
  //if (minutes) {
  value.push(leftPad0(minutes));
  //}
  value.push(leftPad0(Math.round(seconds % 60)));
  if (days) {
    return `${days} day${days > 1 ? 's' : ''}, ` + value.join(':');
  }
  return value.join(':');
}
