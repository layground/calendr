import * as React from 'react';
import { cn } from '../../lib/utils/cn';

const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400", className)} {...props} />;

export { Badge };
