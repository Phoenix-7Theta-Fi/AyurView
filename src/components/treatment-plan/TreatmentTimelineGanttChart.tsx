'use client';

import type { GanttTask } from '@/lib/types';
import { ResponsiveBar, BarDatum } from '@nivo/bar';
import { addDays, differenceInDays, format, min, max, startOfDay } from 'date-fns';
import React, { useMemo, useState, useEffect } from 'react';

interface TreatmentTimelineGanttChartProps {
  tasks: GanttTask[];
}

// Internal data structure for our Gantt chart items
interface GanttDataItem {
  id: string;
  taskName: string;
  empty_segment: number;
  active_segment: number;
  category: GanttTask['category'];
  originalData: GanttTask;
}

// Type for data that will be passed to Nivo chart
type NivoGanttDatum = {
  [key: string]: string | number; // Index signature for Nivo compatibility
} & {
  id: string;
  taskName: string;
  empty_segment: number;
  active_segment: number;
  category: string;
};

const categoryColors: Record<GanttTask['category'], string> = {
  Wellness: 'hsl(var(--chart-1))', // Green
  Diet: 'hsl(var(--chart-2))',     // Brown
  Medication: 'hsl(var(--chart-3))', // Light Green
  Therapy: 'hsl(var(--chart-4))',    // Muted Yellow/Gold
  Fitness: 'hsl(var(--chart-5))',    // Muted Orange
  Lifestyle: 'hsl(var(--chart-1))', // Re-use a color or add a new one if needed
};

export default function TreatmentTimelineGanttChart({ tasks }: TreatmentTimelineGanttChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { nivoData, overallMinDate, overallMaxDate, totalTimelineDays } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { nivoData: [], overallMinDate: new Date(), overallMaxDate: addDays(new Date(), 30), totalTimelineDays: 30 };
    }

    const taskDates = tasks.flatMap(task => [new Date(task.startDate), new Date(task.endDate)]);
    let minChartDate = startOfDay(min(taskDates));
    let maxChartDate = startOfDay(max(taskDates));
    
    // Ensure a minimum timeline span, e.g., 30 days, even if all tasks are short or same day
    if (differenceInDays(maxChartDate, minChartDate) < 30) {
      maxChartDate = addDays(minChartDate, 30);
    }

    const transformedData = tasks.map(task => {
      const taskStartDate = startOfDay(new Date(task.startDate));
      const taskEndDate = startOfDay(new Date(task.endDate));
      
      const emptySegment = differenceInDays(taskStartDate, minChartDate);
      const activeSegment = Math.max(1, differenceInDays(taskEndDate, taskStartDate) + 1); // Ensure at least 1 day duration

      return {
        id: task.id,
        taskName: task.name,
        empty_segment: Math.max(0, emptySegment), // Cannot be negative
        active_segment: activeSegment,
        category: task.category,
        originalData: task,
      };
    }).sort((a,b) => new Date(a.originalData.startDate).getTime() - new Date(b.originalData.startDate).getTime() || a.taskName.localeCompare(b.taskName)); // Sort by start date then name

    return { 
      nivoData: transformedData, 
      overallMinDate: minChartDate, 
      overallMaxDate: maxChartDate,
      totalTimelineDays: differenceInDays(maxChartDate, minChartDate) + 1
    };
  }, [tasks]);

  if (!isClient) {
    return <div className="h-[500px] w-full flex items-center justify-center text-muted-foreground">Loading timeline...</div>;
  }
  
  if (tasks.length === 0) {
    return <div className="h-[500px] w-full flex items-center justify-center text-muted-foreground">No treatment activities to display in timeline.</div>;
  }

  const tickValues = [];
  if(totalTimelineDays > 0 && isFinite(totalTimelineDays)) {
    // Generate ticks, e.g., every 7 or 30 days, or first of month
    let currentDate = overallMinDate;
    while(currentDate <= overallMaxDate) {
      const dayNumber = differenceInDays(currentDate, overallMinDate);
      tickValues.push(dayNumber);
      if (totalTimelineDays <= 90) { // More frequent ticks for shorter timelines
        currentDate = addDays(currentDate, 7);
      } else {
        currentDate = addDays(currentDate, 30);
      }
    }
    if(!tickValues.includes(totalTimelineDays - 1)) tickValues.push(totalTimelineDays - 1);
  }

  return (
    <div className="h-[500px] w-full" data-ai-hint="gantt chart schedule">
      <ResponsiveBar
        data={nivoData.map(item => {
          const chartData: NivoGanttDatum = {
            id: item.id,
            taskName: item.taskName,
            empty_segment: item.empty_segment,
            active_segment: item.active_segment,
            category: item.category.toString()
          };
          return chartData;
        })}
        keys={['empty_segment', 'active_segment']}
        indexBy="taskName"
        layout="horizontal"
        margin={{ top: 20, right: 30, bottom: 70, left: 200 }} // Increased left margin for task names
        padding={0.4}
        valueScale={{ type: 'linear', min: 0, max: totalTimelineDays }}
        indexScale={{ type: 'band', round: true }}
        colors={({ id, data }) => {
          if (id === 'empty_segment') return 'transparent';
          const category = (data as NivoGanttDatum).category as GanttTask['category'];
          return categoryColors[category] || 'hsl(var(--muted))';
        }}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: 'Timeline (Days from Start)',
          legendPosition: 'middle',
          legendOffset: 55,
          tickValues: tickValues,
          format: (dayNumber) => {
            const date = addDays(overallMinDate, dayNumber);
            return format(date, 'MMM d');
          },
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
        }}
        enableGridY={true}
        gridYValues={nivoData.map(d => d.taskName)}
        enableGridX={true}
        gridXValues={tickValues}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
        tooltip={({ id, value, data }) => {
          if (id === 'empty_segment') return null; // Don't show tooltip for empty segment
          // Since we excluded originalData from the chart data, we need to find the original item
          const originalItem = nivoData.find(item => item.id === data.id) as GanttDataItem;
          const { taskName, originalData, category } = originalItem;
          const duration = differenceInDays(new Date(originalData.endDate), new Date(originalData.startDate)) + 1;
          return (
            <div className="p-2 bg-background text-foreground shadow-lg rounded-md border text-sm">
              <strong className="text-primary">{taskName}</strong><br />
              Category: {category}<br />
              Start: {format(new Date(originalData.startDate), 'MMM d, yyyy')}<br />
              End: {format(new Date(originalData.endDate), 'MMM d, yyyy')}<br />
              Duration: {duration} day{duration > 1 ? 's' : ''}
              {originalData.status && <><br />Status: <span className="capitalize">{originalData.status}</span></>}
            </div>
          );
        }}
        theme={{
          background: "hsl(var(--card))",
          text: {
            color: "hsl(var(--card-foreground))",
            fontSize: 11,
          },
          axis: {
            domain: { line: { stroke: "hsl(var(--border))", strokeWidth: 1 } },
            ticks: { line: { stroke: "hsl(var(--border))", strokeWidth: 1 }, text: { fill: "hsl(var(--muted-foreground))" } },
            legend: { text: { fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 500 } },
          },
          grid: { line: { stroke: "hsl(var(--border))", strokeDasharray: "2 2" } },
          tooltip: { container: { background: "hsl(var(--background))", color: "hsl(var(--foreground))", fontSize: 12, borderRadius: "var(--radius)", boxShadow: "0 3px 6px rgba(0,0,0,0.1)" } },
        }}
        animate={true}
        motionConfig="gentle"
      />
    </div>
  );
}
