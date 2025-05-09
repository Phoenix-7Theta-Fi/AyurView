
'use client';

import { ResponsiveRadialBar } from '@nivo/radial-bar';
import { useMemo } from 'react';

const generateWorkoutData = () => [
  {
    id: 'Strength',
    data: [{ x: 'score', y: Math.floor(Math.random() * 80) + 20 }],
  },
  {
    id: 'Flexibility',
    data: [{ x: 'score', y: Math.floor(Math.random() * 70) + 30 }],
  },
  {
    id: 'VO2 Max',
    data: [{ x: 'score', y: Math.floor(Math.random() * 60) + 25 }],
  },
  {
    id: 'Endurance',
    data: [{ x: 'score', y: Math.floor(Math.random() * 90) + 10 }],
  },
  {
    id: 'Agility',
    data: [{ x: 'score', y: Math.floor(Math.random() * 75) + 25 }],
  },
];

const commonProperties = {
  padding: 0.4,
  cornerRadius: 2,
  margin: { top: 30, right: 30, bottom: 70, left: 30 },
  colors: ['#4CAF50', '#A0522D', '#8BC34A', '#F5B041', '#5DADE2'], // App theme colors
  radialAxisStart: { tickSize: 5, tickPadding: 5, tickRotation: 0 },
  circularAxisOuter: { tickSize: 5, tickPadding: 12, tickRotation: 0 },
  legends: [
    {
      anchor: 'bottom' as const,
      direction: 'row' as const,
      justify: false,
      translateX: 0,
      translateY: 56,
      itemsSpacing: 6,
      itemWidth: 100,
      itemHeight: 18,
      itemTextColor: 'hsl(var(--muted-foreground))',
      itemDirection: 'left-to-right' as const,
      itemOpacity: 1,
      symbolSize: 18,
      symbolShape: 'circle' as const,
      effects: [
        {
          on: 'hover',
          style: {
            itemTextColor: 'hsl(var(--foreground))',
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
        },
      },
    },
    grid: {
      line: {
        stroke: "hsl(var(--border))",
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
  }
};

export default function WorkoutRadialChart() {
  const data = useMemo(() => generateWorkoutData(), []);

  return (
    <div className="h-96 w-full" data-ai-hint="fitness score">
      <ResponsiveRadialBar
        data={data}
        valueFormat=">-.2f"
        maxValue={100}
        endAngle={360}
        innerRadius={0.2}
        {...commonProperties}
      />
    </div>
  );
}
