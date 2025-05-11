'use client';

import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import SleepMetricsChart from '@/components/dashboard/charts/SleepMetricsChart';

type AnalyticsCardProps = {
  data: {
    type: string;
    timeframe: string;
  };
};

export default function AnalyticsCard({ data }: AnalyticsCardProps) {
  // Render the appropriate chart based on the analytics type
  const renderChart = () => {
    switch (data.type) {
      case 'sleep-wellness':
        return <SleepMetricsChart />;
      // Add more chart types as needed
      default:
        return (
          <div className="p-4 text-muted-foreground">
            Chart type not supported yet: {data.type}
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold capitalize">
            {data.type.replace('-', ' ')} Analytics
          </h3>
          <p className="text-sm text-muted-foreground">
            Data for the last {data.timeframe}
          </p>
        </div>
        <div className="w-full h-[400px]">
          {renderChart()}
        </div>
      </div>
    </Card>
  );
}
