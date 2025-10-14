import { FC } from 'react'
import { Event } from '@/lib/types/event'

interface WeekViewProps {
  weekStart: Date
  onDaySelect: (date: Date) => void
  events: Event[]
  onEventSelect: (eventId: string) => void
}

function getWeekDays(start: Date) {
  const days = []
  const d = new Date(start)
  d.setDate(d.getDate() - d.getDay()) // Sunday
  for (let i = 0; i < 7; i++) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

export const WeekView: FC<WeekViewProps> = ({ weekStart, onDaySelect, events, onEventSelect }) => {
  const weekDays = getWeekDays(weekStart);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForSlot = (date: Date, hour: number) => {
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
    <div className="h-[calc(100vh-12rem)] overflow-y-auto relative">
      <table className="w-full border-collapse table-fixed">
        <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
          <tr>
            <th className="w-16 border-r border-b" />
            {weekDays.map((date, idx) => (
              <th key={idx} className="border-r border-b last:border-r-0 text-center py-2 font-normal">
                <button
                  className="text-xs font-bold hover:text-primary-600 dark:hover:text-primary-400"
                  onClick={() => onDaySelect(date)}
                >
                  {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map(h => (
            <tr key={h}>
              <td className="h-14 border-r border-b text-xs text-gray-400 text-right pr-2 align-top pt-1">
                {h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
              </td>
              {weekDays.map((date, idx) => {
                const eventsForSlot = getEventsForSlot(date, h);
                return (
                  <td key={idx} className="h-14 border-r border-b last:border-r-0 p-1 relative hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex flex-col gap-1 h-full overflow-y-auto">
                      {eventsForSlot.map(event => (
                        <button
                          key={event.id}
                          className="w-full bg-primary-100 dark:bg-primary-900 rounded-md p-1 text-xs text-left truncate flex-shrink-0"
                          onClick={() => onEventSelect(event.id)}
                        >
                          {event.title}
                        </button>
                      ))}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};