'use client'

import { useEffect, useState } from 'react'
import { Event } from '@/lib/types/event'
import { EventDetails } from './EventDetails'
import { DailyEventsList } from './DailyEventsList'

interface BottomSheetProps {
  event: Event | null
  dailyEvents: Event[] | null
  onClose: () => void
  onSelectEventFromList: (event: Event) => void
}

export const BottomSheet = ({ event, dailyEvents, onClose, onSelectEventFromList }: BottomSheetProps) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(!!event || (dailyEvents && dailyEvents.length > 0))
  }, [event, dailyEvents])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transform rounded-t-2xl bg-white transition-transform duration-300 ease-in-out dark:bg-slate-900 ${isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        style={{ maxHeight: '50vh' }}
      >
        {(event || (dailyEvents && dailyEvents.length > 0)) && (
          <>
            <div className="sticky top-0 flex items-center justify-center border-b border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="h-1 w-16 rounded-full bg-gray-300 dark:bg-slate-700" />
            </div>
            <div className="overflow-y-auto">
              {event ? (
                <EventDetails event={event} />
              ) : dailyEvents && dailyEvents.length > 0 ? (
                <DailyEventsList events={dailyEvents} onEventSelect={(selectedEventFromList) => {
                  onSelectEventFromList(selectedEventFromList);
                }} />
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  )
}
