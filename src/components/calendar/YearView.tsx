import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { MiniMonth } from './MiniMonth';
import { handleKeyboardActivation } from '../../lib/utils/keyboard';
import { CalendarViewProps } from './MonthView';
import { cn } from '@/lib/utils/cn';

interface YearViewProps extends CalendarViewProps {
  isRightPanelVisible: boolean;
}

function YearView({ currentDate, onDateClick, getEventsForDate, showEventDots, todayRef, onNavigate, allEvents, isRightPanelVisible }: YearViewProps) {
  const year = currentDate.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 md:mb-0", isRightPanelVisible ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
      {months.map(month => (
        <Card key={month} className="flex flex-col">
          <CardHeader onClick={() => onNavigate('Month', new Date(year, month, 1))} onKeyDown={(e) => handleKeyboardActivation(e, () => onNavigate('Month', new Date(year, month, 1)))} className="p-3 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-t-lg focus:outline-none focus:ring-2 focus:ring-slate-400" role="button" tabIndex={0}>
            <CardTitle className="text-lg" suppressHydrationWarning>{new Date(year, month).toLocaleString('default', { month: 'long' })}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1">
            <MiniMonth year={year} month={month} onDateClick={onDateClick} getEventsForDate={getEventsForDate} showEventDots={showEventDots} todayRef={todayRef} onNavigate={onNavigate} allEvents={allEvents} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { YearView };
