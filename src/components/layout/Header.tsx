import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';

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

export { Header };
