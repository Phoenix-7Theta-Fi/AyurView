'use client';

import { useState, useEffect } from 'react';
import type { TreatmentPlanActivity } from '@/lib/types';

interface DailyScheduleHook {
  data: TreatmentPlanActivity[];
  isLoading: boolean;
  error: string | null;
}

export function useDailySchedule(): DailyScheduleHook {
  const [data, setData] = useState<TreatmentPlanActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailySchedule = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/daily-schedule', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch daily schedule');
        }

        const result = await response.json();
        setData(result.data);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load daily schedule');
        console.error('Error loading daily schedule:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailySchedule();
  }, []); // Empty dependency array as we only need to fetch once

  return { data, isLoading, error };
}
