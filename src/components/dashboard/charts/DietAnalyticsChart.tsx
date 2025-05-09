
'use client';

import { ResponsiveBar } from '@nivo/bar';
import { useMemo } from 'react';
import { format, subDays } from 'date-fns';

// Helper to generate mock data for the last 30 days
const generateDietData = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const day = subDays(today, i);
    data.push({
      day: format(day, 'MMM dd'),
      Protein: Math.floor(Math.random() * 50) + 20, // g
      Carbs: Math.floor(Math.random() * 150) + 50, // g
      Fats: Math.floor(Math.random() * 40) + 10, // g
      Vitamins: Math.floor(Math.random() * 30) + 5, // arbitrary units
      Minerals: Math.floor(Math.random() * 30) + 5, // arbitrary units
    });
  }
  return data;
};

const commonProperties = {
  margin: { top: 20, right: 30, bottom: 60, left: 60 },
  padding: 0.3,
  valueScale: { type: 'linear' as const },
  indexScale: { type: 'band' as const, round: true },
  colors: ['#4CAF50', '#A0522D', '#8BC34A', '#F5B041', '#5DADE2'], // Green, Brown, Light Green, Orange, Blue
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
    truncateTickAt: 0,
  },
  axisLeft: {
    tickSize: 5,
    tickPadding: 5,
    tickRotation: 0,
    legend: 'Nutrient Amount (g / units)',
    legendPosition: 'middle' as const,
    legendOffset: -50,
    truncateTickAt: 0,
  },
  labelSkipWidth: 12,
  labelSkipHeight: 12,
  labelTextColor: {
    from: 'color',
    modifiers: [['darker', 1.6]],
  },
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
  motionConfig: "gentle" as const,
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
  }
};

export default function DietAnalyticsChart() {
  const data = useMemo(() => generateDietData(), []);
  const keys = ['Protein', 'Carbs', 'Fats', 'Vitamins', 'Minerals'];

  return (
    <div className="h-[500px] w-full" data-ai-hint="nutrition chart">
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy="day"
        groupMode="stacked"
        layout="vertical"
        {...commonProperties}
      />
    </div>
  );
}
