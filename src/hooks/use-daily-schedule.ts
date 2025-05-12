'use client';

import { useState, useEffect } from 'react';
import type { TreatmentPlanActivity } from '@/lib/types';

interface DailyScheduleHook {
  data: TreatmentPlanActivity[];
  isLoading: boolean;
  error: string | null;
  updateActivityStatus: (activityId: string, status: 'pending' | 'completed' | 'missed') => Promise<void>;
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

  const updateActivityStatus = async (activityId: string, status: 'pending' | 'completed' | 'missed') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Optimistic update
      setData(currentData =>
        currentData.map(activity =>
          activity.id === activityId
            ? { ...activity, status }
            : activity
        )
      );

      const response = await fetch('/api/daily-schedule', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activityId, status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update activity status');
      }

    } catch (err) {
      // Revert optimistic update on error
      const errorMessage = err instanceof Error ? err.message : 'Failed to update activity status';
      setError(errorMessage);
      console.error('Error updating activity status:', err);
      
      // Re-fetch the data to ensure UI is in sync with server
      const fetchDailySchedule = async () => {
        try {
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

        } catch (fetchError) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load daily schedule');
          console.error('Error loading daily schedule:', fetchError);
        }
      };

      fetchDailySchedule();
    }
  };

  return { data, isLoading, error, updateActivityStatus };
}
