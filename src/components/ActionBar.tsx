import React from 'react';
import { ChevronLeft, ChevronRight, Dot, Info } from 'lucide-react';
import { Button } from './ui/button';
import { SelectPrimitive } from './ui/select';
import { cn } from '../lib/utils/cn';
import { View } from '../lib/types/event';
import { LegendPopover } from './LegendPopover';

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
        Agenda: currentDate.getFullYear().toString(),
    };

    return (
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 bg-white dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center justify-between space-x-2 w-full sm:w-auto">
                    {/* <SelectPrimitive value={selectedCountry} onChange={(e) => onCountryChange(e.target.value)} aria-label="Select Country" className="w-full"><option value="ID">Indonesia</option></SelectPrimitive> */}
                    <SelectPrimitive value={selectedRegion} onChange={(e) => onRegionChange(e.target.value)} aria-label="Select Region" className="w-full"><option value="YOG">Yogyakarta</option></SelectPrimitive>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <div className="w-24 sm:w-28"><SelectPrimitive value={view} onChange={(e) => onViewChange(e.target.value as View)} aria-label="Select calendar view"><option>Year</option><option>Month</option><option>Week</option><option>Day</option><option>Agenda</option></SelectPrimitive></div>
                        <Button onClick={onDotsToggle} variant="ghost" size="icon" aria-label={showEventDots ? "Hide event indicators" : "Show event indicators"}><Dot className={cn("h-12 w-12", showEventDots ? 'text-blue-600' : 'text-slate-400')} /></Button>
                        <LegendPopover />
                    </div>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0">
                    <Button onClick={onPrev} variant="ghost" size="icon" aria-label={`Previous ${view}`}><ChevronLeft className="h-5 w-5" /></Button>
                    <h2 className="w-32 sm:w-48 text-center text-md sm:text-lg font-semibold" suppressHydrationWarning>{viewTitles[view]}</h2>
                    <Button onClick={onNext} variant="ghost" size="icon" aria-label={`Next ${view}`}><ChevronRight className="h-5 w-5" /></Button>
                </div>
            </div>
        </div>
    );
}

export { ActionBar };