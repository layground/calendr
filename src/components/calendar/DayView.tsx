import React, { useMemo } from 'react';
import { cn } from '../../lib/utils/cn';
import { isSameDay } from '../../lib/utils/dates';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { CalendarViewProps } from './MonthView';
import { Event } from '../../lib/types/event';

interface EventWithLayout extends Event {
  top: number;
  height: number;
  left: number; // pixel value
  width: number; // pixel value
  end: Date; // Capped end time for layout
  // zIndex: number; // Removed
  // colorClass: string; // Removed
}

// const eventColors = [...] // Removed

function getEventLayout(events: Event[]): EventWithLayout[] {
  // Sort by start time, then by duration (longest first)
  const sortedEvents = [...events].sort((a, b) => {
    const startA = new Date(a.start_date_time).getTime();
    const startB = new Date(b.start_date_time).getTime();
    if (startA !== startB) return startA - startB;

    const endA = new Date(a.end_date_time).getTime();
    const endB = new Date(b.end_date_time).getTime();
    return (endB - startB) - (endA - startA); // Longest duration first
  });

  const laidOutEvents: EventWithLayout[] = [];
  const columns: EventWithLayout[][] = []; // Each column is an array of events

  sortedEvents.forEach((event, eventIndex) => {
    const start = new Date(event.start_date_time);
    let end = new Date(event.end_date_time);

    const dayEnd = new Date(start);
    dayEnd.setHours(23, 59, 59, 999);
    if (end.getTime() > dayEnd.getTime()) {
      end = dayEnd;
    }

    const top = start.getHours() * 64 + (start.getMinutes() / 60) * 64;
    const height = Math.max(32, ((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 64);

    // Remove finished events from activeEvents
    const currentTime = start.getTime();
    for (let i = columns.length - 1; i >= 0; i--) { // Iterate through columns
      const column = columns[i];
      if (column.length > 0 && column[column.length - 1].end.getTime() <= currentTime) {
        columns.splice(i, 1); // Remove column if its last event has ended
      }
    }

    // Find a column for the current event
    let column = 0;
    while (columns[column] && columns[column].some(ae => ae.end.getTime() > start.getTime())) {
      column++;
    }

    if (!columns[column]) {
      columns[column] = [];
    }

    const newEvent: EventWithLayout = {
      ...event,
      top,
      height,
      left: 0, // Will be calculated later
      width: 0, // Will be calculated later
      // zIndex: eventIndex, // Removed
      // colorClass: eventColors[column % eventColors.length], // Removed
      end: end // Store capped end time
    };

    columns[column].push(newEvent);
    laidOutEvents.push(newEvent);

    // Update layout for all active events
    const maxColumns = columns.length; // Total number of active columns

    columns.forEach((col, colIndex) => {
      col.forEach(ae => {
        ae.width = 150; // Fixed width of 150px
        ae.left = colIndex * 160; // 160px offset (150px width + 10px gap)
      });
    });
  });

  return laidOutEvents;
}

function DayView({ currentDate, getEventsForDate, todayRef }: Pick<CalendarViewProps, 'currentDate' | 'getEventsForDate' | 'todayRef'>) {
  const events = getEventsForDate(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = new Date();

  const laidOutEvents = useMemo(() => getEventLayout(events), [events]);

  return (
    <Card ref={isSameDay(currentDate, today) ? todayRef : null} className="h-[75vh] overflow-y-auto">
      <CardHeader className={cn(isSameDay(currentDate, today) && 'bg-blue-50 dark:bg-blue-900/30')}><CardTitle suppressHydrationWarning>{currentDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</CardTitle></CardHeader>
      <div className="relative">
        {hours.map(hour => (
          <div key={hour} className="flex h-16 border-b"><div className="w-16 text-right pr-2 pt-1 text-sm text-slate-500">{hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}</div><div className="flex-1 border-l"></div></div>
        ))}
        {laidOutEvents.map(event => (
          <div
            key={event.id}
            style={{
              top: `${event.top}px`,
              height: `${event.height}px`,
              left: `calc(4rem + ${event.left}px)`, // 4rem is the width of the time column
              width: `${event.width}px`, // Fixed pixel width
              // zIndex: event.zIndex, // Removed
            }}
            className={cn("absolute p-2 rounded-r-md border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/50")} // Single color
          >
            <p className="font-bold text-sm text-blue-800 dark:text-blue-200 truncate">{event.title}</p>
            <p className="text-xs text-blue-600 dark:text-blue-300">{new Date(event.start_date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export { DayView };
