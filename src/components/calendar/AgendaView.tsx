import React from 'react';
import { Event } from '../../lib/types/event';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils/cn';

interface AgendaViewProps {
  allEvents: Event[];
  onEventSelect: (event: Event) => void;
  showEventDots: boolean;
}

export function AgendaView({ allEvents, onEventSelect, showEventDots }: AgendaViewProps) {
  const filteredEvents = showEventDots ? allEvents : allEvents.filter(event => event.is_public_holiday);
  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.start_date_time).getTime() - new Date(b.start_date_time).getTime());

  return (
    <Card className="mb-20 md:mb-0">
      <CardHeader>
        <CardTitle>Agenda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <p className="text-center text-muted-foreground">No agenda for this year.</p>
          ) : (
            sortedEvents.map(event => {
              const startDate = new Date(event.start_date_time);
              const endDate = new Date(event.end_date_time);
              const day = startDate.getDate();
              const month = startDate.toLocaleString('default', { month: 'short' });
              // const timeRange = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
              const timeRange = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

              return (
                <div key={event.id} className="flex items-start p-4 rounded-md border bg-card text-card-foreground shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => onEventSelect(event)}>
                  <div className="flex flex-col items-center mr-4 w-20">
                    <p className="text-3xl font-bold">{day}</p>
                    <p className="text-lg">{month}</p>
                    <p className="text-xs text-muted-foreground text-center dark:text-slate-400">{timeRange}</p>
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-semibold",
                      (!event.is_public_holiday)
                        ? "text-black dark:text-slate-200"
                        : !event.is_optional_holiday
                          ? "text-red-600"
                          : "text-black dark:text-slate-200 underline decoration-red-500"
                    )}>{event.title}</p>
                    {event.location?.address && (
                      <p className="text-sm underline dark:text-slate-400">
                        {/* <MapPin className="w-3 h-3 mr-1" /> */}
                        {event.location.link_to_maps ? (
                          <a href={event.location.link_to_maps} target="_blank" rel="noopener noreferrer" className="hover:underline">{event.location.address}</a>
                        ) : (
                          event.location.address
                        )}
                      </p>
                    )}
                    <p className="text-sm dark:text-slate-400">{event.description}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
