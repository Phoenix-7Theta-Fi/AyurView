
'use client';

import { ResponsivePie } from '@nivo/pie';
import { useMemo } from 'react';

const generateMeditationData = () => [
  {
    id: 'Mindfulness',
    label: 'Mindfulness',
    value: Math.floor(Math.random() * 30) + 20, // sessions or minutes
    color: '#4CAF50', // Primary Green
  },
  {
    id: 'Transcendental',
    label: 'Transcendental',
    value: Math.floor(Math.random() * 20) + 10,
    color: '#A0522D', // Accent Brown
  },
  {
    id: 'Vipassana',
    label: 'Vipassana',
    value: Math.floor(Math.random() * 15) + 5,
    color: '#8BC34A', // Lighter Green
  },
  {
    id: 'Zazen',
    label: 'Zazen',
    value: Math.floor(Math.random() * 10) + 5,
    color: '#F5B041', // Orange
  },
  {
    id: 'Loving-Kindness',
    label: 'Loving-Kindness',
    value: Math.floor(Math.random() * 25) + 15,
    color: '#5DADE2', // Blue
  },
];

const commonProperties = {
  margin: { top: 40, right: 80, bottom: 80, left: 80 },
  innerRadius: 0.5, // This makes it a donut chart
  padAngle: 0.7,
  cornerRadius: 3,
  activeOuterRadiusOffset: 8,
  borderWidth: 1,
  borderColor: {
    from: 'color',
    modifiers: [['darker', 0.2]],
  },
  arcLinkLabelsSkipAngle: 10,
  arcLinkLabelsTextColor: 'hsl(var(--muted-foreground))',
  arcLinkLabelsThickness: 2,
  arcLinkLabelsColor: { from: 'color' },
  arcLabelsSkipAngle: 10,
  arcLabelsTextColor: {
    from: 'color',
    modifiers: [['darker', 3]],
  },
  defs: [ // For patterns or gradients, optional
    {
      id: 'dots',
      type: 'patternDots',
      background: 'inherit',
      color: 'rgba(255, 255, 255, 0.3)',
      size: 4,
      padding: 1,
      stagger: true,
    },
    {
      id: 'lines',
      type: 'patternLines',
      background: 'inherit',
      color: 'rgba(255, 255, 255, 0.3)',
      rotation: -45,
      lineWidth: 6,
      spacing: 10,
    },
  ],
  legends: [
    {
      anchor: 'bottom' as const,
      direction: 'row' as const,
      justify: false,
      translateX: 0,
      translateY: 56,
      itemsSpacing: 0,
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
    },
    labels: {
        text: {
            fontWeight: 'bold',
        }
    }
  },
  colors: (datum: any) => datum.data.color || '#ccc', // Use color from data
};

export default function MeditationDonutChart() {
  const data = useMemo(() => generateMeditationData(), []);

  return (
    <div className="h-96 w-full" data-ai-hint="meditation practice chart">
      <ResponsivePie
        data={data}
        {...commonProperties}
      />
    </div>
  );
}
