import { FC, useMemo } from 'react'
import { getMonthGridDays, isWeekend } from '@/lib/utils/dates'
import { MonthView } from './MonthView'
import { Event } from '@/lib/types/event'

interface YearViewProps {
  year: number
  onMonthSelect: (month: number) => void
  onDateSelect?: (date: Date) => void
  events?: Event[]
  today?: Date
  selectedDate?: Date | null
  showEvents?: boolean
}

export const YearView: FC<YearViewProps> = ({ year, onMonthSelect, onDateSelect, events = [], today, selectedDate, showEvents = false }) => {
  // Mini month grid for year view (compact, not stretched)
  return (
    <div className="h-[calc(100vh-12rem)] overflow-y-auto mobile-snap-y">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-2 md:p-4">
        {Array.from({ length: 12 }).map((_, i) => {
          const days = useMemo(() => getMonthGridDays(year, i), [year, i])
          const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          const monthHolidays = events.filter(e => {
            const eventDate = new Date(e.startDate);
            return e.isPublicHoliday && !e.isOptionalHoliday && eventDate.getMonth() === i && e.region === 'National';
          });

          return (
            <div id={`month-grid-${i}`} key={i} className="rounded-lg border bg-white dark:bg-gray-900 p-2 md:p-3 shadow-sm hover:shadow-md transition mobile-snap-center">
              <div
                className="text-center font-semibold mb-2 text-primary-700 dark:text-primary-300 text-sm cursor-pointer"
                onClick={() => onMonthSelect(i)}
              >
                {new Date(year, i, 1).toLocaleString('default', { month: 'long' })}
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {weekDays.map((day, idx) => (
                  <div
                    key={day}
                    className={`text-center font-medium ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-red-500' : ''}`}
                  >
                    <span className="hidden md:inline text-sm">{day}</span>
                    <span className="md:hidden text-xs">{day[0]}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map(({ date, isCurrentMonth }) => {
                  const isToday = today &&
                    date.getFullYear() === today.getFullYear() &&
                    date.getMonth() === today.getMonth() &&
                    date.getDate() === today.getDate()
                  const isSelected = selectedDate &&
                    date.getFullYear() === selectedDate.getFullYear() &&
                    date.getMonth() === selectedDate.getMonth() &&
                    date.getDate() === selectedDate.getDate()
                  
                  const dayEvents = events.filter(e => {
                    const eventDate = new Date(e.startDate)
                    return (
                      eventDate.getFullYear() === date.getFullYear() &&
                      eventDate.getMonth() === date.getMonth() &&
                      eventDate.getDate() === date.getDate()
                    )
                  });

                  const isPublicHoliday = dayEvents.some(e => e.isPublicHoliday && !e.isOptionalHoliday);
                  const isOptionalHoliday = dayEvents.some(e => e.isOptionalHoliday);
                  const onWeekend = isWeekend(date);

                  const dateColorClass = 
                    onWeekend && isPublicHoliday ? 'text-purple-500' :
                    onWeekend ? 'text-red-500' :
                    isPublicHoliday ? 'text-red-500' : '';

                  const inactiveDateColorClass =
                    onWeekend && isPublicHoliday ? 'text-purple-500 opacity-50' :
                    onWeekend ? 'text-red-500 opacity-50' :
                    isPublicHoliday ? 'text-red-500 opacity-50' : 'text-gray-400';

                  return (
                    <div
                      key={date.toISOString()}
                      className={`
                        flex flex-col items-center justify-center text-center text-xs rounded cursor-pointer
                        aspect-square select-none
                        ${isCurrentMonth ? dateColorClass : inactiveDateColorClass}
                        ${onWeekend && isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800' : ''}
                        ${isToday ? 'ring-1 ring-primary-500 bg-primary-100 dark:bg-primary-900' : ''}
                        ${isSelected ? 'border border-primary-600' : ''}
                        group
                      `}
                      onClick={() => onDateSelect && onDateSelect(date)}
                    >
                      <span className="font-extrabold">{date.getDate()}</span>
                      <div className="flex items-center justify-center gap-1 mt-0.5 h-1.5">
                        {isOptionalHoliday && isCurrentMonth && (
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        )}
                        {showEvents && isCurrentMonth && dayEvents.some(e => !e.isPublicHoliday && !e.isOptionalHoliday) && (
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-500"></span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-2 text-xs">
                <ul>
                  {monthHolidays.map(holiday => (
                    <li key={holiday.id} className="text-red-500 dark:text-red-400 truncate">
                      {new Date(holiday.startDate).getDate()} - {holiday.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}