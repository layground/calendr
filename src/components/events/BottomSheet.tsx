import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { Button } from '../ui/button';
import { Event } from '../../lib/types/event';
import { EventDetailsPanel } from './DailyEventsList';

interface MobileEventSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  date: Date;
  events: Event[];
  onAddToCalendar: (event: Event) => void;
}

function MobileEventSheet({ isOpen, setIsOpen, date, events, onAddToCalendar }: MobileEventSheetProps) {
  return (
    <div className={cn("fixed inset-0 z-50 lg:hidden", isOpen ? "block" : "hidden")}>
      <div onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className={cn("absolute bottom-0 w-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-2xl flex flex-col transition-transform duration-300 ease-in-out", isOpen ? "translate-y-0" : "translate-y-full")}>
        <div className="flex-shrink-0 pt-4 pb-2 text-center"><span className="inline-block w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></span></div>
        <div className="absolute top-2 right-2"><Button onClick={() => setIsOpen(false)} variant="ghost" size="icon" aria-label="Close event details"><X className="w-5 h-5" /></Button></div>
        <div className="overflow-y-auto"><EventDetailsPanel date={date} events={events} onAddToCalendar={onAddToCalendar} /></div>
      </div>
    </div>
  )
}

export { MobileEventSheet };
