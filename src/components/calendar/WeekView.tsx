import React, { useRef } from 'react';
import { cn } from '../../lib/utils/cn';
import { addDays, isSameDay } from '../../lib/utils/dates';
import { handleKeyboardActivation } from '../../lib/utils/keyboard';
import { Card } from '../ui/card';
import { CalendarViewProps } from './MonthView'; // Re-using the interface from MonthView

function WeekView({ currentDate, onDateClick, getEventsForDate, todayRef, onNavigate }: Omit<CalendarViewProps, 'allEvents' | 'selectedDate' | 'showEventDots'>) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
  const today = new Date();
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  return (
    <Card className="overflow-hidden mb-20 md:mb-0">
      <div className="grid grid-cols-7">
        {weekDays.map(day => (
          <div key={day.toISOString()} onClick={() => onNavigate('Day', day)} onKeyDown={(e) => handleKeyboardActivation(e, () => onNavigate('Day', day))} className={cn("text-center p-3 border-b border-r last:border-r-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400", isSameDay(day, today) && 'bg-blue-50 dark:bg-blue-900/30')} role="button" tabIndex={0} aria-label={`View details for ${day.toDateString()}`}>
            <p className="text-xs text-slate-500">{day.toLocaleString('default', { weekday: 'short' })}</p>
            <p className={cn("text-xl font-semibold mt-1", isSameDay(day, today) ? 'text-blue-500' : 'text-slate-700 dark:text-slate-300')}>{day.getDate()}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 h-[60vh] overflow-y-auto">
        {weekDays.map(day => {
          const dayEvents = getEventsForDate(day);
          const handleCellClick = () => {
            if (clickTimeout.current) {
              clearTimeout(clickTimeout.current);
              clickTimeout.current = null;
              onNavigate('Day', day);
            } else {
              clickTimeout.current = setTimeout(() => {
                if (dayEvents.length > 0) {
                  onDateClick(day);
                } else {
                  onNavigate('Day', day);
                }
                clickTimeout.current = null;
              }, 250);
            }
          };
          return (
            <div key={day.toISOString()} ref={isSameDay(day, today) ? todayRef : null} onClick={handleCellClick} onKeyDown={(e) => handleKeyboardActivation(e, handleCellClick)} className={cn("border-r last:border-r-0 p-2 space-y-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-slate-400", isSameDay(day, today) && 'bg-blue-50/50 dark:bg-blue-900/20')} role="button" tabIndex={0} aria-label={`${day.toDateString()} ${dayEvents.length} events`}>
              {dayEvents.map(event => (
                <div key={event.id} className="p-1.5 rounded-md text-xs bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 truncate">
                  <p className="font-semibold truncate">{event.title}</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export { WeekView };
