'use client';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

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

// Generate mock data with 4 layers
const generateYogaData = () => ({
  name: 'Yoga Practices',
  children: [
    {
      name: 'Hatha Yoga',
      value: 180,
      children: [
        {
          name: 'Posture Alignment',
          value: 100,
          children: [
            { 
              name: 'Balance Practice',
              value: 50,
              children: [
                { name: 'Standing Poses', value: 25 },
                { name: 'Core Strength', value: 25 }
              ]
            },
            { 
              name: 'Spine Health',
              value: 50,
              children: [
                { name: 'Back Bends', value: 25 },
                { name: 'Twists', value: 25 }
              ]
            }
          ],
        },
        {
          name: 'Breath Control',
          value: 80,
          children: [
            {
              name: 'Pranayama',
              value: 80,
              children: [
                { name: 'Meditation', value: 40 },
                { name: 'Energy Work', value: 40 }
              ]
            }
          ],
        },
      ],
    },
    {
      name: 'Vinyasa Flow',
      value: 150,
      children: [
        {
          name: 'Dynamic Flow',
          value: 150,
          children: [
            {
              name: 'Power Yoga',
              value: 75,
              children: [
                { name: 'Strength Flow', value: 40 },
                { name: 'Core Flow', value: 35 }
              ]
            },
            {
              name: 'Endurance',
              value: 75,
              children: [
                { name: 'Flow Sequences', value: 40 },
                { name: 'Transitions', value: 35 }
              ]
            }
          ],
        },
      ],
    },
    {
      name: 'Yin Yoga',
      value: 120,
      children: [
        {
          name: 'Deep Stretch',
          value: 120,
          children: [
            {
              name: 'Joint Health',
              value: 60,
              children: [
                { name: 'Hip Opening', value: 30 },
                { name: 'Shoulder Release', value: 30 }
              ]
            },
            {
              name: 'Fascia Release',
              value: 60,
              children: [
                { name: 'Meridian Work', value: 30 },
                { name: 'Tissue Release', value: 30 }
              ]
            }
          ],
        },
      ],
    },
    {
      name: 'Ashtanga',
      value: 140,
      children: [
        {
          name: 'Traditional Series',
          value: 140,
          children: [
            {
              name: 'Primary Series',
              value: 70,
              children: [
                { name: 'Sun Salutations', value: 35 },
                { name: 'Standing Sequence', value: 35 }
              ]
            },
            {
              name: 'Intermediate',
              value: 70,
              children: [
                { name: 'Backbends', value: 35 },
                { name: 'Arm Balances', value: 35 }
              ]
            }
          ],
        },
      ],
    },
    {
      name: 'Kundalini',
      value: 110,
      children: [
        {
          name: 'Energy Work',
          value: 110,
          children: [
            {
              name: 'Chakra Focus',
              value: 55,
              children: [
                { name: 'Lower Chakras', value: 30 },
                { name: 'Upper Chakras', value: 25 }
              ]
            },
            {
              name: 'Kriya Practice',
              value: 55,
              children: [
                { name: 'Breathing', value: 30 },
                { name: 'Movement', value: 25 }
              ]
            }
          ],
        },
      ],
    },
  ],
});

export default function YogaSunburstChart() {
  // Get mock data and calculate total time
  const data = generateYogaData();
  const totalPracticeTime = data.children.reduce((sum, child) => sum + (child.value || 0), 0);

  // Apply colors to the data
  data.children.forEach(child => assignColors(child, 1));

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
      data: data.children,
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
