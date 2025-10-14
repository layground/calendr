import { FC } from 'react'
import { Event } from '@/lib/types/event'

interface DayViewProps {
  date: Date
  events: Event[]
  onEventSelect: (eventId: string) => void
}

export const DayView: FC<DayViewProps> = ({ date, events, onEventSelect }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      return (
        eventStart.getFullYear() === date.getFullYear() &&
        eventStart.getMonth() === date.getMonth() &&
        eventStart.getDate() === date.getDate() &&
        eventStart.getHours() === hour
      );
    });
  };

  return (
    <div className="overflow-y-auto max-h-[70vh] w-full">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 text-center font-bold py-2 border-b">
        {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
      {hours.map(h => {
        const eventsForHour = getEventsForHour(h);
        return (
          <div key={h} className="h-16 border-b flex items-start pl-20 pt-2 text-gray-500 text-sm relative">
            <span className="absolute left-2 top-2 text-xs">{h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}</span>
            <div className="flex flex-col gap-1 w-full">
              {eventsForHour.map(event => (
                <button
                  key={event.id}
                  className="w-full bg-primary-100 dark:bg-primary-900 rounded-md p-1 text-xs text-left truncate"
                  onClick={() => onEventSelect(event.id)}
                >
                  {event.title}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
