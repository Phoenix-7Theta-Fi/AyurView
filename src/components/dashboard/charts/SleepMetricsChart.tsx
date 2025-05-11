'use client';

import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine, LineSvgProps, Serie } from '@nivo/line';
import { useMemo, useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';

const nivoTheme = {
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
  };

export default function SleepMetricsChart() {
  const [chartData, setChartData] = useState<{ barData: any[], lineData: Serie[] }>({ barData: [], lineData: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Get date range for the last 30 days
        const endDate = new Date();
        const startDate = subDays(endDate, 29);

        const response = await fetch(
          `/api/sleep-wellness?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch sleep wellness data');
        }

        const result = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error('Invalid data format received');
        }

        // Transform API data into chart format
        const barData = result.data;
        const lineDataStress: Serie = {
          id: 'Stress Level (1-10)',
          data: result.data.map((d: any) => ({ x: d.day, y: d.stressLevel })),
          color: '#FF6347'
        };
        const lineDataMood: Serie = {
          id: 'Mood Score (1-10)',
          data: result.data.map((d: any) => ({ x: d.day, y: d.moodScore })),
          color: '#4682B4'
        };

        setChartData({
          barData,
          lineData: [lineDataStress, lineDataMood]
        });
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load sleep wellness data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const { barData, lineData } = chartData;
  const barKeys = ['REM', 'Deep', 'Light', 'Awake'];
  
  const barChartProps = {
      data: barData,
      keys: barKeys,
      indexBy: "day",
      groupMode: "stacked" as const,
      layout: "vertical" as const,
      margin: { top: 20, right: 130, bottom: 60, left: 60 },
      padding: 0.3,
      valueScale: { type: 'linear' as const },
      indexScale: { type: 'band' as const, round: true },
      colors: ['#5DADE2', '#3498DB', '#85C1E9', '#AED6F1'], // Shades of blue
      borderColor: { from: 'color' },
      axisTop: null,
      axisRight: null,
      borderRadius: 2,
      axisBottom: {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -45,
        legend: 'Day',
        legendPosition: 'middle' as const,
        legendOffset: 50,
      },
      axisLeft: {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Sleep Duration (hours)',
        legendPosition: 'middle' as const,
        legendOffset: -50,
      },
      labelSkipWidth: 12,
      labelSkipHeight: 12,
      labelTextColor: '#ffffff',
      legends: [
        {
          dataFrom: 'keys' as const,
          anchor: 'bottom-right' as const,
          direction: 'column' as const,
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: 'left-to-right' as const,
          itemOpacity: 0.85,
          symbolSize: 12,
          symbolShape: 'circle' as const,
          effects: [
            {
              on: 'hover' as const,
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ],
      animate: true,
      motionConfig: "gentle" as const,
      theme: nivoTheme,
  };

  const lineChartProps: Omit<LineSvgProps, 'width' | 'height' | 'data'> = {
      xScale: { type: 'point' },
      yScale: {
        type: 'linear',
        min: 0,
        max: 10,
        stacked: false,
        reverse: false,
      },
      margin: barChartProps.margin,
      axisTop: null,
      axisLeft: null,
      axisRight: {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Mental Health Score (1-10)',
        legendPosition: 'middle' as const,
        legendOffset: 45,
      },
      pointSize: 8,
      pointColor: { theme: 'background' },
      pointBorderWidth: 2,
      pointBorderColor: { from: 'serieColor' },
      useMesh: true,
      enableGridX: false,
      enableGridY: false,
      theme: {
        ...nivoTheme,
        background: 'transparent',
        grid: { line: { stroke: 'transparent' } },
      },
      colors: (serie: any) => serie.color || '#ccc',
      lineWidth: 2,
      legends: [
        {
          anchor: 'bottom-right' as const,
          direction: 'column' as const,
          justify: false,
          translateX: 120,
          translateY: -100,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: 'left-to-right' as const,
          itemOpacity: 0.85,
          symbolSize: 12,
          symbolShape: 'circle' as const,
          effects: [
            {
              on: 'hover' as const,
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ],
  };
  
  if (isLoading) {
    return <div className="h-[500px] w-full relative flex items-center justify-center text-muted-foreground">Loading sleep data...</div>;
  }

  if (error) {
    return <div className="h-[500px] w-full relative flex items-center justify-center text-destructive">{error}</div>;
  }

  return (
    <div className="h-[500px] w-full relative" data-ai-hint="sleep stress chart">
      <ResponsiveBar {...barChartProps} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <ResponsiveLine
          {...lineChartProps}
          data={lineData}
          layers={['grid', 'markers', 'axes', 'areas', 'crosshair', 'lines', 'points', 'slices', 'mesh', 'legends']}
        />
      </div>
    </div>
  );
}
