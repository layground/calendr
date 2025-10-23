import React from 'react';
import { cn } from '../../lib/utils/cn';

function Skeleton({ className }: { className: string }) {
    return <div className={cn("bg-slate-200 dark:bg-slate-800 rounded animate-pulse", className)}></div>
}

export { Skeleton };
