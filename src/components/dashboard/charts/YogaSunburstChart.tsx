'use client';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useState, useEffect } from 'react';
import { useYogaPractices } from '@/hooks/use-yoga-practices';

// Define a cohesive color palette
const YOGA_COLORS = {
  hatha: ['#5A67D8', '#805AD5', '#D53F8C'],
  vinyasa: ['#38A169', '#319795', '#3182CE'],
  yin: ['#DD6B20', '#D69E2E', '#FAF089'],
  ashtanga: ['#F472B6', '#E879F9', '#A78BFA'],
  kundalini: ['#10B981', '#059669', '#047857'],
  center: '#CBD5E0',
  background: '#1A202C',
  border: '#2D3748',
  text: '#E2E8F0',
};

// Function to assign colors dynamically based on level and name
const assignColors = (node: any, level: number = 0, parentColor?: string) => {
  let color;
  if (level === 1) {
    // Assign base colors to top-level categories
    if (node.name.toLowerCase().includes('hatha')) color = YOGA_COLORS.hatha[0];
    else if (node.name.toLowerCase().includes('vinyasa')) color = YOGA_COLORS.vinyasa[0];
    else if (node.name.toLowerCase().includes('yin')) color = YOGA_COLORS.yin[0];
    else if (node.name.toLowerCase().includes('ashtanga')) color = YOGA_COLORS.ashtanga[0];
    else if (node.name.toLowerCase().includes('kundalini')) color = YOGA_COLORS.kundalini[0];
    else color = '#cccccc'; // Fallback
  } else if (parentColor) {
    color = parentColor;
  } else {
    color = '#cccccc'; // Fallback for root or unexpected cases
  }

  node.itemStyle = {
    ...node.itemStyle,
    color: color,
  };

  if (node.children) {
    node.children.forEach((child: any) => assignColors(child, level + 1, color));
  }
};


export default function YogaSunburstChart() {
  const { data, isLoading, error, totalPracticeTime } = useYogaPractices();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Apply colors to the data when available
  if (data.length > 0) {
    data.forEach(child => assignColors(child, 1));
  }

  if (!isClient || isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="h-[450px] w-full flex items-center justify-center text-slate-500">
          Loading yoga practice data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="h-[450px] w-full flex items-center justify-center text-slate-500">
          Error: {error}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="h-[450px] w-full flex items-center justify-center text-slate-500">
          No yoga practice data available
        </div>
      </div>
    );
  }

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = params.data as { name: string; value: number };
        if (!data || data.value === undefined) return '';

        const value = data.value;
        const percent = totalPracticeTime > 0 ? ((value / totalPracticeTime) * 100).toFixed(1) : 0;
        const path = params.treePathInfo.map((item: any) => item.name).join(' > ');

        return `
          <div style="font-size: 14px; color: #eee; background: rgba(40, 40, 40, 0.85); border-radius: 4px; padding: 8px 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            <strong>${data.name}</strong><br/>
            <span style="font-size: 12px; color: #bbb;">Path: ${path}</span><br/>
            Practice Time: ${value} min (${percent}%)
          </div>
        `;
      },
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      padding: 0,
      textStyle: {
        color: YOGA_COLORS.text,
      },
    },
    title: {
      text: `{val|${totalPracticeTime}}\n{desc|Total Mins}`,
      left: 'center',
      top: 'center',
      textStyle: {
        rich: {
          val: {
            fontSize: 30,
            fontWeight: 'bold',
            color: '#1A202C',
            lineHeight: 35,
          },
          desc: {
            fontSize: 14,
            color: '#4A5568',
            lineHeight: 20,
          }
        }
      }
    },
    series: {
      type: 'sunburst',
      data: data,
      radius: ['25%', '95%'],
      sort: undefined,
      itemStyle: {
        borderRadius: 8,
        borderWidth: 3,
        borderColor: YOGA_COLORS.border,
      },
      label: {
        show: true,
        rotate: 0,
        color: YOGA_COLORS.text,
        fontSize: 11,
        minAngle: 15,
        position: 'inside',
        formatter: '{b}',
        align: 'center',
        verticalAlign: 'middle',
        padding: [15, 5, 15, 5],
      },
      emphasis: {
        focus: 'ancestor',
        itemStyle: {
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowColor: 'rgba(255, 255, 255, 0.5)',
          opacity: 1,
        },
        label: {
          fontSize: 13,
          fontWeight: 'bold',
        }
      },
      levels: [
        {},
        {
          r0: '25%',
          r: '45%',
          label: {
            fontSize: 14,
            fontWeight: 'bold',
            rotate: 'tangential',
            align: 'center',
          },
          itemStyle: {
            borderWidth: 4,
          }
        },
        {
          r0: '45%',
          r: '65%',
          label: {
            fontSize: 12,
            rotate: 'tangential',
            align: 'center',
          },
          itemStyle: {
            borderWidth: 3,
          }
        },
        {
          r0: '65%',
          r: '80%',
          label: {
            fontSize: 11,
            rotate: 'tangential',
            align: 'right',
          },
          itemStyle: {
            borderWidth: 2,
          }
        },
        {
          r0: '80%',
          r: '95%',
          label: {
            show: false
          },
          itemStyle: {
            borderWidth: 1,
          }
        }
      ],
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h3 className="text-slate-800 font-semibold text-lg mb-4 text-center">
        Yoga Practice Distribution
      </h3>
      <ReactECharts
        option={option}
        style={{ height: '450px' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
}
