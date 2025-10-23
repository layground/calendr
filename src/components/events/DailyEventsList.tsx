import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { handleKeyboardActivation } from '../../lib/utils/keyboard';
import { Event } from '../../lib/types/event';
import { EventFullDetails } from './EventDetails';

interface EventDetailsPanelProps {
  date: Date;
  events: Event[];
  onAddToCalendar: (event: Event) => void;
}

function EventDetailsPanel({ date, events, onAddToCalendar }: EventDetailsPanelProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  useEffect(() => {
    if (events.length === 1) {
      setSelectedEventId(events[0].id);
    } else {
      setSelectedEventId(null);
    }
  }, [events, date]);

  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

  if (!events || events.length === 0) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center">
        <CalendarIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
        <CardTitle suppressHydrationWarning>{date.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</CardTitle>
        <CardDescription className="mt-2">No events scheduled.</CardDescription>
      </div>
    )
  }

  // If there are multiple events AND no specific one is selected yet, show the list.
  if (events.length > 1 && !selectedEvent) {
    return (
      <div className="p-6 h-full flex flex-col space-y-4">
        <CardTitle suppressHydrationWarning>Events on {date.toLocaleString('default', { month: 'long', day: 'numeric' })}</CardTitle>
        <ul className="space-y-2">
          {events.map(event => (
            <li key={event.id} onClick={() => setSelectedEventId(event.id)} onKeyDown={(e) => handleKeyboardActivation(e, () => setSelectedEventId(event.id))} className="p-2 rounded-md cursor-pointer transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50" role="button" tabIndex={0}>
              <p className="font-semibold truncate">{event.title}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // If an event is selected (either automatically because it's the only one, or by user click)
  return (
    <div className="p-6 h-full flex flex-col space-y-4">
      {events.length > 1 && (
        <Button variant="ghost" onClick={() => setSelectedEventId(null)} className="self-start -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to list
        </Button>
      )}
      {selectedEvent && <EventFullDetails event={selectedEvent} onAddToCalendar={onAddToCalendar} />}
    </div>
  );
}

export { EventDetailsPanel };
