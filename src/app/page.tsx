"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';

import { cn } from '../lib/utils/cn';
import { addMonths, addYears, addWeeks, addDays } from '../lib/utils/dates';
import { Event, View } from '../lib/types/event';

import { Header } from '../components/layout/Header';
import { ActionBar } from '../components/ActionBar';
import { MonthView } from '../components/calendar/MonthView';
import { YearView } from '../components/calendar/YearView';
import { WeekView } from '../components/calendar/WeekView';
import { DayView } from '../components/calendar/DayView';
import { EventDetailsPanel } from '../components/events/DailyEventsList';
import { MobileEventSheet } from '../components/events/BottomSheet';
import { SideDrawer } from '../components/layout/SideDrawer';
import { Skeleton } from '../components/ui/skeleton';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';


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
