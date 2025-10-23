import React, { useMemo } from 'react';
import { cn } from '../../lib/utils/cn';
import { getDaysInMonth, getFirstDayOfMonth, addDays, isSameDay, isWeekend } from '../../lib/utils/dates';
import { handleKeyboardActivation } from '../../lib/utils/keyboard';
import { Event, View } from '../../lib/types/event';

interface MiniMonthProps {
    year: number;
    month: number;
    onDateClick: (date: Date) => void;
    getEventsForDate: (date: Date) => Event[];
    showEventDots: boolean;
    todayRef: React.RefObject<HTMLDivElement>;
    onNavigate: (view: View, date: Date) => void;
    allEvents: Event[];
}

function MiniMonth({ year, month, onDateClick, getEventsForDate, showEventDots, todayRef, onNavigate, allEvents }: MiniMonthProps) {
    const today = new Date();
    const daysInMonth = getDaysInMonth(year, month), firstDay = getFirstDayOfMonth(year, month);
    const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
    const leadingDays = Array.from({ length: firstDay }, (_, i) => addDays(new Date(year, month, 1), -(i + 1))).reverse();
    const totalCells = 42;
    const trailingDays = Array.from({ length: totalCells - (days.length + leadingDays.length) }, (_, i) => new Date(year, month + 1, i + 1));
    const allDays = [...leadingDays, ...days, ...trailingDays];
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const monthHolidays = useMemo(() => {
        return allEvents
            .filter(event => {
                const eventDate = new Date(event.start_date_time);
                return eventDate.getFullYear() === year && eventDate.getMonth() === month && (event.is_public_holiday || event.is_optional_holiday);
            })
            .sort((a, b) => new Date(a.start_date_time).getDate() - new Date(b.start_date_time).getDate());
    }, [allEvents, year, month]);

    return (
        <div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                {weekDays.map((day, index) => <div key={`${day}-${index}`} className="font-bold text-slate-500">{day}</div>)}
                {allDays.map((dayDate, i) => {
                    const isCurrentMonthDay = dayDate.getMonth() === month, dayEvents = getEventsForDate(dayDate);
                    const hasPublicHoliday = dayEvents.some(e => e.is_public_holiday), isDayWeekend = isWeekend(dayDate), isToday = isSameDay(dayDate, today);
                    const hasJointHoliday = dayEvents.some(e => e.is_optional_holiday), hasRegularEvent = dayEvents.some(e => !e.is_public_holiday && !e.is_optional_holiday);
                    const textColor = isCurrentMonthDay
                        ? (hasPublicHoliday && isDayWeekend ? 'text-purple-500' : ((hasPublicHoliday && !hasJointHoliday) || isDayWeekend ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'))
                        : (isDayWeekend ? 'text-red-500/40 dark:text-red-400/30' : 'text-slate-500/40 dark:text-slate-400/30');

                    const handleDayClick = () => {
                        if (dayEvents.length > 0) {
                            onDateClick(dayDate);
                        } else {
                            onNavigate('Month', dayDate);
                        }
                    };

                    return (
                        <div key={`${year}-${month}-${i}`} ref={isToday ? todayRef : null} onClick={handleDayClick} onKeyDown={(e) => handleKeyboardActivation(e, handleDayClick)} className="relative cursor-pointer flex flex-col items-center justify-center p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400" role="button" tabIndex={0} aria-label={`${dayDate.toDateString()} ${dayEvents.length} events`}>
                            <span className={cn("text-sm font-bold w-5 h-5 flex items-center justify-center rounded-md", isToday ? 'bg-blue-500 text-white' : textColor)}>{dayDate.getDate()}</span>
                            <div className="absolute bottom-0 flex items-center space-x-0.5">
                                {isCurrentMonthDay && hasJointHoliday && <span className="block w-1 h-1 bg-red-500 rounded-full"></span>}
                                {isCurrentMonthDay && showEventDots && hasRegularEvent && <span className="block w-1 h-1 bg-slate-400 rounded-full"></span>}
                            </div>
                        </div>
                    );
                })}
            </div>
            {monthHolidays.length > 0 && (
                <div className="mt-3 pt-2 border-t text-left">
                    <ul className="space-y-1 text-xs">
                        {monthHolidays.map(event => (
                            <li key={event.id} className="flex items-start truncate">
                                <span className="w-5 font-semibold text-red-600 dark:text-red-400">{new Date(event.start_date_time).getDate()}</span>
                                <span className="flex-1 truncate text-slate-800 dark:text-slate-200">
                                    {event.title}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export { MiniMonth };
