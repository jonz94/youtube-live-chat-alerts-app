export function format(date: Date | number) {
  const parts = new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    dayPeriod: 'narrow',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(date)

  const formattedString = parts.reduce((accumulator, currentValue) => accumulator + currentValue.value, '')

  return formattedString
}
