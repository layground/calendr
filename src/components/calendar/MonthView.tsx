'use client'

import { useMemo } from 'react'
import { Event } from '@/lib/types/event'
import { formatDate, getMonthDays, isWeekend } from '@/lib/utils/dates'
import { triggerHapticFeedback } from '@/lib/utils/haptics'

interface MonthViewProps {
  year: number
  month: number
  events: Event[]
  onSelectDate: (date: Date) => void
  onDoubleClickDate?: (date: Date) => void
  today?: Date
  selectedDate?: Date | null
}

export const MonthView = ({ year, month, events, onSelectDate, onDoubleClickDate, today, selectedDate }: MonthViewProps) => {
  const days = useMemo(() => getMonthDays(year, month), [year, month])
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleDateClick = (date: Date) => {
    triggerHapticFeedback()
    onSelectDate(date)
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate)
      return (
        eventStart.getFullYear() === date.getFullYear() &&
        eventStart.getMonth() === date.getMonth() &&
        eventStart.getDate() === date.getDate()
      )
    })
  }

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()

  // Calculate number of weeks in the month (for height)
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const numWeeks = Math.ceil((firstDay.getDay() + lastDay.getDate()) / 7)


  return (
    <div className="w-full pb-2 flex flex-col h-full">
      <div className="mb-4 grid grid-cols-7 gap-1">
        {weekDays.map((day, idx) => (
          <div
            key={day}
            className={`flex items-center justify-center text-center text-sm font-medium ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-red-500' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>
      <div
        className="grid grid-cols-7 gap-1 flex-1"
        style={{ height: `calc(100vh - 10rem)`, minHeight: '24rem', maxHeight: '100vh' }}
      >
        {Array.from({ length: firstDay.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(date => {
          const dateEvents = getEventsForDate(date)
          const isToday = today && isSameDay(date, today)
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isPublicHoliday = dateEvents.some(e => e.isPublicHoliday);
          const onWeekend = isWeekend(date);

          const dateColorClass =
            onWeekend && isPublicHoliday ? 'text-purple-500' :
            onWeekend ? 'text-red-500' :
            isPublicHoliday ? 'text-red-500' : '';

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              onDoubleClick={() => onDoubleClickDate && onDoubleClickDate(date)}
              className={`
                relative rounded-lg p-2 text-base h-full min-h-[3.5rem] flex flex-col items-center justify-start
                hover:bg-gray-100 dark:hover:bg-gray-800
                focus:outline-none focus:ring-2 focus:ring-primary-500
                ${dateColorClass}
                ${onWeekend ? 'bg-gray-50 dark:bg-gray-800' : ''}
                ${isToday ? 'ring-2 ring-primary-500 bg-primary-100 dark:bg-primary-900' : ''}
                ${isSelected ? 'border-2 border-primary-600' : ''}
                group
              `}
            >
              <span className="font-extrabold">{date.getDate()}</span>
              <div className="flex flex-col gap-1 w-full mt-1 overflow-hidden">
                {dateEvents.map(event => (
                  <div
                    key={event.id}
                    className={`rounded-md px-1 py-0.5 text-xs text-left truncate ${
                      event.isPublicHoliday
                        ? 'bg-red-500 text-white'
                        : 'bg-primary-100 dark:bg-primary-900'
                    }`}
                  >
                    {!event.isPublicHoliday && (
                      <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 align-middle ${
                        event.isOptionalHoliday ? 'bg-red-500' : 'bg-gray-500'
                      }`}></span>
                    )}
                    {event.title}
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}