
'use client';

import { ResponsiveBullet } from '@nivo/bullet';
import { useMemo } from 'react';

// Simplified list of biomarkers for demonstration
const biomarkerConfig = [
  { id: 'Glucose (mg/dL)', ranges: [70, 90, 100, 125], target: 95 }, // Low, Optimal Low, Optimal High, High
  { id: 'Cholesterol (mg/dL)', ranges: [120, 160, 200, 240], target: 180 },
  { id: 'Blood Pressure (Systolic)', ranges: [90, 110, 120, 140], target: 115 },
  { id: 'Blood Pressure (Diastolic)', ranges: [60, 70, 80, 90], target: 75 },
  { id: 'Vitamin D (ng/mL)', ranges: [20, 30, 50, 80], target: 40 },
  { id: 'Heart Rate (bpm)', ranges: [50, 60, 80, 100], target: 70 },
  { id: 'BMI', ranges: [18.5, 22, 25, 30], target: 23 }, // Underweight, Healthy, Overweight, Obese
  { id: 'Sleep Quality (%)', ranges: [60, 75, 85, 100], target: 90 },
];


const generateBiomarkerData = () => {
  return biomarkerConfig.map(bm => ({
    id: bm.id,
    ranges: bm.ranges, // Min, Low-Optimal, Mid-Optimal, Max-Optimal, High (adjust based on actual data needs)
    measures: [Math.floor(Math.random() * (bm.ranges[3] - bm.ranges[0])) + bm.ranges[0]], // Actual measured value within overall range
    markers: [bm.target], // Target/Optimal value
  }));
};

const commonProperties = {
  margin: { top: 10, right: 90, bottom: 10, left: 150 }, // Increased left margin for labels
  layout: 'horizontal' as const,
  rangeColors: ['#FFD700', '#90EE90', '#FFD700', '#FFA07A'] as any, // Gold, LightGreen (Optimal), Gold, LightSalmon - needs 1 less than ranges.length
  measureColors: ['#A0522D'] as any, // Accent Brown for actual measure
  markerColors: ['#4CAF50'] as any, // Primary Green for target marker
  spacing: 30, // Space between bullet charts
  titleAlign: 'start' as const,
  titleOffsetX: -140, // Adjust to align title/biomarker name
  measureSize: 0.4,
  markerSize: 0.6,
  theme: {
    background: "hsl(var(--card))",
    textColor: "hsl(var(--card-foreground))", // For titles/labels
    fontSize: 11,
    axis: { // Not typically used in bullet, but good to have defaults
        ticks: { text: { fill: "hsl(var(--muted-foreground))" }},
        legend: { text: { fill: "hsl(var(--foreground))" }}
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
  }
};

export default function BiomarkersChart() {
  const data = useMemo(() => generateBiomarkerData(), []);

  // Calculate dynamic height based on number of biomarkers
  const chartHeight = data.length * 60 + commonProperties.margin.top + commonProperties.margin.bottom; // 60px per biomarker + margins

  return (
    <div style={{ height: `${chartHeight}px`, width: '100%' }} data-ai-hint="health metrics">
      <ResponsiveBullet
        data={data}
        {...commonProperties}
        // Custom tooltip to show more details
        tooltip={({ id, value, color, data: itemData }: any) => (
          <div
            style={{
              padding: '8px 12px',
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <strong>{id}</strong>
            <br />
            Current Value: {value}
            <br />
            Target: {itemData.markers[0]}
            <br />
            Ranges: {itemData.ranges.join(' | ')}
          </div>
        )}
      />
    </div>
  );
}
