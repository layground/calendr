import React from 'react';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Event } from '../../lib/types/event';

interface EventFullDetailsProps {
  event: Event;
  onAddToCalendar: (event: Event) => void;
}

function EventFullDetails({ event, onAddToCalendar }: EventFullDetailsProps) {
  const start = new Date(event.start_date_time);
  const end = new Date(event.end_date_time);

  return (
    <div className="flex-1 overflow-y-auto space-y-4 animate-fade-in">
      {event.image && <img src={event.image} alt={event.title} className="w-full h-48 object-cover rounded-lg" />}
      <h2 className="text-2xl font-bold">{event.title}</h2>

      <div className="text-slate-500 dark:text-slate-400 text-sm">
        <p suppressHydrationWarning>{start.toLocaleString('default', { dateStyle: 'full' })}</p>
        <p suppressHydrationWarning>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      <Button onClick={() => onAddToCalendar(event)} variant="secondary" className="w-full bg-slate-300 dark:bg-slate-700"><CalendarIcon className="w-4 h-4 mr-2" />Add to Calendar</Button>

      {event.location?.address && (
        <div>
          <h4 className="font-semibold mb-1 flex items-center"><MapPin className="w-4 h-4 mr-2 text-slate-500" />Location</h4>
          <p className="text-sm">{event.location.address}</p>
          {event.location.link_to_maps && <a href={event.location.link_to_maps} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">View on Google Maps</a>}
        </div>
      )}

      <div>
        <h4 className="font-semibold mb-1">Description</h4>
        <p className="text-sm whitespace-pre-wrap">{event.description} {event.source?.link && <a href={event.source.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Read more</a>}</p>
      </div>

      {event.labels?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {event.labels.map(label => <Badge key={label} className="bg-slate-100 dark:bg-slate-800">{label}</Badge>)}
        </div>
      )}
    </div>
  );
}

export { EventFullDetails };
