import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

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

export { ErrorDisplay };
