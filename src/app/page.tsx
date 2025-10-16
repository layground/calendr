'use client'


import { useState, useEffect } from 'react'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { MonthView } from '@/components/calendar/MonthView'
import { YearView } from '@/components/calendar/YearView'
import { WeekView } from '@/components/calendar/WeekView'
import { DayView } from '@/components/calendar/DayView'
import { EventDetails } from '@/components/events/EventDetails'
import { DailyEventsList } from '@/components/events/DailyEventsList'
import { BottomSheet } from '@/components/events/BottomSheet'
import { Event, RegionEvent } from '@/lib/types/event'

type ViewMode = 'year' | 'month' | 'week' | 'day'

interface Region {
  region: string
  regionCode: string
  events: RegionEvent[]
}

interface CountryData {
  country: string
  countryCode: string
  regions: Region[]
}

export default function Home() {

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<RegionEvent | null>(null)
  const [dailyEvents, setDailyEvents] = useState<RegionEvent[] | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [year, setYear] = useState(currentDate.getFullYear())
  const [country, setCountry] = useState('ID')
  const [region, setRegion] = useState('-')
  const [events, setEvents] = useState<RegionEvent[]>([])
  const [showEvents, setShowEvents] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const regionMap: { [key: string]: string } = {
        YO: 'yogyakarta',
        SB: 'surabaya'
    };
    const regionFileName = regionMap[region];

    const fetchEvents = async () => {
        try {
            const regionEventsPromise = regionFileName && region !== '-' ? import(`@/data/id/y${year}/id_${year}_${regionFileName}.json`) : Promise.resolve({ regions: [] });
            const nationalEventsPromise = import(`@/data/id/y${year}/id_${year}_national.json`);

            const [regionEvents, nationalEvents] = await Promise.all([
                regionEventsPromise.catch(e => ({ regions: [] })),
                nationalEventsPromise.catch(e => ({ regions: [] }))
            ]);

            const allEvents = [
                ...regionEvents.regions.flatMap(r => r.events),
                ...nationalEvents.regions.flatMap(r => r.events)
            ];
            setEvents(allEvents);
        } catch (error) {
            console.error("Error loading events for year:", year, error);
            setEvents([]);
        }
    };

    fetchEvents();
}, [year, region]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const eventsForDay = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });

    if (eventsForDay.length > 1) {
      setDailyEvents(eventsForDay);
      setSelectedEvent(null); // Clear single selected event
    } else if (eventsForDay.length === 1) {
      setSelectedEvent(eventsForDay[0]);
      setDailyEvents(null); // Clear daily events list
    } else {
      setSelectedEvent(null);
      setDailyEvents(null);
    }
  };

  const handleDateDoubleClick = (date: Date) => {
    setViewMode('week');
    setCurrentDate(date);
  };

  const handleEventSelect = (eventId: string) => {
    const found = events.find(event => event.id === eventId);
    setSelectedEvent(found || null);
  };

  const handlePrev = () => {
    switch (viewMode) {
      case 'year':
        setYear(y => y - 1);
        break;
      case 'month':
        setCurrentDate(d => {
          const newDate = new Date(d);
          newDate.setMonth(d.getMonth() - 1);
          setYear(newDate.getFullYear());
          return newDate;
        });
        break;
      case 'week':
        setCurrentDate(d => {
          const newDate = new Date(d);
          newDate.setDate(d.getDate() - 7);
          setYear(newDate.getFullYear());
          return newDate;
        });
        break;
      case 'day':
        setCurrentDate(d => {
          const newDate = new Date(d);
          newDate.setDate(d.getDate() - 1);
          setYear(newDate.getFullYear());
          return newDate;
        });
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'year':
        setYear(y => y + 1);
        break;
      case 'month':
        setCurrentDate(d => {
          const newDate = new Date(d);
          newDate.setMonth(d.getMonth() + 1);
          setYear(newDate.getFullYear());
          return newDate;
        });
        break;
      case 'week':
        setCurrentDate(d => {
          const newDate = new Date(d);
          newDate.setDate(d.getDate() + 7);
          setYear(newDate.getFullYear());
          return newDate;
        });
        break;
      case 'day':
        setCurrentDate(d => {
          const newDate = new Date(d);
          newDate.setDate(d.getDate() + 1);
          setYear(newDate.getFullYear());
          return newDate;
        });
        break;
    }
  };

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
    setYear(today.getFullYear())

    if (viewMode === 'year') {
      // Scroll to current month in year view
      setTimeout(() => {
        const monthEl = document.getElementById(`month-grid-${today.getMonth()}`)
        if (monthEl) {
          monthEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
        }
      }, 0)
    }
  }

  // TODO: Add country/region selector logic

  return (
    <div className="flex min-h-screen-dynamic flex-col md:flex-row">
      {/* Left Drawer for Settings */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative flex w-64 h-full bg-white dark:bg-gray-800 shadow-xl">
            <div className="p-4">
              <h2 className="text-lg font-semibold">Settings</h2>
              {/* Settings content goes here */}
            </div>
            <button onClick={() => setIsDrawerOpen(false)} className="absolute top-0 right-0 p-4">
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Left panel - Calendar (60%) */}
      <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-700 md:border-b-0 md:border-r md:w-[60vw] w-full min-w-0">
        <div className="flex items-center justify-between mb-2">
          <Logo />
          <div className="flex items-center gap-2">
            <button onClick={handleToday} className="rounded px-3 py-1 bg-primary-500 text-white hover:bg-primary-600 transition-colors">Go to Today</button>
            <ThemeToggle />
            <button onClick={() => setIsDrawerOpen(true)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
        {/* Action Bar */}
        <div className="flex items-center gap-2 mb-2">
          <button onClick={handlePrev} className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Previous year">◀</button>
          <span className="font-semibold text-lg w-48 text-center">
            {viewMode === 'year' && year}
            {viewMode === 'month' && currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            {viewMode === 'week' && `Week of ${currentDate.toLocaleDateString()}`}
            {viewMode === 'day' && currentDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <button onClick={handleNext} className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Next year">▶</button>
          {/* Country/Region Selectors (future) */}
          <button className="ml-2 rounded px-3 py-1 border border-gray-300 dark:border-gray-700">Indonesia</button>
          <select
            className="rounded px-3 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="-">-</option>
            <option value="YO">Yogyakarta</option>
            <option value="SB">Surabaya</option>
          </select>
          <button onClick={() => setShowEvents(!showEvents)} className={`ml-2 rounded px-3 py-1 border ${showEvents ? 'bg-primary-100 dark:bg-primary-900' : ''}`}>Show Events</button>
          {/* View Mode Switcher */}
          <div className="ml-auto flex gap-1">
            <button onClick={() => setViewMode('year')} className={`px-2 py-1 rounded ${viewMode === 'year' ? 'bg-primary-100 dark:bg-primary-900' : ''}`}>Year</button>
            <button onClick={() => setViewMode('month')} className={`px-2 py-1 rounded ${viewMode === 'month' ? 'bg-primary-100 dark:bg-primary-900' : ''}`}>Month</button>
            <button onClick={() => setViewMode('week')} className={`px-2 py-1 rounded ${viewMode === 'week' ? 'bg-primary-100 dark:bg-primary-900' : ''}`}>Week</button>
            <button onClick={() => setViewMode('day')} className={`px-2 py-1 rounded ${viewMode === 'day' ? 'bg-primary-100 dark:bg-primary-900' : ''}`}>Day</button>
          </div>
        </div>
        {/* Calendar View (dynamic) */}
        <div className="flex-1 min-h-0">
          {viewMode === 'year' && (
            <YearView
              year={year}
              onMonthSelect={m => { setViewMode('month'); setCurrentDate(new Date(year, m, 1)); }}
              onDateSelect={handleDateSelect}
              today={new Date()}
              selectedDate={selectedDate}
              events={events.map(e => ({
                id: e.id,
                title: e.title,
                description: e.description,
                startDate: new Date(e.startDate),
                endDate: new Date(e.endDate),
                location: e.location,
                coverImage: e.coverImage,
                accessLabels: e.accessLabels || [],
                isPublicHoliday: e.isPublicHoliday,
                isOptionalHoliday: e.isOptionalHoliday || false,
                articleUrl: e.articleUrl,
                region: e.region || 'Yogyakarta',
                country: e.country || 'Indonesia',
              }))}
              showEvents={showEvents}
            />
          )}
          {viewMode === 'month' && (
            <MonthView
              year={year}
              month={currentDate.getMonth()}
              events={events.map(e => ({
                id: e.id,
                title: e.title,
                description: e.description,
                startDate: new Date((e as any).startDate || (e as any).date),
                endDate: new Date((e as any).startDate || (e as any).date),
                location: typeof e.location === 'string' ? { name: e.location } : e.location,
                coverImage: (e as any).coverImage,
                accessLabels: (e as any).accessLabels || [],
                isPublicHoliday: e.isPublicHoliday,
                isOptionalHoliday: (e as any).isOptionalHoliday || false,
                articleUrl: (e as any).articleUrl,
                region: (e as any).region || 'Yogyakarta',
                country: (e as any).country || 'Indonesia',
              }))}
              onSelectDate={handleDateSelect}
              onDoubleClickDate={handleDateDoubleClick}
              today={new Date()}
              selectedDate={selectedDate}
              showEvents={showEvents}
            />
          )}
          {viewMode === 'week' && (
            <WeekView
              weekStart={currentDate}
              onDaySelect={d => { setViewMode('day'); setCurrentDate(d); setSelectedDate(d); }}
              events={events.map(e => ({
                id: e.id,
                title: e.title,
                description: e.description,
                startDate: new Date(e.startDate),
                endDate: new Date(e.endDate),
                location: typeof e.location === 'string' ? { name: e.location } : e.location,
                coverImage: (e as any).coverImage,
                accessLabels: (e as any).accessLabels || [],
                isPublicHoliday: e.isPublicHoliday,
                isOptionalHoliday: (e as any).isOptionalHoliday || false,
                articleUrl: (e as any).articleUrl,
                region: (e as any).region || 'Yogyakarta',
                country: (e as any).country || 'Indonesia',
              }))}
              onEventSelect={handleEventSelect}
            />
          )}
          {viewMode === 'day' && (
            <DayView 
              date={currentDate} 
              events={events.map(e => ({
                id: e.id,
                title: e.title,
                description: e.description,
                startDate: new Date(e.startDate),
                endDate: new Date(e.endDate),
                location: typeof e.location === 'string' ? { name: e.location } : e.location,
                coverImage: (e as any).coverImage,
                accessLabels: (e as any).accessLabels || [],
                isPublicHoliday: e.isPublicHoliday,
                isOptionalHoliday: (e as any).isOptionalHoliday || false,
                articleUrl: (e as any).articleUrl,
                region: (e as any).region || 'Yogyakarta',
                country: (e as any).country || 'Indonesia',
              }))}
              onEventSelect={handleEventSelect}
            />
          )}
        </div>
      </div>

      {/* Right panel - Event Details (desktop, 40%) */}
      <div className="hidden md:flex flex-col w-[40vw] min-w-0 max-w-full h-screen">
        {dailyEvents && !selectedEvent ? (
          <DailyEventsList events={dailyEvents} onEventSelect={setSelectedEvent} />
        ) : selectedEvent ? (
          <div className="flex flex-col h-full">
            {dailyEvents && (
              <button onClick={() => setSelectedEvent(null)} className="p-2 m-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
                &larr; Back to list
              </button>
            )}
            <div className="flex-grow">
              <EventDetails event={{
                id: selectedEvent.id,
                title: selectedEvent.title,
                description: selectedEvent.description,
                startDate: new Date(selectedEvent.startDate),
                endDate: new Date(selectedEvent.endDate),
                location: selectedEvent.location,
                coverImage: selectedEvent.coverImage,
                accessLabels: selectedEvent.accessLabels || [],
                isPublicHoliday: selectedEvent.isPublicHoliday,
                isOptionalHoliday: selectedEvent.isOptionalHoliday || false,
                articleUrl: selectedEvent.articleUrl,
                region: selectedEvent.region || 'Yogyakarta',
                country: selectedEvent.country || 'Indonesia',
              }} />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">Select a date to view events</p>
          </div>
        )}
      </div>

      {/* Bottom sheet - Event Details (mobile) */}
      <div className="md:hidden">
        <BottomSheet
          event={selectedEvent ? {
            id: selectedEvent.id,
            title: selectedEvent.title,
            description: selectedEvent.description,
            startDate: new Date(selectedEvent.startDate),
            endDate: new Date(selectedEvent.endDate),
            location: selectedEvent.location,
            coverImage: selectedEvent.coverImage,
            accessLabels: selectedEvent.accessLabels || [],
            isPublicHoliday: selectedEvent.isPublicHoliday,
            isOptionalHoliday: selectedEvent.isOptionalHoliday || false,
            articleUrl: selectedEvent.articleUrl,
            region: selectedEvent.region || 'Yogyakarta',
            country: selectedEvent.country || 'Indonesia',
          } : null}
          onClose={() => setSelectedEvent(null)}
        />
      </div>
    </div>
  )
}
