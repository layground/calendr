import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { Button } from '../ui/button';
import { CardTitle } from '../ui/card';

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

export { SideDrawer };
