import React, { useMemo } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { getDaysInMonth, getFirstDayOfMonth, addDays, isSameDay, isWeekend } from '../../lib/utils/dates';
import { handleKeyboardActivation } from '../../lib/utils/keyboard';
import { Card, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Event, View } from '../../lib/types/event';

interface CalendarViewProps {
  currentDate: Date;
  selectedDate: Date;
  onDateClick: (date: Date) => void;
  getEventsForDate: (date: Date) => Event[];
  showEventDots: boolean;
  todayRef: React.RefObject<HTMLDivElement>;
  onNavigate: (view: View, date: Date) => void;
  allEvents: Event[];
}

function MonthView({ currentDate, selectedDate, onDateClick, getEventsForDate, showEventDots, todayRef, onNavigate, allEvents }: CalendarViewProps) {
  const year = currentDate.getFullYear(), month = currentDate.getMonth(), today = new Date();
  const daysInMonth = getDaysInMonth(year, month), firstDay = getFirstDayOfMonth(year, month);
  const leadingDays = Array.from({ length: firstDay }, (_, i) => addDays(new Date(year, month, 1), -(i + 1))).reverse();
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const trailingDays = Array.from({ length: totalCells - (leadingDays.length + days.length) }, (_, i) => addDays(new Date(year, month, daysInMonth), i + 1));
  const allDays = [...leadingDays, ...days, ...trailingDays];

  const monthHolidays = useMemo(() => {
    return allEvents
      .filter(event => {
        const eventDate = new Date(event.start_date_time);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month && (event.is_public_holiday || event.is_optional_holiday);
      })
      .sort((a, b) => new Date(a.start_date_time).getDate() - new Date(b.start_date_time).getDate());
  }, [allEvents, year, month]);

  return (
    <Card className='mb-14 md:mb-0'>
      <div className="grid grid-cols-7 border-b" role="rowheader">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => <div key={day} className="text-center text-sm font-medium text-slate-500 p-3" role="columnheader" aria-label={day}><span className="hidden sm:inline">{day}</span><span className="sm:hidden">{day.substring(0, 3)}</span></div>)}
      </div>
      <div className="grid grid-cols-7">
        {allDays.map((day, index) => {
          const isCurrentMonth = day.getMonth() === month;
          const isToday = isSameDay(day, today);
          const dayEvents = getEventsForDate(day);
          const hasPublicHoliday = dayEvents.some(e => e.is_public_holiday);
          const isDayWeekend = isWeekend(day);
          const textColor = isCurrentMonth
            ? hasPublicHoliday && isDayWeekend ? 'text-purple-500 dark:text-purple-400'
              : hasPublicHoliday || isDayWeekend ? 'text-red-500 dark:text-red-400'
                : 'text-slate-800 dark:text-slate-200'
            : isDayWeekend ? 'text-red-500/40 dark:text-red-400/30' : 'text-slate-500/40 dark:text-slate-400/30';

          const handleCellClick = () => {
            if (dayEvents.length > 0) onDateClick(day);
            else onNavigate('Week', day);
          };

          return (
            <div key={index} onClick={handleCellClick} onKeyDown={(e) => handleKeyboardActivation(e, handleCellClick)} ref={isToday ? todayRef : null} className={cn("border-b border-r border-slate-200 dark:border-slate-800 last:border-r-0 h-28 sm:h-32 p-1.5 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-slate-100 dark:hover:bg-slate-800/50 group overflow-hidden focus:outline-none focus:ring-2 focus:ring-slate-400 focus:z-10", (index + 1) % 7 === 0 && "border-r-0", index >= (allDays.length - 7) && "border-b-0")} role="gridcell" tabIndex={0} aria-label={`${day.toDateString()} ${dayEvents.length} events`}>
              <div className={cn("flex items-center justify-center w-7 h-7 rounded-md", isToday ? "bg-blue-500 text-white" : isSameDay(day, selectedDate) ? "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900" : "group-hover:bg-slate-200 dark:group-hover:bg-slate-700")}>
                <span className={cn("text-base font-bold", isToday ? "text-white" : !isSameDay(day, selectedDate) && textColor)}>{day.getDate()}</span>
              </div>
              {isCurrentMonth && showEventDots && (
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 1).map(event => (
                    <div key={event.id} className={cn("px-1.5 py-0.5 rounded-sm text-[11px] font-medium leading-tight truncate", event.is_public_holiday || event.is_optional_holiday ? 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200' : 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200')}>
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 1 && (
                    <div className="px-1.5 py-0.5 rounded-sm text-[11px] font-medium leading-tight truncate bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      + {dayEvents.length - 1} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {monthHolidays.length > 0 && (
        <div className="p-4 border-t">
          <h4 className="font-semibold mb-2 text-sm">Public Holidays</h4>
          <ul className="space-y-1 text-sm">
            {monthHolidays.map(event => (
              <li key={event.id} className="flex items-start">
                <span className="w-6 font-semibold text-red-600 dark:text-red-400">{new Date(event.start_date_time).getDate()}</span>
                <span className="flex-1 text-slate-800 dark:text-slate-200">{event.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export { MonthView, type CalendarViewProps };
