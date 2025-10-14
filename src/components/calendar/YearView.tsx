import { FC, useMemo } from 'react'
import { getMonthDays, isWeekend } from '@/lib/utils/dates'
import { MonthView } from './MonthView'
import { Event } from '@/lib/types/event'

interface YearViewProps {
  year: number
  onMonthSelect: (month: number) => void
  onDateSelect?: (date: Date) => void
  events?: Event[]
  today?: Date
  selectedDate?: Date | null
}

export const YearView: FC<YearViewProps> = ({ year, onMonthSelect, onDateSelect, events = [], today, selectedDate }) => {
  // Mini month grid for year view (compact, not stretched)
  return (
    <div className="h-[calc(100vh-12rem)] overflow-y-auto">
      <div className="grid grid-cols-3 gap-4 p-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const days = useMemo(() => getMonthDays(year, i), [year, i])
          const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          const monthEvents = events.filter(e => new Date(e.startDate).getMonth() === i)
          const firstDayOfMonth = new Date(year, i, 1);

          return (
            <div id={`month-grid-${i}`} key={i} className="rounded-lg border bg-white dark:bg-gray-900 p-2 shadow-sm hover:shadow-md transition">
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
                    className={`text-center text-[10px] font-medium ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-red-500' : ''}`}
                  >
                    {day[0]}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDayOfMonth.getDay() }).map((_, j) => (
                  <div key={`empty-${j}`} />
                ))}
                {days.map(date => {
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

                  const isPublicHoliday = dayEvents.some(e => e.isPublicHoliday);
                  const onWeekend = isWeekend(date);

                  const dateColorClass = 
                    onWeekend && isPublicHoliday ? 'text-purple-500' :
                    onWeekend ? 'text-red-500' :
                    isPublicHoliday ? 'text-red-500' : '';

                  return (
                    <div
                      key={date.toISOString()}
                      className={`
                        flex flex-col items-center justify-center text-center text-xs rounded cursor-pointer
                        aspect-square select-none
                        ${dateColorClass}
                        ${onWeekend ? 'bg-gray-50 dark:bg-gray-800' : ''}
                        ${isToday ? 'ring-1 ring-primary-500 bg-primary-100 dark:bg-primary-900' : ''}
                        ${isSelected ? 'border border-primary-600' : ''}
                        group
                      `}
                      onClick={() => onDateSelect && onDateSelect(date)}
                    >
                      <span className="font-extrabold">{date.getDate()}</span>
                      <div className="flex gap-0.5 mt-1 h-1.5">
                        {dayEvents.length > 0 && (
                          <>
                            {dayEvents.filter(e => !e.isPublicHoliday).map((event, idx) => (
                              <span
                                key={event.id || idx}
                                className={`h-1.5 w-1.5 rounded-full 
                                  ${event.isOptionalHoliday ? 'bg-red-500' : 'bg-gray-500'}
                                  group-hover:opacity-80
                                `}
                              />
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
