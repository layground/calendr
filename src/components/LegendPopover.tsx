import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

function LegendPopover() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <Button onClick={() => setIsOpen(!isOpen)} variant="ghost" size="icon" aria-label="Show legend"><Info className="h-5 w-5" /></Button>
            {isOpen && (
                <>
                    <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-10"></div>
                    <Card className="absolute top-full left-0 mt-2 w-64 z-20">
                        <CardHeader><CardTitle>Legend</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center"><div className="w-6 h-6 flex items-center justify-center mr-3"><span className="font-bold text-blue-500">15</span></div> Today</li>
                                <li className="flex items-center"><div className="w-6 h-6 flex items-center justify-center mr-3"><span className="font-bold text-red-500">15</span></div> Holiday / Weekend</li>
                                <li className="flex items-center"><div className="w-6 h-6 flex items-center justify-center mr-3"><span className="font-bold text-purple-500">16</span></div> Holiday on Weekend</li>
                                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-3 ml-2"></span> Joint Public Holiday</li>
                                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-slate-400 mr-3 ml-2"></span> Event</li>
                            </ul>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}

export { LegendPopover };
