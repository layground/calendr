const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const addMonths = (date: Date, months: number) => { const d = new Date(date); d.setMonth(d.getMonth() + months); return d; };
const addYears = (date: Date, years: number) => { const d = new Date(date); d.setFullYear(d.getFullYear() + years); return d; };
const addWeeks = (date: Date, weeks: number) => { const d = new Date(date); d.setDate(d.getDate() + weeks * 7); return d; };
const addDays = (date: Date, days: number) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };
const isSameDay = (d1: Date, d2: Date) => d1 && d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

export { getDaysInMonth, getFirstDayOfMonth, addMonths, addYears, addWeeks, addDays, isSameDay, isWeekend };
