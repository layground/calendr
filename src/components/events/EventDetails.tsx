'use client'

import { Event } from '@/lib/types/event'
import { formatDate, formatTime, isSameDay } from '@/lib/utils/dates'

interface EventDetailsProps {
  event: Event;
  onBack?: () => void;
}

const AccessLabelIcons: Record<string, JSX.Element> = {
  parking: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z M12 8v8 M9 8h6a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
    </svg>
  ),
  wheelchair: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v-2c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v2 M16 17a3 3 0 11-6 0 3 3 0 016 0z M9 11V8a2 2 0 114 0v3" />
    </svg>
  ),
  kids: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  'public-transport': (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8a2 2 0 012 2v10M3 17h18M4 15h16M5 11h14" />
    </svg>
  ),
  'free-entry': (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export const EventDetails = ({ event, onBack }: EventDetailsProps) => {
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-slate-900">
      {onBack && (
        <button onClick={onBack} className="p-2 m-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 flex-shrink-0 self-start dark:border-slate-700">
          &larr; Back to list
        </button>
      )}
      {event.coverImage && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={event.coverImage}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div>
          <h2 className="text-2xl font-bold">{event.title}</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
            {formatDate(startDate)} {formatTime(startDate)}
            {!isSameDay(startDate, endDate) && (
              <> - {formatDate(endDate)} {formatTime(endDate)}</>
            )}
          </p>
          <button
            onClick={() => {
              // Add to calendar logic here
              const startTime = startDate.toISOString().replace(/-|:|\.\d\d\d/g, '')
              const endTime = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '')
              const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                event.title
              )}&dates=${startTime}/${endTime}&details=${encodeURIComponent(
                event.description
              )}&location=${encodeURIComponent(event.location.name)}`
              window.open(url, '_blank')
            }}
            className="mt-2 rounded-md bg-primary-600 px-2 py-1 text-xs text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Add to Calendar
          </button>
        </div>

        <div>
          <h3 className="font-medium">Location</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
            <a
              href={event.location.coordinates 
                ? `https://www.google.com/maps?q=${event.location.coordinates.lat},${event.location.coordinates.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline dark:text-primary-400"
            >
              {event.location.name}
            </a>
          </p>
        </div>

        {event.accessLabels.length > 0 && (
          <div>
            <h3 className="font-medium">Access Information</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {event.accessLabels.map(label => (
                <div
                  key={label}
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-slate-800"
                >
                  {AccessLabelIcons[label]}
                  <span>{label.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-medium">Description</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
            {event.description}
          </p>
          {event.articleUrl && (
            <a
              href={event.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-primary-600 hover:underline dark:text-primary-400"
            >
              Read more →
            </a>
          )}
        </div>

      </div>
    </div>
  )
}