export const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6
}

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export const getMonthDays = (year: number, month: number): Date[] => {
  const result: Date[] = []
  const date = new Date(year, month, 1)
  
  while (date.getMonth() === month) {
    result.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  
  return result
}

export const getWeekDays = (date: Date): Date[] => {
  const result: Date[] = []
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay())
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    result.push(day)
  }
  
  return result
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date)
}

export const getMonthGridDays = (year: number, month: number): { date: Date, isCurrentMonth: boolean }[] => {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 for Sunday, 1 for Monday, etc.

  // Start from the first day of the week of the first day of the month
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDayOfWeek);

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push({
      date: date,
      isCurrentMonth: date.getMonth() === month,
    });
  }

  return days;
};