'use client';

import type { TreatmentPlanActivity } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import DynamicIcon from '../treatment-plan/DynamicIcon';

interface ScheduleActivityCardProps {
  activity: TreatmentPlanActivity;
}

export default function ScheduleActivityCard({ activity }: ScheduleActivityCardProps) {
  const getStatusIcon = () => {
    switch (activity.status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'missed':
        return <XCircle size={16} className="text-red-500" />;
      case 'pending':
      default:
        return <AlertCircle size={16} className="text-yellow-500" />;
    }
  };
  
  const getCategoryColor = () => {
    switch (activity.category.toLowerCase()) {
      case 'wellness': return 'bg-green-100 text-green-700 border-green-300';
      case 'fitness': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'nutrition': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medical': return 'bg-red-100 text-red-700 border-red-300';
      case 'productivity': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'lifestyle': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <Card className="shadow-sm border-primary/10 max-w-sm">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="flex flex-col items-center justify-center p-1.5 rounded-md bg-primary/10 text-primary w-12 h-12">
          <DynamicIcon iconName={activity.icon} size={18} />
          <span className="text-[10px] font-medium">{activity.time}</span>
        </div>
        <div className="flex-grow min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate">{activity.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{activity.description}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge className={`text-[10px] capitalize px-1.5 py-0.5 ${getCategoryColor()}`}>
              {activity.category}
            </Badge>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground capitalize">
              {getStatusIcon()}
              {activity.status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
