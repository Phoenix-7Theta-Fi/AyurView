'use client';

import React from 'react';

const legendItems = [
  { label: '81-100% (Excellent)', colorClass: 'bg-green-600/80' },
  { label: '61-80% (Good)', colorClass: 'bg-lime-500/70' },
  { label: '41-60% (Medium)', colorClass: 'bg-yellow-400/70' },
  { label: '21-40% (Low)', colorClass: 'bg-orange-500/70' },
  { label: '0-20% (Very Low)', colorClass: 'bg-red-500/70' },
  { label: 'No Data / Future', colorClass: 'bg-muted/30' },
];

export default function CalendarLegend() {
  return (
    <div className="mt-4 p-4 bg-background/50 rounded-lg border border-border shadow-sm w-full max-w-md">
      <h4 className="text-sm font-semibold mb-3 text-center text-foreground/80">Adherence Legend</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-sm ${item.colorClass} border border-foreground/20`}></div>
            <span className="text-xs text-foreground/90">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
