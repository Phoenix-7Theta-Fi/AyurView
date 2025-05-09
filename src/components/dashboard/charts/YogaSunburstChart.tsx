
'use client';

import { ResponsiveSunburst } from '@nivo/sunburst';
import { useMemo } from 'react';

const generateYogaData = () => ({
  name: 'Yoga Practices',
  color: 'hsl(var(--background))', // Root color
  children: [
    {
      name: 'Hatha',
      color: '#4CAF50', // Primary Green
      children: [
        {
          name: 'Posture Alignment',
          color: '#6fbf73',
          children: [
            { name: 'Improved Balance', loc: Math.floor(Math.random() * 50) + 10, color: '#93cf97' },
            { name: 'Spinal Health', loc: Math.floor(Math.random() * 50) + 10, color: '#93cf97' },
          ],
        },
        {
          name: 'Breath Control',
          color: '#6fbf73',
          children: [{ name: 'Stress Reduction', loc: Math.floor(Math.random() * 50) + 10, color: '#93cf97' }],
        },
      ],
    },
    {
      name: 'Vinyasa',
      color: '#A0522D', // Accent Brown
      children: [
        {
          name: 'Dynamic Flow',
          color: '#b3704b',
          children: [
            { name: 'Cardio Benefits', loc: Math.floor(Math.random() * 50) + 10, color: '#c68e69' },
            { name: 'Stamina Building', loc: Math.floor(Math.random() * 50) + 10, color: '#c68e69' },
          ],
        },
      ],
    },
    {
      name: 'Yin',
      color: '#8BC34A', // Lighter Green
      children: [
        {
          name: 'Deep Stretch',
          color: '#a2cf6d',
          children: [
            { name: 'Flexibility', loc: Math.floor(Math.random() * 50) + 10, color: '#b9db90' },
            { name: 'Joint Health', loc: Math.floor(Math.random() * 50) + 10, color: '#b9db90' },
          ],
        },
      ],
    },
     {
      name: 'Ashtanga',
      color: '#F5B041', // Orange
      children: [
        {
          name: 'Structured Sequence',
          color: '#f7c167',
          children: [
            { name: 'Discipline', loc: Math.floor(Math.random() * 50) + 10, color: '#f9d38d' },
            { name: 'Strength', loc: Math.floor(Math.random() * 50) + 10, color: '#f9d38d' },
          ],
        },
      ],
    },
    {
      name: 'Kundalini',
      color: '#5DADE2', // Blue
      children: [
        {
          name: 'Energy Awakening',
          color: '#7ebfe8',
          children: [
            { name: 'Spiritual Growth', loc: Math.floor(Math.random() * 50) + 10, color: '#9fcfee' },
            { name: 'Awareness', loc: Math.floor(Math.random() * 50) + 10, color: '#9fcfee' },
          ],
        },
      ],
    },
  ],
});


const commonProperties = {
  margin: { top: 10, right: 10, bottom: 10, left: 10 },
  id: 'name' as const,
  value: 'loc' as const,
  cornerRadius: 2,
  borderColor: 'hsl(var(--background))',
  borderWidth: 2,
  childColor: { from: 'color', modifiers: [['brighter', 0.1]] } as any, // Nivo types can be tricky here
  inheritColorFromParent: false, // Use explicit colors defined in data
  enableArcLabels: true,
  arcLabelsSkipAngle: 10,
  arcLabelsTextColor: 'hsl(var(--background))', // Ensure contrast
  theme: {
    background: "hsl(var(--card))",
    textColor: "hsl(var(--card-foreground))", // For labels outside if any
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
     labels: { // Specifically for arc labels
        text: {
            fill: "hsl(var(--background))", // Make labels on arcs white for visibility
            fontWeight: 600,
        }
    }
  },
  colors: (node: any) => node.data.color || '#ccc', // Use color from data, fallback
};

export default function YogaSunburstChart() {
  const data = useMemo(() => generateYogaData(), []);

  return (
    <div className="h-96 w-full" data-ai-hint="yoga types">
      <ResponsiveSunburst
        data={data}
        {...commonProperties}
      />
    </div>
  );
}
