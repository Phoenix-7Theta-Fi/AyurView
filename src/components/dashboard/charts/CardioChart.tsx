'use client';

import { ResponsiveLine } from '@nivo/line';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const transformCardioData = (rawData: any[]) => {
  const durationSeries = {
    id: 'Duration (min)',
    color: '#4CAF50', // Primary Green
    data: [] as { x: string; y: number }[],
  };
  const distanceSeries = {
    id: 'Distance (km)',
    color: '#A0522D', // Accent Brown
    data: [] as { x: string; y: number }[],
  };

  // Sort data by date ascending
  rawData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  rawData.forEach(record => {
    const formattedDate = format(new Date(record.date), 'MMM dd');
    durationSeries.data.push({
      x: formattedDate,
      y: record.metrics.duration
    });
    distanceSeries.data.push({
      x: formattedDate,
      y: record.metrics.distance
    });
  });

  return [durationSeries, distanceSeries];
};

const commonProperties = {
  margin: { top: 20, right: 50, bottom: 60, left: 60 },
  xScale: { type: 'point' as const },
  yScale: {
    type: 'linear' as const,
    min: 'auto' as const,
    max: 'auto' as const,
    stacked: false,
    reverse: false,
  },
  yFormat: " >-.2f",
  axisTop: null,
  axisRight: null,
  axisBottom: {
    tickSize: 5,
    tickPadding: 5,
    tickRotation: -45,
    legend: 'Date',
    legendOffset: 50,
    legendPosition: 'middle' as const,
    truncateTickAt: 0,
  },
  axisLeft: {
    tickSize: 5,
    tickPadding: 5,
    tickRotation: 0,
    legend: 'Value',
    legendOffset: -50,
    legendPosition: 'middle' as const,
    truncateTickAt: 0,
  },
  pointSize: 8,
  pointColor: { theme: 'background' as const },
  pointBorderWidth: 2,
  pointBorderColor: { from: 'serieColor' as const },
  pointLabelYOffset: -12,
  useMesh: true,
  legends: [
    {
      anchor: 'top-right' as const,
      direction: 'column' as const,
      justify: false,
      translateX: 60,
      translateY: 0,
      itemsSpacing: 0,
      itemDirection: 'left-to-right' as const,
      itemWidth: 80,
      itemHeight: 20,
      itemOpacity: 0.75,
      symbolSize: 12,
      symbolShape: 'circle' as const,
      symbolBorderColor: 'rgba(0, 0, 0, .5)',
      effects: [
        {
          on: "hover" as const,
          style: {
            itemBackground: 'rgba(0, 0, 0, .03)',
            itemOpacity: 1,
          },
        },
      ],
    },
  ],
  theme: {
    background: "hsl(var(--card))",
    textColor: "hsl(var(--card-foreground))",
    fontSize: 11,
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
    tooltip: {
      container: {
        background: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        fontSize: 12,
        borderRadius: "var(--radius)",
        boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
      },
    },
    legends: {
       text: {
        fill: "hsl(var(--muted-foreground))",
      }
    }
  },
  colors: (datum: any) => datum.color || '#A0522D', // Default to accent brown if no color
  lineWidth: 2,
};

export default function CardioChart() {
  const [data, setData] = useState<any[]>([
    {
      id: 'Duration (min)',
      color: '#4CAF50',
      data: [],
    },
    {
      id: 'Distance (km)',
      color: '#A0522D',
      data: [],
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/cardio-performance', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cardio data');
        }

        const rawData = await response.json();
        setData(transformCardioData(rawData));
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-muted-foreground">
        Error: {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-muted-foreground">
        Loading cardio data...
      </div>
    );
  }

  if (!data[0].data.length && !data[1].data.length) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-muted-foreground">
        No cardio data available
      </div>
    );
  }

  return (
    <div className="h-96 w-full" data-ai-hint="running graph">
      <ResponsiveLine
        data={data}
        {...commonProperties}
      />
    </div>
  );
}
