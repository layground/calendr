import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ArrowLeft, MapPin } from 'lucide-react'; // Add MapPin icon
import { CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { handleKeyboardActivation } from '../../lib/utils/keyboard';
import { Event } from '../../lib/types/event';
import { EventFullDetails } from './EventDetails';
import { cn } from '../../lib/utils/cn'; // Import cn

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
      <div className="p-2 md:p-0 h-full flex flex-col space-y-4">
        <CardTitle className="mb-2" suppressHydrationWarning>Events on {date.toLocaleString('default', { month: 'long', day: 'numeric' })}</CardTitle>
        <ul className="space-y-2">
          {[...events].sort((a, b) => new Date(b.start_date_time).getTime() - new Date(a.start_date_time).getTime()).map(event => {
            const start = new Date(event.start_date_time);
            const end = new Date(event.end_date_time);
            return (
              <li key={event.id} onClick={() => setSelectedEventId(event.id)} onKeyDown={(e) => handleKeyboardActivation(e, () => setSelectedEventId(event.id))} className={cn("p-3 rounded-md cursor-pointer transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 bg-gray-100 dark:bg-slate-800/30")} role="button" tabIndex={0}>
                <p className="font-semibold truncate">{event.title}</p>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <p suppressHydrationWarning>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  {event.location?.address && (
                    <p className="flex items-center mt-1">
                      {/* <MapPin className="w-3 h-3 mr-1" /> */}
                      {event.location.link_to_maps ? (
                        <a href={event.location.link_to_maps} target="_blank" rel="noopener noreferrer" className="hover:underline">{event.location.address}</a>
                      ) : (
                        event.location.address
                      )}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // If an event is selected (either automatically because it's the only one, or by user click)
  return (
    <div className="p-2 md:p-0 h-full flex flex-col space-y-4">
      {events.length > 1 && (
        <Button variant="outline" onClick={() => setSelectedEventId(null)} className="self-start -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to list
        </Button>
      )}
      {selectedEvent && <EventFullDetails event={selectedEvent} onAddToCalendar={onAddToCalendar} />}
    </div>
  );
}

export { EventDetailsPanel };
