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
  const [showLegend, setShowLegend] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      const currentDate = new Date(date);

      // Normalize dates to midnight to compare only the date part
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      return currentDate >= startDate && currentDate <= endDate;
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
        const monthEl = document.getElementById(`month-grid-${today.getMonth()}`);
        const container = document.getElementById('year-view-scroll-container');
        if (monthEl && container) {
          const containerRect = container.getBoundingClientRect();
          const monthRect = monthEl.getBoundingClientRect();
          container.scrollTop = monthRect.top - containerRect.top - (containerRect.height / 2) + (monthRect.height / 2);
        }
      }, 0)
    }
  }

  // TODO: Add country/region selector logic

  // Regarding the privacy policy, it is a good practice to have one, especially if you plan to collect any user data.
  // For now, this app does not collect any personal data, so it is not strictly necessary.
  // However, if you add features like user accounts, analytics, or even a contact form, you should add a privacy policy.

  return (
    <div className="flex min-h-screen-dynamic flex-col md:flex-row">
      {/* Left Drawer for Settings */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative flex w-64 h-full bg-white dark:bg-slate-800 shadow-xl">
            <div className="p-4 space-y-4">
              <h2 className="text-lg font-semibold">Settings</h2>

              <button onClick={() => setShowTerms(true)} className="w-full text-left text-sm font-medium p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">Terms of Use</button>
              <footer className="text-center text-xs text-gray-500 absolute bottom-4 left-0 right-0">
                2025 &copy; Layground
              </footer>
            </div>
            <button onClick={() => setIsDrawerOpen(false)} className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Left panel - Calendar (50% on md, 68% on lg) */}
      <div className="flex flex-col gap-2 md:gap-4 border-b border-gray-200 p-2 md:p-4 dark:border-slate-700 md:border-b-0 md:border-r md:w-[50vw] lg:w-[68vw] w-full min-w-0">
        <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-1 md:gap-2">
                            <div className="hidden md:flex items-center gap-1 md:gap-2">
                              <button onClick={handleToday} className="rounded px-3 py-1 bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm">Today</button>
                            </div>
                            <button
                              onClick={() => setShowEvents(!showEvents)}
                              className={`rounded p-2 md:px-3 md:py-1 border text-xs md:text-sm flex items-center gap-1 ${showEvents ? 'bg-primary-100 dark:bg-primary-800' : ''}`}
                            >
                              {showEvents ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-1.293-1.293a3 3 0 014.242 0l1.293 1.293m-3.232 3.232l3.232-3.232M3 3l18 18" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                              <span className="hidden md:inline">{showEvents ? 'Hide Events' : 'Show Events'}</span>
                            </button>
                            <ThemeToggle />
                            <button onClick={() => setIsDrawerOpen(true)} className="p-1.5 md:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 z-50 flex">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                              </svg>
                            </button>            </div>
        </div>
        {/* Action Bar */}
        <div className="border rounded-lg p-2 md:p-3 dark:border-slate-700">
          <div className="flex flex-col gap-2 md:gap-3">
            {/* Date Navigation */}
            <div className="flex items-center gap-1 md:gap-2">
              <button onClick={handlePrev} className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-700" aria-label="Previous">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-semibold text-sm md:text-lg flex-1 text-center truncate">
              {viewMode === 'year' && year}
              {viewMode === 'month' && (
                <>
                  <span className="hidden md:inline">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <span className="md:hidden">
                    {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                  </span>
                </>
              )}
              {viewMode === 'week' && (
                <>
                  <span className="hidden md:inline">
                    Week of {currentDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                  </span>
                  <span className="md:hidden">
                    Week of {currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </>
              )}
              {viewMode === 'day' && (
                <>
                  <span className="hidden md:inline">
                    {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="md:hidden">
                    {currentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </>
              )}
              </span>
              <button onClick={handleNext} className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-700" aria-label="Next">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center gap-1 md:gap-2 text-xs">
              <div className="flex items-center gap-1 md:gap-2 order-2 md:order-1">
                <button className="rounded-md px-2 py-1 md:px-3 md:py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs md:text-sm hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500">Indonesia</button>
                <select
                  className="rounded-md px-2 py-1 md:px-3 md:py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs md:text-sm hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="-">Region</option>
                  <option value="YO">Yogyakarta</option>
                  <option value="SB">Surabaya</option>
                </select>
              </div>

              {/* View Mode Switcher */}
              <div className="flex gap-0.5 md:gap-1 order-1 md:order-2 md:ml-auto">
                <button onClick={() => setViewMode('year')} className={`px-2 py-1 rounded text-xs ${viewMode === 'year' ? 'bg-primary-100 dark:bg-primary-800' : ''}`}>Year</button>
                <button onClick={() => setViewMode('month')} className={`px-2 py-1 rounded text-xs ${viewMode === 'month' ? 'bg-primary-100 dark:bg-primary-800' : ''}`}>Month</button>
                <button onClick={() => setViewMode('week')} className={`px-2 py-1 rounded text-xs ${viewMode === 'week' ? 'bg-primary-100 dark:bg-primary-800' : ''}`}>Week</button>
                <button onClick={() => setViewMode('day')} className={`px-2 py-1 rounded text-xs ${viewMode === 'day' ? 'bg-primary-100 dark:bg-primary-800' : ''}`}>Day</button>
              </div>
              <div className="relative order-3">
                <button onClick={() => setShowLegend(!showLegend)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                {showLegend && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10 p-4">
                    <h4 className="font-bold mb-2">Legend</h4>
                    <ul>
                      <li className="flex items-center mb-1"><span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span> Public Holiday</li>
                      <li className="flex items-center mb-1"><span className="w-4 h-4 rounded-full bg-purple-500 mr-2"></span> Public Holiday (Weekend)</li>
                      <li className="flex items-center mb-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span> Joint Public Holiday</li>
                      <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2"></span> Local Event</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
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

      {/* Right panel - Event Details (desktop, 50% on md, 32% on lg) */}
      <div className="hidden md:flex flex-col w-[50vw] lg:w-[32vw] min-w-0 max-w-full h-screen">
        {dailyEvents && !selectedEvent ? (
          <DailyEventsList events={dailyEvents} onEventSelect={setSelectedEvent} />
        ) : selectedEvent ? (
          <div className="flex flex-col h-full">
            <div className="flex-grow">
              <EventDetails onBack={() => setSelectedEvent(null)} event={{
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
      <div className="md:hidden fixed bottom-4 right-4 z-10">
        <button onClick={handleToday} className="rounded-full bg-primary-500 text-white p-3 shadow-lg hover:bg-primary-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      {showTerms && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">Terms of Use</h3>
            <div className="text-sm space-y-4 max-h-96 overflow-y-auto">
                <p>Welcome to Calendr. By using our website, you agree to these terms. Please read them carefully.</p>
                <p><strong>Content:</strong> Our content is for informational purposes only. We do not guarantee its accuracy and are not liable for any errors.</p>
                <p><strong>Use of Website:</strong> You may use our website for personal, non-commercial purposes. You may not modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information, software, products or services obtained from this website.</p>
                <p><strong>Disclaimer:</strong> The materials on Calendr's website are provided on an 'as is' basis. Calendr makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                <p><strong>Limitation of Liability:</strong> In no event shall Calendr or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Calendr's website, even if Calendr or a Calendr authorized representative has been notified orally or in writing of the possibility of such damage.</p>
            </div>
            <button onClick={() => setShowTerms(false)} className="mt-4 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
