
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import type { MedicationAdherenceData } from '@/lib/types';
import { addDays, format, startOfMonth } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Fetch adherence data from API
const fetchAdherenceData = async (
  date: Date,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<MedicationAdherenceData[]> => {
  setLoading(true);
  setError(null);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view adherence data');
      return [];
    }

    console.log('Fetching data with token:', token);
    const response = await fetch(`/api/medication-adherence?date=${date.toISOString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch adherence data');
    }

    return data.map((item: any) => ({
      ...item,
      date: new Date(item.date)
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch adherence data';
    console.error('Error fetching adherence data:', error);
    setError(message);
    return [];
  } finally {
    setLoading(false);
  }
};

const getAdherenceColorClass = (adherence: number | undefined): string => {
  if (adherence === undefined) return 'bg-muted/30'; // Day with no data or future day

  if (adherence <= 0.2) return 'bg-red-500/70 hover:bg-red-500/90 text-white'; // Very Low (Red)
  if (adherence <= 0.4) return 'bg-orange-500/70 hover:bg-orange-500/90 text-white'; // Low (Orange)
  if (adherence <= 0.6) return 'bg-yellow-400/70 hover:bg-yellow-400/90 text-foreground'; // Medium (Yellow)
  if (adherence <= 0.8) return 'bg-lime-500/70 hover:bg-lime-500/90 text-white'; // Good (Lime Green)
  return 'bg-green-600/80 hover:bg-green-600 text-white'; // Excellent (Primary Green - slightly darker for visibility)
};

export default function MedicationAdherenceCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [adherenceMap, setAdherenceMap] = useState<Map<string, number>>(new Map());
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchAdherenceData(currentMonth, setIsLoading, setError).then(data => {
        const newAdherenceMap = new Map(
          data.map((item) => [format(item.date, 'yyyy-MM-dd'), item.adherence])
        );
        setAdherenceMap(newAdherenceMap);
      });
    }
  }, [isClient, currentMonth]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border w-full max-w-md mx-auto flex justify-center items-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading adherence data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border w-full max-w-md mx-auto flex justify-center items-center h-[400px]">
        <div className="text-center text-destructive">
          <p className="font-medium mb-2">Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }


  if (!isClient) {
    // Render a placeholder or loading state until client-side hydration
    return (
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border w-full max-w-md mx-auto">
        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="p-0 w-full"
           classNames={{
            day: 'h-10 w-10 text-sm rounded-md',
            day_today: 'bg-accent text-accent-foreground ring-2 ring-accent ring-offset-2 ring-offset-background',
          }}
          components={{
            DayContent: ({ date, displayMonth }) => (
                 <div className="h-full w-full flex items-center justify-center rounded-md bg-muted/10 text-muted-foreground/50">{date.getDate()}</div>
            )
          }}
        />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border w-full max-w-md mx-auto">
        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="p-0 w-full"
          classNames={{
            day: 'h-10 w-10 text-sm rounded-md transition-all duration-150 ease-in-out transform hover:scale-105',
            day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
            day_today: 'bg-accent text-accent-foreground ring-2 ring-accent ring-offset-2 ring-offset-background',
          }}
          components={{
            DayContent: ({ date, displayMonth }) => {
              if (date > new Date() || date.getMonth() !== displayMonth.getMonth()) {
                 return <div className="h-full w-full flex items-center justify-center rounded-md bg-muted/10 text-muted-foreground/50">{date.getDate()}</div>;
              }
              
              const dateString = format(date, 'yyyy-MM-dd');
              const adherence = adherenceMap.get(dateString);
              const colorClass = getAdherenceColorClass(adherence);
              
              const adherenceText = adherence !== undefined ? `${(adherence * 100).toFixed(0)}% Adherence` : "No data";

              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`h-full w-full flex items-center justify-center rounded-md ${colorClass} cursor-default`}>
                      {date.getDate()}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-background text-foreground border-border shadow-lg p-2 rounded-md">
                    <p className="text-sm font-medium">{format(date, "MMMM d, yyyy")}</p>
                    <p className="text-xs">{adherenceText}</p>
                  </TooltipContent>
                </Tooltip>
              );
            },
          }}
        />
      </div>
    </TooltipProvider>
  );
}
