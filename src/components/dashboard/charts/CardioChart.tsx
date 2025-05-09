
'use client';

import { ResponsiveLine } from '@nivo/line';
import { useMemo } from 'react';
import { format, subDays, addDays } from 'date-fns';


const generateCardioData = () => {
  const today = new Date();
  const data = [
    {
      id: 'Duration (min)',
      color: '#4CAF50', // Primary Green
      data: [] as { x: string; y: number }[],
    },
    {
      id: 'Distance (km)',
      color: '#A0522D', // Accent Brown
      data: [] as { x: string; y: number }[],
    },
  ];

  for (let i = 29; i >= 0; i--) {
    const day = subDays(today, i);
    // Simulate workout every other day
    if (i % 2 === 0) {
      data[0].data.push({
        x: format(day, 'MMM dd'),
        y: Math.floor(Math.random() * 40) + 20, // Duration 20-60 min
      });
      data[1].data.push({
        x: format(day, 'MMM dd'),
        y: parseFloat((Math.random() * 8 + 2).toFixed(1)), // Distance 2-10 km
      });
    }
  }
  return data;
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
          on: 'hover',
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
  const data = useMemo(() => generateCardioData(), []);

  return (
    <div className="h-96 w-full" data-ai-hint="running graph">
      <ResponsiveLine
        data={data}
        {...commonProperties}
      />
    </div>
  );
}
