import { useState, useEffect } from 'react';

interface SunburstNode {
  name: string;
  value: number;
  children?: SunburstNode[];
}

interface YogaPracticesHook {
  data: SunburstNode[];
  isLoading: boolean;
  error: string | null;
  totalPracticeTime: number;
}

export function useYogaPractices(startDate?: Date, endDate?: Date): YogaPracticesHook {
  const [data, setData] = useState<SunburstNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPracticeTime, setTotalPracticeTime] = useState(0);

  useEffect(() => {
    const fetchYogaPractices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Build URL with optional date parameters
        let url = '/api/yoga-practices';
        if (startDate || endDate) {
          const params = new URLSearchParams();
          if (startDate) params.append('startDate', startDate.toISOString());
          if (endDate) params.append('endDate', endDate.toISOString());
          url = `${url}?${params.toString()}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch yoga practices');
        }

        const practicesData = await response.json();
        setData(practicesData);

        // Calculate total practice time
        const total = practicesData.reduce((sum: number, node: SunburstNode) => {
          return sum + node.value;
        }, 0);
        setTotalPracticeTime(total);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load yoga practices');
        console.error('Error loading yoga practices:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchYogaPractices();
  }, [startDate, endDate]);

  return { data, isLoading, error, totalPracticeTime };
}
