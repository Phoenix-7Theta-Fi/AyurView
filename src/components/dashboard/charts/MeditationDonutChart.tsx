'use client';

import { ResponsivePie } from '@nivo/pie';
import { useMemo, useState, useEffect } from 'react';
import type { LegendAnchor, LegendDirection } from '@nivo/legends';
import { MeditationPractice, MeditationData } from '@/lib/types';

const PRACTICE_COLORS = {
  'mindfulness': '#4CAF50',    // Primary Green
  'breath-work': '#8BC34A',    // Light Green
  'body-scan': '#A0522D',      // Brown
  'loving-kindness': '#5DADE2', // Blue
  'transcendental': '#F5B041',  // Orange
  'guided': '#9B59B6'          // Purple
};

async function fetchMeditationData(date?: string): Promise<MeditationPractice[]> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const url = new URL('/api/meditation-practices', window.location.origin);
  if (date) url.searchParams.set('date', date);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch meditation data');
  }

  return response.json();
}

function processMeditationData(practices: MeditationPractice[]): MeditationData {
  const practicesByType: { [key: string]: { completed: number; attempted: number; totalDuration: number } } = {};
  let totalSessions = 0;
  let completedSessions = 0;
  let totalDuration = 0;

  practices.forEach(practice => {
    if (!practicesByType[practice.practiceType]) {
      practicesByType[practice.practiceType] = {
        completed: 0,
        attempted: 0,
        totalDuration: 0
      };
    }

    practicesByType[practice.practiceType].attempted++;
    totalSessions++;
    
    if (practice.completed) {
      practicesByType[practice.practiceType].completed++;
      completedSessions++;
    }

    practicesByType[practice.practiceType].totalDuration += practice.duration;
    totalDuration += practice.duration;
  });

  return {
    practicesByType,
    totalSessions,
    completionRate: totalSessions > 0 ? completedSessions / totalSessions : 0,
    totalDuration
  };
}

type ChartData = {
  id: string;
  label: string;
  value: number;
  color: string;
};

const commonProperties = {
  margin: { top: 20, right: 40, bottom: 70, left: 40 },
  innerRadius: 0.5,
  padAngle: 0.7,
  cornerRadius: 3,
  activeOuterRadiusOffset: 8,
  borderWidth: 1,
  enableArcLinkLabels: true,
  arcLinkLabelsSkipAngle: 10,
  arcLinkLabelsTextColor: 'hsl(var(--muted-foreground))',
  arcLinkLabelsThickness: 2,
  arcLinkLabelsColor: { from: 'color' },
  arcLabelsSkipAngle: 10,
  arcLabelsTextColor: '#ffffff',
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
        fill: "#ffffff",
        fontWeight: 'bold',
      }
    }
  }
};

export default function MeditationDonutChart() {
  const [data, setData] = useState<MeditationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const practices = await fetchMeditationData();
        const processedData = processMeditationData(practices);
        setData(processedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load meditation data');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];

    return Object.entries(data.practicesByType).map(([type, stats]) => ({
      id: type,
      label: type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value: stats.completed,
      color: PRACTICE_COLORS[type as keyof typeof PRACTICE_COLORS]
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-muted-foreground">
        Loading meditation data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-destructive">
        Error: {error}
      </div>
    );
  }

  if (!data || chartData.length === 0) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-muted-foreground">
        No meditation data available
      </div>
    );
  }

  return (
    <div className="h-96 w-full" data-ai-hint="meditation practice chart">
      <div className="mb-4 text-sm text-muted-foreground text-center">
        Total Sessions: {data.totalSessions} | Completion Rate: {(data.completionRate * 100).toFixed(1)}%
        <br />
        Total Duration: {Math.round(data.totalDuration)} minutes
      </div>
      <ResponsivePie<ChartData>
        data={chartData}
        colors={datum => datum.data.color}
        {...commonProperties}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 50,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: 'hsl(var(--muted-foreground))',
            symbolSize: 18
          }
        ]}
      />
    </div>
  );
}
