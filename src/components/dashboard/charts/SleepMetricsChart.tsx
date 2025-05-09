
'use client';

import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine, LineSvgProps, Serie } from '@nivo/line';
import { useMemo, useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';

// Helper to generate mock data for the last 30 days
const generateSleepData = () => {
  const barData = [];
  const lineDataStress: Serie = { id: 'Stress Level (1-10)', data: [], color: '#FF6347' }; // Tomato red
  const lineDataMood: Serie = { id: 'Mood Score (1-10)', data: [], color: '#4682B4' }; // Steel blue

  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const day = subDays(today, i);
    const formattedDay = format(day, 'MMM dd');

    const totalSleep = Math.floor(Math.random() * 3) + 6; // 6-8 hours total
    const rem = parseFloat((totalSleep * (Math.random() * 0.15 + 0.15)).toFixed(1)); // 15-30%
    const deep = parseFloat((totalSleep * (Math.random() * 0.1 + 0.1)).toFixed(1)); // 10-20%
    const light = parseFloat((totalSleep - rem - deep - (Math.random()*0.5)).toFixed(1)); // Remainder, ensure positive
    const awake = parseFloat((totalSleep * (Math.random() * 0.05)).toFixed(1));


    barData.push({
      day: formattedDay,
      REM: Math.max(0, rem),
      Deep: Math.max(0, deep),
      Light: Math.max(0, light),
      Awake: Math.max(0, awake),
    });

    lineDataStress.data.push({ x: formattedDay, y: Math.floor(Math.random() * 7) + 2 }); // Stress 2-8
    lineDataMood.data.push({ x: formattedDay, y: Math.floor(Math.random() * 6) + 4 });   // Mood 4-9
  }
  return { barData, lineData: [lineDataStress, lineDataMood] };
};


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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setChartData(generateSleepData());
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
      borderColor: {
        from: 'color',
        modifiers: [['darker', 1.6]],
      },
      axisTop: null,
      axisRight: null,
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
      labelTextColor: {
        from: 'color',
        modifiers: [['darker', 3]],
      },
      legends: [
        {
          title: 'Sleep Stages',
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
      motionConfig: "gentle" as const,
      theme: nivoTheme,
  };

  const lineChartProps: Omit<LineSvgProps, 'width' | 'height' | 'data'> = {
      xScale: { type: 'point' },
      yScale: {
        type: 'linear',
        min: 0, // Mental health scores typically non-negative
        max: 10, // Assuming score out of 10
        stacked: false,
        reverse: false,
      },
      margin: barChartProps.margin, // Match bar chart margins
      axisTop: null,
      axisLeft: null, // Use bar chart's left axis
      axisRight: { // Display this on the right
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Mental Health Score (1-10)',
        legendPosition: 'middle' as const,
        legendOffset: 45, // Adjust as needed
        format: (value: any) => Math.round(value)
      },
      axisBottom: null, // Use bar chart's bottom axis
      pointSize: 8,
      pointColor: { theme: 'background' },
      pointBorderWidth: 2,
      pointBorderColor: { from: 'serieColor' },
      useMesh: true,
      enableGridX: false,
      enableGridY: false, // Bar chart handles grid
      theme: nivoTheme,
      colors: (serie: any) => serie.color || '#ccc', // Use color from serie data
      lineWidth: 2,
      legends: [
        {
          title: 'Mental Health',
          anchor: 'bottom-right' as const,
          direction: 'column' as const,
          justify: false,
          translateX: 120, // Align with bar chart legends
          translateY: -100, // Position above sleep legends
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: 'left-to-right' as const,
          itemOpacity: 0.85,
          symbolSize: 12,
          symbolShape: 'circle' as const,
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
  };
  
  if (!isClient) {
    return <div className="h-[500px] w-full relative flex items-center justify-center text-muted-foreground">Loading sleep data...</div>;
  }

  return (
    <div className="h-[500px] w-full relative" data-ai-hint="sleep stress chart">
      <ResponsiveBar {...barChartProps} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <ResponsiveLine
          {...lineChartProps}
          data={lineData}
          // Important: make line chart transparent so bar chart is visible and interactive
          layers={['grid', 'markers', 'axes', 'areas', 'crosshair', 'lines', 'points', 'slices', 'mesh', 'legends']}
          theme={{
            ...nivoTheme,
            background: 'transparent', // Crucial for overlay
            grid: { line: { stroke: 'transparent' } }, // Hide line chart grid if bar chart has one
            axis: { // Hide line chart axes that overlap with bar chart
                ...nivoTheme.axis,
                bottom: undefined,
                left: undefined,
            }
          }}
          // Disable interactions on line chart points if they interfere with bar tooltips
          // enablePoints={false} 
          // enableSlices="x" // Enable tooltip for line chart
        />
      </div>
    </div>
  );
}
