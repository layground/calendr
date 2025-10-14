import { FC } from 'react';
import { RegionEvent } from '@/lib/types/event';

interface DailyEventsListProps {
  events: RegionEvent[];
  onEventSelect: (event: RegionEvent) => void;
}

export const DailyEventsList: FC<DailyEventsListProps> = ({ events, onEventSelect }) => {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">
        Events on {new Date(events[0].startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
      </h2>
      <div className="flex flex-col gap-2">
        {events.map(event => (
          <div 
            key={event.id} 
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" 
            onClick={() => onEventSelect(event)}
          >
            <p className="font-bold truncate">{event.title}</p>
            <p className="text-sm text-gray-500 truncate mt-1">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};