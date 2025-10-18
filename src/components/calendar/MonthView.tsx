'use client'

import { useMemo, useRef, useState } from 'react'
import { Event } from '@/lib/types/event'
import { formatDate, getMonthGridDays, isWeekend } from '@/lib/utils/dates'
import { triggerHapticFeedback } from '@/lib/utils/haptics'

interface MonthViewProps {
  year: number
  month: number
  events: Event[]
  onSelectDate: (date: Date) => void
  onSelectEvents: (events: Event[]) => void
  onDoubleClickDate?: (date: Date) => void
  today?: Date
  selectedDate?: Date | null
  showEvents?: boolean
}

export const MonthView = ({ year, month, events, onSelectDate, onSelectEvents, onDoubleClickDate, today, selectedDate, showEvents = false }: MonthViewProps) => {
  const days = useMemo(() => getMonthGridDays(year, month), [year, month])
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressHandled, setIsLongPressHandled] = useState(false);

  const handleTouchStart = (date: Date) => {
    longPressTimer.current = setTimeout(() => {
      triggerHapticFeedback();
      const eventsForDate = getEventsForDate(date);
      if (eventsForDate.length > 0) {
        onSelectEvents(eventsForDate);
      }
      setIsLongPressHandled(true);
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = (date: Date) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (!isLongPressHandled) {
      triggerHapticFeedback();
      onSelectDate(date);
    }
    setIsLongPressHandled(false);
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      setIsLongPressHandled(false);
    }
  };

  const handleDateClick = (date: Date) => {
    triggerHapticFeedback();
    onSelectDate(date);
    const eventsForDate = getEventsForDate(date);
    if (eventsForDate.length > 0) {
      onSelectEvents(eventsForDate);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      const currentDate = new Date(date);

      // Normalize dates to midnight to compare only the date part
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      return currentDate >= startDate && currentDate <= endDate;
    });
  }

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()

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
        {days.map(({ date, isCurrentMonth }) => {
          const dateEvents = getEventsForDate(date)
          const isToday = today && isSameDay(date, today)
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isPublicHoliday = dateEvents.some(e => e.isPublicHoliday && !e.isOptionalHoliday);
          const isOptionalHoliday = dateEvents.some(e => e.isOptionalHoliday);
          const onWeekend = isWeekend(date);
          const mandatoryPublicHolidays = dateEvents.filter(e => e.isPublicHoliday && !e.isOptionalHoliday);
          const otherEvents = dateEvents.filter(e => !e.isPublicHoliday || e.isOptionalHoliday);

          const dateColorClass =
            onWeekend && isPublicHoliday ? 'text-purple-500 dark:text-purple-400' :
              onWeekend ? 'text-red-500 dark:text-red-400' :
                isPublicHoliday ? 'text-red-500 dark:text-red-400' : '';

          const inactiveDateColorClass =
            onWeekend && isPublicHoliday ? 'text-purple-500 opacity-50 dark:text-purple-400' :
              onWeekend ? 'text-red-500 opacity-50 dark:text-red-400' :
                isPublicHoliday ? 'text-red-500 opacity-50 dark:text-red-400' : 'text-gray-400 dark:text-slate-500';

          return (
            <button
              key={date.toISOString()}
              onClick={() => {
                if (window.innerWidth >= 768) { // Desktop click
                  handleDateClick(date);
                }
              }}
              onDoubleClick={() => onDoubleClickDate && onDoubleClickDate(date)}
              onTouchStart={() => handleTouchStart(date)}
              onTouchEnd={() => handleTouchEnd(date)}
              onTouchMove={handleTouchMove}
              className={`
                relative rounded-lg p-2 text-base h-full min-h-[3.5rem] flex flex-col items-center justify-start
                hover:bg-gray-100 dark:hover:bg-slate-800
                focus:outline-none
                ${isSelected ? 'bg-primary-200 dark:bg-primary-700' : (isToday ? 'bg-primary-100 dark:bg-primary-800' : (onWeekend && isCurrentMonth ? 'bg-gray-50 dark:bg-slate-800' : ''))}
                ${isCurrentMonth ? dateColorClass : inactiveDateColorClass}
                ${isToday ? 'ring-2 ring-primary-500' : ''}
                group
              `}
            >
              <span className="font-extrabold">{date.getDate()}</span>
              {isOptionalHoliday && isCurrentMonth && <div className="w-1 h-1 bg-red-500 rounded-full mt-1"></div>}
              <div className="flex flex-col gap-1 w-full mt-1 overflow-hidden">
                {isCurrentMonth && mandatoryPublicHolidays.map(event => (
                  <div
                    key={event.id}
                    className={`rounded-md px-1 py-0.5 text-xs text-left truncate bg-red-500 text-white`}
                  >
                    {event.title}
                  </div>
                ))}
                {showEvents && isCurrentMonth && (
                  <>
                    {otherEvents.length > 0 && (
                      <div
                        key={otherEvents[0].id}
                        className={`rounded-md px-1 py-0.5 text-xs text-left truncate bg-primary-100 dark:bg-primary-800`}
                      >
                        {otherEvents[0].title}
                      </div>
                    )}
                    {otherEvents.length > 1 && (
                      <div
                        key="more-events"
                        className="rounded-md px-1 py-0.5 text-xs text-left truncate bg-gray-200 dark:bg-slate-700"
                      >
                        ({otherEvents.length - 1}) more events
                      </div>
                    )}
                  </>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
