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

import idData from '@/data/id.json'

const getEventsForYear = (data: CountryData, regionCode: string, year: number) => {
  const region = data.regions.find(r => r.regionCode === regionCode)
  if (!region) return []
  return region.events.filter(e => {
    const d = new Date(e.startDate)
    return d.getFullYear() === year
  })
}

export default function Home() {

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<RegionEvent | null>(null)
  const [dailyEvents, setDailyEvents] = useState<RegionEvent[] | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [year, setYear] = useState(currentDate.getFullYear())
  const [country, setCountry] = useState('ID')
  const [region, setRegion] = useState('YO')
  const [events, setEvents] = useState<RegionEvent[]>([])
  const [showEvents, setShowEvents] = useState(false)

  useEffect(() => {
    // Load events for selected year/region
    setEvents(getEventsForYear(idData as CountryData, region, year))
  }, [year, region])

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

  const handlePrevYear = () => setYear(y => y - 1)
  const handleNextYear = () => setYear(y => y + 1)
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
      {/* Left panel - Calendar (60%) */}
      <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-700 md:border-b-0 md:border-r md:w-[60vw] w-full min-w-0">
        <div className="flex items-center justify-between mb-2">
          <Logo />
          <ThemeToggle />
        </div>
        {/* Action Bar */}
        <div className="flex items-center gap-2 mb-2">
          <button onClick={handlePrevYear} className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Previous year">◀</button>
          <span className="font-semibold text-lg w-16 text-center">{year}</span>
          <button onClick={handleNextYear} className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Next year">▶</button>
          <button onClick={handleToday} className="ml-2 rounded px-3 py-1 bg-primary-500 text-white hover:bg-primary-600 transition-colors">Go to Today</button>
          {/* Country/Region Selectors (future) */}
          <button className="ml-2 rounded px-3 py-1 border border-gray-300 dark:border-gray-700">Indonesia</button>
          <button className="rounded px-3 py-1 border border-gray-300 dark:border-gray-700">Yogyakarta</button>
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
