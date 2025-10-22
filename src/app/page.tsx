"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Menu, X, Sun, Moon, Dot, Search, Info, MapPin, ArrowLeft, AlertCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

// --- TYPE DEFINITIONS ---
interface Location {
  address: string;
  link_to_maps: string | null;
}

interface Source {
  name: string;
  link: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  start_date_time: string;
  end_date_time: string;
  is_public_holiday: boolean;
  is_optional_holiday: boolean;
  location: Location;
  image: string | null;
  source: Source;
  labels: string[];
}

type View = 'Year' | 'Month' | 'Week' | 'Day';


// --- HELPER FUNCTIONS & UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const addMonths = (date: Date, months: number) => { const d = new Date(date); d.setMonth(d.getMonth() + months); return d; };
const addYears = (date: Date, years: number) => { const d = new Date(date); d.setFullYear(d.getFullYear() + years); return d; };
const addWeeks = (date: Date, weeks: number) => { const d = new Date(date); d.setDate(d.getDate() + weeks * 7); return d; };
const addDays = (date: Date, days: number) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };
const isSameDay = (d1: Date, d2: Date) => d1 && d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
const handleKeyboardActivation = (e: React.KeyboardEvent, callback: (e: React.KeyboardEvent) => void) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    callback(e);
  }
};

// --- SHADCN-STYLED COMPONENT PRIMITIVES ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
    destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-50",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
    ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    icon: "h-10 w-10",
  };
  return <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)} ref={ref} {...props} />;
});
Button.displayName = "Button";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-white text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50", className)} {...props} />
));
Card.displayName = "Card";


const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)} {...props} />;
const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p className={cn("text-sm text-slate-500 dark:text-slate-400", className)} {...props} />;
const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("p-4 sm:p-6 pt-0", className)} {...props} />;
const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex items-center p-4 sm:p-6 pt-0", className)} {...props} />;

const SelectPrimitive = ({ children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
    <select className={cn("appearance-none h-10 w-full rounded-md border border-slate-200 bg-transparent pl-3 pr-8 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:ring-offset-slate-950", className)} {...props}>
      {children}
    </select>
    <ChevronRight className="h-4 w-4 absolute top-1/2 right-2 -translate-y-1/2 rotate-90 text-slate-400" />
  </div>
);

const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400", className)} {...props} />;


// --- UI SUB-COMPONENTS ---
interface HeaderProps {
  onMenuClick: () => void;
  onTodayClick: () => void;
  onThemeToggle: () => void;
  theme: string;
}

function Header({ onMenuClick, onTodayClick, onThemeToggle, theme }: HeaderProps) {
  return (
    <header className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-2">
          <Button onClick={onMenuClick} variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Calendr</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={onTodayClick} variant="outline" className="hidden sm:inline-flex">Today</Button>
          <Button onClick={onThemeToggle} variant="outline" size="icon" aria-label={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}>{theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}</Button>
        </div>
      </div>
    </header>
  );
}

interface ActionBarProps {
  currentDate: Date;
  view: View;
  onViewChange: (view: View) => void;
  onPrev: () => void;
  onNext: () => void;
  onDotsToggle: () => void;
  showEventDots: boolean;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

function ActionBar({ currentDate, view, onViewChange, onPrev, onNext, onDotsToggle, showEventDots, selectedCountry, onCountryChange, selectedRegion, onRegionChange }: ActionBarProps) {
  const viewTitles: { [key in View]: string } = {
    Year: currentDate.getFullYear().toString(),
    Month: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
    Week: `Week of ${currentDate.toLocaleString('default', { month: 'short', day: 'numeric' })}`,
    Day: currentDate.toLocaleString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  };

  return (
    <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 bg-white dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <SelectPrimitive value={selectedCountry} onChange={(e) => onCountryChange(e.target.value)} aria-label="Select Country"><option value="ID">Indonesia</option></SelectPrimitive>
          <SelectPrimitive value={selectedRegion} onChange={(e) => onRegionChange(e.target.value)} aria-label="Select Region"><option value="YOG">Yogyakarta</option></SelectPrimitive>
        </div>
        <div className="flex items-center justify-center">
          <Button onClick={onPrev} variant="ghost" size="icon" aria-label={`Previous ${view}`}><ChevronLeft className="h-5 w-5" /></Button>
          <h2 className="w-40 sm:w-48 text-center text-md sm:text-lg font-semibold" suppressHydrationWarning>{viewTitles[view]}</h2>
          <Button onClick={onNext} variant="ghost" size="icon" aria-label={`Next ${view}`}><ChevronRight className="h-5 w-5" /></Button>
        </div>
        <div className="flex items-center space-x-2">
          <LegendPopover />
          <div className="w-28"><SelectPrimitive value={view} onChange={(e) => onViewChange(e.target.value as View)} aria-label="Select calendar view"><option>Year</option><option>Month</option><option>Week</option><option>Day</option></SelectPrimitive></div>
          <Button onClick={onDotsToggle} variant="ghost" size="icon" aria-label={showEventDots ? "Hide event indicators" : "Show event indicators"}><Dot className={cn("h-6 w-6", showEventDots ? 'text-blue-500' : 'text-slate-400')} /></Button>
        </div>
      </div>
    </div>
  );
}

function LegendPopover() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <Button onClick={() => setIsOpen(!isOpen)} variant="ghost" size="icon" aria-label="Show legend"><Info className="h-5 w-5" /></Button>
      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-10"></div>
          <Card className="absolute top-full right-0 mt-2 w-64 z-20">
            <CardHeader><CardTitle>Legend</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center"><div className="w-6 h-6 flex items-center justify-center mr-3"><span className="font-bold text-blue-500">15</span></div> Today</li>
                <li className="flex items-center"><div className="w-6 h-6 flex items-center justify-center mr-3"><span className="font-bold text-red-500">15</span></div> Holiday / Weekend</li>
                <li className="flex items-center"><div className="w-6 h-6 flex items-center justify-center mr-3"><span className="font-bold text-purple-500">16</span></div> Holiday on Weekend</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-3 ml-2"></span> Joint Public Holiday</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-slate-400 mr-3 ml-2"></span> Event</li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

interface CalendarViewProps {
  currentDate: Date;
  selectedDate: Date;
  onDateClick: (date: Date) => void;
  getEventsForDate: (date: Date) => Event[];
  showEventDots: boolean;
  todayRef: React.RefObject<HTMLDivElement>;
  onNavigate: (view: View, date: Date) => void;
  allEvents: Event[];
}

function MonthView({ currentDate, selectedDate, onDateClick, getEventsForDate, showEventDots, todayRef, onNavigate, allEvents }: CalendarViewProps) {
  const year = currentDate.getFullYear(), month = currentDate.getMonth(), today = new Date();
  const daysInMonth = getDaysInMonth(year, month), firstDay = getFirstDayOfMonth(year, month);
  const leadingDays = Array.from({ length: firstDay }, (_, i) => addDays(new Date(year, month, 1), -(i + 1))).reverse();
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const trailingDays = Array.from({ length: totalCells - (leadingDays.length + days.length) }, (_, i) => addDays(new Date(year, month, daysInMonth), i + 1));
  const allDays = [...leadingDays, ...days, ...trailingDays];

  const monthHolidays = useMemo(() => {
    return allEvents
      .filter(event => {
        const eventDate = new Date(event.start_date_time);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month && (event.is_public_holiday || event.is_optional_holiday);
      })
      .sort((a, b) => new Date(a.start_date_time).getDate() - new Date(b.start_date_time).getDate());
  }, [allEvents, year, month]);

  return (
    <Card className='mb-14 md:mb-0'>
      <div className="grid grid-cols-7 border-b" role="rowheader">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => <div key={day} className="text-center text-sm font-medium text-slate-500 p-3" role="columnheader" aria-label={day}><span className="hidden sm:inline">{day}</span><span className="sm:hidden">{day.substring(0, 3)}</span></div>)}
      </div>
      <div className="grid grid-cols-7">
        {allDays.map((day, index) => {
          const isCurrentMonth = day.getMonth() === month;
          const isToday = isSameDay(day, today);
          const dayEvents = getEventsForDate(day);
          const hasPublicHoliday = dayEvents.some(e => e.is_public_holiday);
          const isDayWeekend = isWeekend(day);
          const textColor = isCurrentMonth
            ? hasPublicHoliday && isDayWeekend ? 'text-purple-500 dark:text-purple-400'
              : hasPublicHoliday || isDayWeekend ? 'text-red-500 dark:text-red-400'
                : 'text-slate-800 dark:text-slate-200'
            : isDayWeekend ? 'text-red-500/40 dark:text-red-400/30' : 'text-slate-500/40 dark:text-slate-400/30';

          const handleCellClick = () => {
            if (dayEvents.length > 0) onDateClick(day);
            else onNavigate('Week', day);
          };

          return (
            <div key={index} onClick={handleCellClick} onKeyDown={(e) => handleKeyboardActivation(e, handleCellClick)} ref={isToday ? todayRef : null} className={cn("border-b border-r last:border-r-0 h-32 p-1.5 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-slate-100 dark:hover:bg-slate-800/50 group overflow-hidden focus:outline-none focus:ring-2 focus:ring-slate-400 focus:z-10", (index + 1) % 7 === 0 && "border-r-0", index >= (allDays.length - 7) && "border-b-0")} role="gridcell" tabIndex={0} aria-label={`${day.toDateString()} ${dayEvents.length} events`}>
              <div className={cn("flex items-center justify-center w-7 h-7 rounded-md", isSameDay(day, selectedDate) ? "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900" : isToday ? "bg-blue-500" : "group-hover:bg-slate-200 dark:group-hover:bg-slate-700")}>
                <span className={cn("text-base font-bold", isToday ? "text-white" : !isSameDay(day, selectedDate) && textColor)}>{day.getDate()}</span>
              </div>
              {isCurrentMonth && (
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 1).map(event => (
                    <div key={event.id} className={cn("px-1.5 py-0.5 rounded-sm text-[11px] font-medium leading-tight truncate", event.is_public_holiday || event.is_optional_holiday ? 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200' : 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200')}>
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 1 && (
                    <div className="px-1.5 py-0.5 rounded-sm text-[11px] font-medium leading-tight truncate bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      + {dayEvents.length - 1} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {monthHolidays.length > 0 && (
        <div className="p-4 border-t">
          <h4 className="font-semibold mb-2 text-sm">Public Holidays</h4>
          <ul className="space-y-1 text-sm">
            {monthHolidays.map(event => (
              <li key={event.id} className="flex items-start">
                <span className="w-6 font-semibold text-red-600 dark:text-red-400">{new Date(event.start_date_time).getDate()}</span>
                <span className="flex-1 text-slate-800 dark:text-slate-200">{event.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function YearView({ currentDate, onDateClick, getEventsForDate, showEventDots, todayRef, onNavigate, allEvents }: CalendarViewProps) {
  const year = currentDate.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

interface MiniMonthProps extends Omit<CalendarViewProps, 'currentDate' | 'selectedDate'> {
  year: number;
  month: number;
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
            <div key={i} ref={isToday ? todayRef : null} onClick={handleDayClick} onKeyDown={(e) => handleKeyboardActivation(e, handleDayClick)} className="relative cursor-pointer flex flex-col items-center justify-center p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400" role="button" tabIndex={0} aria-label={`${dayDate.toDateString()} ${dayEvents.length} events`}>
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

function WeekView({ currentDate, onDateClick, getEventsForDate, todayRef, onNavigate }: Omit<CalendarViewProps, 'allEvents' | 'selectedDate'>) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
  const today = new Date();

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7">
        {weekDays.map(day => (
          <div key={day.toISOString()} onClick={() => onNavigate('Day', day)} onKeyDown={(e) => handleKeyboardActivation(e, () => onNavigate('Day', day))} className={cn("text-center p-3 border-b border-r last:border-r-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400", isSameDay(day, today) && 'bg-blue-50 dark:bg-blue-900/30')} role="button" tabIndex={0} aria-label={`View details for ${day.toDateString()}`}>
            <p className="text-xs text-slate-500">{day.toLocaleString('default', { weekday: 'short' })}</p>
            <p className={cn("text-xl font-semibold mt-1", isSameDay(day, today) ? 'text-blue-500' : 'text-slate-700 dark:text-slate-300')}>{day.getDate()}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 h-[60vh] overflow-y-auto">
        {weekDays.map(day => {
          const dayEvents = getEventsForDate(day);
          const handleCellClick = () => {
            if (dayEvents.length > 0) {
              onDateClick(day);
            } else {
              onNavigate('Day', day);
            }
          };
          return (
            <div key={day.toISOString()} ref={isSameDay(day, today) ? todayRef : null} onClick={handleCellClick} onKeyDown={(e) => handleKeyboardActivation(e, handleCellClick)} className={cn("border-r last:border-r-0 p-2 space-y-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-slate-400", isSameDay(day, today) && 'bg-blue-50/50 dark:bg-blue-900/20')} role="button" tabIndex={0} aria-label={`${day.toDateString()} ${dayEvents.length} events`}>
              {dayEvents.map(event => (
                <div key={event.id} className="p-1.5 rounded-md text-xs bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 truncate">
                  <p className="font-semibold truncate">{event.title}</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DayView({ currentDate, getEventsForDate, todayRef }: Pick<CalendarViewProps, 'currentDate' | 'getEventsForDate' | 'todayRef'>) {
  const events = getEventsForDate(currentDate), hours = Array.from({ length: 24 }, (_, i) => i), today = new Date();

  return (
    <Card ref={isSameDay(currentDate, today) ? todayRef : null} className="h-[75vh] overflow-y-auto">
      <CardHeader className={cn(isSameDay(currentDate, today) && 'bg-blue-50 dark:bg-blue-900/30')}><CardTitle suppressHydrationWarning>{currentDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</CardTitle></CardHeader>
      <div className="relative">
        {hours.map(hour => (
          <div key={hour} className="flex h-16 border-b"><div className="w-16 text-right pr-2 pt-1 text-sm text-slate-500">{hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}</div><div className="flex-1 border-l"></div></div>
        ))}
        {events.map(event => {
          const start = new Date(event.start_date_time), end = new Date(event.end_date_time);
          const top = start.getHours() * 64 + (start.getMinutes() / 60) * 64;
          const height = Math.max(32, ((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 64);
          return (
            <div key={event.id} style={{ top: `${top}px`, height: `${height}px` }} className="absolute left-16 right-0 ml-2 mr-4 bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500 p-2 rounded-r-md">
              <p className="font-bold text-sm text-blue-800 dark:text-blue-200 truncate">{event.title}</p>
              <p className="text-xs text-blue-600 dark:text-blue-300">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

interface EventDetailsPanelProps {
  date: Date;
  events: Event[];
  onAddToCalendar: (event: Event) => void;
}

function EventDetailsPanel({ date, events, onAddToCalendar }: EventDetailsPanelProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  useEffect(() => {
    if (events.length === 1) {
      setSelectedEventId(events[0].id);
    } else {
      setSelectedEventId(null);
    }
  }, [events, date]);

  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

  if (!events || events.length === 0) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center">
        <CalendarIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
        <CardTitle suppressHydrationWarning>{date.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</CardTitle>
        <CardDescription className="mt-2">No events scheduled.</CardDescription>
      </div>
    )
  }

  // If there are multiple events AND no specific one is selected yet, show the list.
  if (events.length > 1 && !selectedEvent) {
    return (
      <div className="p-6 h-full flex flex-col space-y-4">
        <CardTitle suppressHydrationWarning>Events on {date.toLocaleString('default', { month: 'long', day: 'numeric' })}</CardTitle>
        <ul className="space-y-2">
          {events.map((event, index) => (
            <li
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              onKeyDown={(e) => handleKeyboardActivation(e, () => setSelectedEventId(event.id))}
              className={cn(
                "p-2 rounded-md cursor-pointer transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-slate-400",
                index % 2 === 0 ? "bg-slate-200 dark:bg-slate-800" : "bg-slate-300 dark:bg-slate-900", // Stripped background
                selectedEvent?.id === event.id ? "ring-2 ring-blue-500" : "hover:bg-slate-200 dark:hover:bg-slate-700" // Highlight selected and hover
              )}
              role="button"
              tabIndex={0}
            >
              <p className="font-semibold truncate">{event.title}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // If an event is selected (either automatically because it's the only one, or by user click)
  return (
    <div className="p-6 h-full flex flex-col space-y-4">
      {events.length > 1 && (
        <Button variant="ghost" onClick={() => setSelectedEventId(null)} className="self-start -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to list
        </Button>
      )}
      {selectedEvent && <EventFullDetails event={selectedEvent} onAddToCalendar={onAddToCalendar} />}
    </div>
  );
}

interface EventFullDetailsProps {
  event: Event;
  onAddToCalendar: (event: Event) => void;
}

function EventFullDetails({ event, onAddToCalendar }: EventFullDetailsProps) {
  const start = new Date(event.start_date_time);
  const end = new Date(event.end_date_time);

  return (
    <div className="flex-1 overflow-y-auto space-y-4 animate-fade-in">
      {event.image && <img src={event.image} alt={event.title} className="w-full h-48 object-cover rounded-lg" />}
      <h2 className="text-2xl font-bold">{event.title}</h2>

      <div className="text-slate-500 dark:text-slate-400 text-sm">
        <p suppressHydrationWarning>{start.toLocaleString('default', { dateStyle: 'full' })}</p>
        <p suppressHydrationWarning>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      <Button onClick={() => onAddToCalendar(event)} variant="secondary" className="w-full bg-slate-300 dark:bg-slate-700"><CalendarIcon className="w-4 h-4 mr-2" />Add to Calendar</Button>

      {event.location?.address && (
        <div>
          <h4 className="font-semibold mb-1 flex items-center"><MapPin className="w-4 h-4 mr-2 text-slate-500" />Location</h4>
          <p className="text-sm">{event.location.address}</p>
          {event.location.link_to_maps && <a href={event.location.link_to_maps} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">View on Google Maps</a>}
        </div>
      )}

      <div>
        <h4 className="font-semibold mb-1">Description</h4>
        <p className="text-sm whitespace-pre-wrap">{event.description} {event.source?.link && <a href={event.source.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Read more</a>}</p>
      </div>

      {event.labels?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {event.labels.map(label => <Badge key={label} className="bg-slate-100 dark:bg-slate-800">{label}</Badge>)}
        </div>
      )}
    </div>
  );
}

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

interface SideDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function SideDrawer({ isOpen, setIsOpen }: SideDrawerProps) {
  return (
    <div className={cn("fixed inset-0 z-50", isOpen ? "block" : "hidden")}>
      <div onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className={cn("relative h-full w-72 bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300 ease-in-out", isOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="p-4 flex justify-between items-center border-b"><CardTitle>Menu</CardTitle><Button onClick={() => setIsOpen(false)} variant="ghost" size="icon" aria-label="Close menu"><X className="w-5 h-5" /></Button></div>
        <div className="p-4 flex flex-col h-[calc(100%-4.5rem)]">
          <nav className="flex-1"><a href="#" className="block p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">Terms of Use</a><a href="#" className="block p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">Privacy Policy</a></nav>
          <footer className="text-center text-xs text-slate-500"><p>Calendr &copy; 2025</p><p>Minimalist Event Calendar</p></footer>
        </div>
      </div>
    </div>
  )
}

function Skeleton({ className }: { className: string }) {
  return <div className={cn("bg-slate-200 dark:bg-slate-800 rounded animate-pulse", className)}></div>
}

function ErrorDisplay({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold">Could Not Load Events</h2>
      <p className="text-slate-500 dark:text-slate-400 mt-2 mb-4">{message}</p>
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  )
}

// --- MAIN APP COMPONENT ---
export default function CalendrApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<View>('Month');
  const [viewHistory, setViewHistory] = useState<View[]>([]);
  const [theme, setTheme] = useState('light');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEventDots, setShowEventDots] = useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('ID');
  const [selectedRegion, setSelectedRegion] = useState('YOG');
  const todayRef = useRef<HTMLDivElement>(null);

  // --- DATA FETCHING ---
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const year = currentDate.getFullYear();
    const region = selectedRegion; // Use selectedRegion from state

    try {
      const regionMap: { [key: string]: string } = {
        YOG: 'yogyakarta', // Changed from YO to YOG to match selectedRegion state
        SB: 'surabaya'
      };
      const regionFileName = regionMap[region];

      const EventsPromise = regionFileName && region !== '-'
        ? import(`../data/id/y${year}/id_${year}_${regionFileName}.json`)
        : Promise.resolve({ default: { events: [] } }); // Ensure default property for consistency
      const nationalEventsPromise = import(`../data/id/y${year}/id_${year}_national.json`);

      const [regionModule, nationalModule] = await Promise.all([
        EventsPromise.catch(e => {
          console.warn(`Could not load regional events for ${regionFileName} in ${year}:`, e);
          return { default: { events: [] } };
        }),
        nationalEventsPromise.catch(e => {
          console.warn(`Could not load national events for ${year}:`, e);
          return { default: { events: [] } };
        })
      ]);

      const regionalEvents = regionModule.default ? regionModule.default.events : [];
      const nationalEvents = nationalModule.default ? nationalModule.default.events : [];

      const allEvents: Event[] = [...regionalEvents, ...nationalEvents].map((e: any) => ({
        ...e,
        startDate: new Date(e.start_date_time),
        endDate: new Date(e.end_date_time),
        isPublicHoliday: e.is_public_holiday,
        isOptionalHoliday: e.is_optional_holiday,
        labels: e.labels || [],
      }));

      setEvents(allEvents);
    } catch (error) {
      console.error("Error loading events for year:", year, error);
      setError(error instanceof Error ? error.message : "An unknown error occurred.");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, selectedRegion]); // Dependencies for useCallback

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // Only fetchEvents as a dependency, as it already depends on currentDate and selectedRegion

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach(event => {
      let current = new Date(event.start_date_time);
      current.setHours(0, 0, 0, 0);
      const end = new Date(event.end_date_time);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        if (!map.has(dateStr)) map.set(dateStr, []);
        map.get(dateStr)!.push(event);
        current = addDays(current, 1);
      }
    });
    console.log("Events by date map:", map);
    return map;
  }, [events]);

  const getEventsForDate = useCallback((date: Date) => eventsByDate.get(date?.toISOString().split('T')[0]) || [], [eventsByDate]);

  const handleNav = (direction: 'next' | 'prev') => {
    const sign = direction === 'next' ? 1 : -1;
    const navActions: Record<View, (d: Date) => Date> = {
      Year: (d) => addYears(d, sign),
      Month: (d) => addMonths(d, sign),
      Week: (d) => addWeeks(d, sign),
      Day: (d) => addDays(d, sign),
    };
    setCurrentDate(navActions[view](currentDate));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setTimeout(() => todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }), 100);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (window.innerWidth < 1024) setIsMobileSheetOpen(true);
  };

  const handleNavigate = (newView: View, newDate: Date) => {
    setViewHistory(prev => [...prev, view]);
    setCurrentDate(newDate);
    setView(newView);
  };

  const handleBack = () => {
    if (viewHistory.length === 0) return;
    const lastView = viewHistory[viewHistory.length - 1];
    setViewHistory(prev => prev.slice(0, -1));
    setView(lastView);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
    setViewHistory([]);
  };

  const handleAddToCalendar = (event: Event) => {
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `UID:${event.id}@calendr.app`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(new Date(event.start_date_time))}`,
      `DTEND:${formatICSDate(new Date(event.end_date_time))}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location.address}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/ /g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderCalendarView = () => {
    if (isLoading) {
      return <Card><CardContent className="p-6"><Skeleton className="h-[70vh] w-full" /></CardContent></Card>
    }
    if (error) {
      return <ErrorDisplay message={error} onRetry={fetchEvents} />
    }
    const props = { currentDate, selectedDate, onDateClick: handleDateClick, getEventsForDate, showEventDots, todayRef, onNavigate: handleNavigate, allEvents: events };
    return (
      <div key={view + currentDate.toISOString()} className="animate-fade-in">
        {view === 'Year' && <YearView {...props} />}
        {view === 'Month' && <MonthView {...props} />}
        {view === 'Week' && <WeekView {...props} />}
        {view === 'Day' && <DayView {...props} />}
      </div>
    );
  };

  const selectedDateEvents = getEventsForDate(selectedDate);
  const previousView = viewHistory.length > 0 ? viewHistory[viewHistory.length - 1] : null;

  return (
    <div className="flex h-screen w-full bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <SideDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col lg:w-[65%] lg:flex-none relative">
            <Header onMenuClick={() => setIsDrawerOpen(true)} onTodayClick={goToToday} onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} theme={theme} />
            <ActionBar currentDate={currentDate} view={view} onViewChange={handleViewChange} onPrev={() => handleNav('prev')} onNext={() => handleNav('next')} onDotsToggle={() => setShowEventDots(!showEventDots)} showEventDots={showEventDots} selectedCountry={selectedCountry} onCountryChange={setSelectedCountry} selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
            <div className="flex-1 overflow-auto p-4 sm:p-6">{renderCalendarView()}</div>
            {previousView && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                <Button onClick={handleBack} variant="secondary" className="shadow-lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to {previousView} View
                </Button>
              </div>
            )}
          </div>
          <div className="hidden lg:block w-[35%] bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
            <EventDetailsPanel date={selectedDate} events={selectedDateEvents} onAddToCalendar={handleAddToCalendar} />
          </div>
        </main>
      </div>
      <MobileEventSheet isOpen={isMobileSheetOpen} setIsOpen={setIsMobileSheetOpen} date={selectedDate} events={selectedDateEvents} onAddToCalendar={handleAddToCalendar} />
    </div>
  );
}
