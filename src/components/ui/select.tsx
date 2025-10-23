import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

const SelectPrimitive = ({ children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative">
        <select className={cn("appearance-none h-10 w-full rounded-md border border-slate-200 bg-transparent pl-3 pr-8 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-50", className)} {...props}>
            {children}
        </select>
        <ChevronRight className="h-4 w-4 absolute top-1/2 right-2 -translate-y-1/2 rotate-90 text-slate-400" />
    </div>
);

export { SelectPrimitive };
