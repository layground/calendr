import React from 'react';
import { X, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { Button } from '../ui/button';
import { Event } from '../../lib/types/event';
import { EventDetailsPanel } from './DailyEventsList';
import { EventFullDetails } from './EventDetails';

interface MobileEventSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  date: Date;
  events: Event[];
  onAddToCalendar: (event: Event) => void;
  selectedEvent: Event | null;
  onEventSelect: (event: Event | null) => void;
}

function MobileEventSheet({ isOpen, setIsOpen, date, events, onAddToCalendar, selectedEvent, onEventSelect }: MobileEventSheetProps) {
  return (
    <div className={cn("fixed inset-0 z-50 lg:hidden", isOpen ? "block" : "hidden")}>
      <div onClick={() => { setIsOpen(false); onEventSelect(null); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className={cn("absolute bottom-0 w-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-2xl flex flex-col transition-transform duration-300 ease-in-out", isOpen ? "translate-y-0" : "translate-y-full")}>
        <div className="flex-shrink-0 pt-4 pb-2 text-center"><span className="inline-block w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></span></div>
        <div className="absolute top-2 right-2"><Button onClick={() => { setIsOpen(false); onEventSelect(null); }} variant="ghost" size="icon" aria-label="Close event details"><X className="w-5 h-5" /></Button></div>
        <div className="overflow-y-auto p-6">
          {selectedEvent ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" onClick={() => onEventSelect(null)} className="-ml-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => onAddToCalendar(selectedEvent)} variant="secondary" className="bg-primary-200 dark:bg-none">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>
              <EventFullDetails event={selectedEvent} />
            </>
          ) : (
            <EventDetailsPanel date={date} events={events} onAddToCalendar={onAddToCalendar} />
          )}
        </div>
      </div>
    </div>
  )
}

export { MobileEventSheet };