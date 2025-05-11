'use client';

import { ResponsiveBar } from '@nivo/bar';
import { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { BarDatum, ResponsiveBarSvgProps } from '@nivo/bar';
import { Theme } from '@nivo/core';

interface DietData extends BarDatum {
  day: string;
  Protein: number;
  Carbs: number;
  Fats: number;
  Vitamins: number;
  Minerals: number;
  [key: string]: string | number;
}

const chartProperties: Partial<ResponsiveBarSvgProps<DietData>> = {
  margin: { top: 20, right: 30, bottom: 60, left: 60 },
  padding: 0.3,
  valueScale: { type: 'linear' },
  indexScale: { type: 'band', round: true },
  colors: ['#4CAF50', '#A0522D', '#8BC34A', '#F5B041', '#5DADE2'],
  borderColor: {
    from: 'color',
    modifiers: [['darker', 1.6]] as const,
  },
  axisTop: null,
  axisRight: null,
  axisBottom: {
    tickSize: 5,
    tickPadding: 5,
    tickRotation: -45,
    legend: 'Day',
    legendPosition: 'middle',
    legendOffset: 50,
    truncateTickAt: 0,
  },
  axisLeft: {
    tickSize: 5,
    tickPadding: 5,
    tickRotation: 0,
    legend: 'Nutrient Amount (g / units)',
    legendPosition: 'middle',
    legendOffset: -50,
    truncateTickAt: 0,
  },
  labelSkipWidth: 12,
  labelSkipHeight: 12,
  labelTextColor: {
    from: 'color',
    modifiers: [['darker', 1.6]] as const,
  },
  legends: [
    {
      dataFrom: 'keys',
      anchor: 'bottom-right',
      direction: 'column',
      justify: false,
      translateX: 120,
      translateY: 0,
      itemsSpacing: 2,
      itemWidth: 100,
      itemHeight: 20,
      itemDirection: 'left-to-right',
      itemOpacity: 0.85,
      symbolSize: 20,
      effects: [
        {
          on: 'hover',
          style: {
            itemOpacity: 1,
          },
        },
      ],
    },
  ],
  animate: true,
  motionConfig: 'gentle',
  theme: {
    background: "hsl(var(--card))",
    text: {
      fill: "hsl(var(--card-foreground))",
      fontSize: 11,
    },
    axis: {
      domain: {
        line: {
          stroke: "hsl(var(--border))",
          strokeWidth: 1,
        },
      },
      ticks: {
        line: {
          stroke: "hsl(var(--border))",
          strokeWidth: 1,
        },
        text: {
          fill: "hsl(var(--muted-foreground))",
        },
      },
      legend: {
        text: {
          fill: "hsl(var(--foreground))",
          fontSize: 12,
          fontWeight: 500,
        },
      },
    },
    grid: {
      line: {
        stroke: "hsl(var(--border))",
        strokeDasharray: "2 2",
      },
    },
    legends: {
      text: {
        fill: "hsl(var(--muted-foreground))",
        fontSize: 11,
      }
    },
    tooltip: {
      container: {
        background: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        fontSize: "12px",
        borderRadius: "var(--radius)",
        boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
      }
    }
  } as Theme,
};

export default function DietAnalyticsChart() {
  const [data, setData] = useState<DietData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const fetchDietData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setIsLoading(false);
          return;
        }

        // Fetch diet data for current month
        const date = new Date();
        const response = await fetch(`/api/diet-analytics?date=${date.toISOString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch diet data');
        }

        const dietData = await response.json();
        setData(dietData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching diet data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDietData();
  }, []);

  const keys = ['Protein', 'Carbs', 'Fats', 'Vitamins', 'Minerals'];

  if (!isClient) {
    return <div className="h-[500px] w-full flex items-center justify-center text-muted-foreground">Loading diet data...</div>;
  }

  if (isLoading) {
    return <div className="h-[500px] w-full flex items-center justify-center text-muted-foreground">Loading diet data...</div>;
  }

  if (error) {
    return <div className="h-[500px] w-full flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  if (data.length === 0) {
    return <div className="h-[500px] w-full flex items-center justify-center text-muted-foreground">No diet data available</div>;
  }

  return (
    <div className="h-[500px] w-full" data-ai-hint="nutrition chart">
      <ResponsiveBar<DietData>
        data={data}
        keys={keys}
        indexBy="day"
        groupMode="stacked"
        layout="vertical"
        {...chartProperties}
      />
    </div>
  );
}
