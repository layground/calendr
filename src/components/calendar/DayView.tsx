import React from 'react';
import { cn } from '../../lib/utils/cn';
import { isSameDay } from '../../lib/utils/dates';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { CalendarViewProps } from './MonthView'; // Re-using the interface from MonthView

function DayView({ currentDate, getEventsForDate, todayRef }: Pick<CalendarViewProps, 'currentDate' | 'getEventsForDate' | 'todayRef'>) {
  const events = getEventsForDate(currentDate), hours = Array.from({ length: 24 }, (_, i) => i), today = new Date();

  return (
    <Card ref={isSameDay(currentDate, today) ? todayRef : null} className="h-[75vh] overflow-y-auto">
      <CardHeader className={cn(isSameDay(currentDate, today) && 'bg-blue-50 dark:bg-blue-900/30')}><CardTitle suppressHydrationWarning>{currentDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</CardTitle></CardHeader>
      <div className="relative">
        {hours.map(hour => (
          <div key={hour} className="flex h-16 border-b"><div className="w-16 text-right pr-2 pt-1 text-sm text-slate-500">{hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}</div><div className="flex-1 border-l"></div></div>
        ))}
        {events.map(event => {
          const start = new Date(event.start_date_time), end = new Date(event.end_date_time);
          const top = start.getHours() * 64 + (start.getMinutes() / 60) * 64;
          const height = Math.max(32, ((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 64);
          return (
            <div key={event.id} style={{ top: `${top}px`, height: `${height}px` }} className="absolute left-16 right-0 ml-2 mr-4 bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500 p-2 rounded-r-md">
              <p className="font-bold text-sm text-blue-800 dark:text-blue-200 truncate">{event.title}</p>
              <p className="text-xs text-blue-600 dark:text-blue-300">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export { DayView };
