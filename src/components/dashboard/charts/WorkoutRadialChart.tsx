
'use client';

import { ResponsiveRadar } from '@nivo/radar';
import { useState, useEffect } from 'react';

// Types for the radar data
interface RadarDataPoint {
  metric: string;
  'Actual Score': number;
  'Target Score': number;
}

async function fetchWorkoutMetrics(date?: Date): Promise<RadarDataPoint[]> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    let url = '/api/workout-overview';
    if (date) {
      url += `?date=${date.toISOString()}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workout metrics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching workout metrics:', error);
    return [];
  }
}

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
  const [data, setData] = useState<RadarDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const metricsData = await fetchWorkoutMetrics();
        setData(metricsData);
      } catch (err) {
        setError('Failed to load workout metrics');
        console.error('Error loading workout metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (!isClient || isLoading) {
    return <div className="h-96 w-full flex items-center justify-center text-muted-foreground">Loading workout data...</div>;
  }


  if (error) {
    return <div className="h-96 w-full flex items-center justify-center text-muted-foreground">
      Error loading workout data: {error}
    </div>;
  }

  if (data.length === 0) {
    return <div className="h-96 w-full flex items-center justify-center text-muted-foreground">
      No workout data available
    </div>;
  }

  return (
    <div className="h-96 w-full relative" data-ai-hint="fitness score comparison">
      <ResponsiveRadar
        data={data}
        keys={['Actual Score', 'Target Score']}
        indexBy="metric"
        maxValue={100}
        valueFormat=">-.2f"
        margin={{ top: 60, right: 90, bottom: 50, left: 90 }}
        curve="linearClosed"
        borderWidth={2}
        gridLevels={5}
        gridShape="circular"
        gridLabelOffset={15}
        dotSize={8}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        enableDotLabel={true}
        dotLabel="value"
        dotLabelYOffset={-12}
        colors={({ key }: { key: string }) =>
          key === 'Target Score'
            ? 'hsl(210, 70%, 55%)'
            : 'hsl(var(--chart-1))'
        }
        fillOpacity={0.20}
        blendMode="normal"
        motionConfig="wobbly"
        borderColor={(item: any) => item.color}
        dotBorderColor={(item: any) => item.color}
        legends={[
          {
            anchor: 'top-right',
            direction: 'column',
            translateX: 0,
            translateY: -50,
            itemWidth: 100,
            itemHeight: 20,
            itemTextColor: 'hsl(var(--muted-foreground))',
            symbolSize: 12,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: 'hsl(var(--foreground))',
                },
              },
            ],
          },
        ]}
        theme={{
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
              text: {
                fill: "hsl(var(--muted-foreground))",
                fontSize: 10,
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
              strokeDasharray: "2 2",
            },
          },
          dots: {
            text: {
              fill: "hsl(var(--foreground))",
              fontSize: 12,
              fontWeight: 'bold',
            }
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
        }}
      />
    </div>
  );
}
