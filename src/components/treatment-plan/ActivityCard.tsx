
'use client';

import type { TreatmentPlanActivity } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import DynamicIcon from './DynamicIcon';

interface ActivityCardProps {
  activity: TreatmentPlanActivity;
  onClick: () => void;
  onStatusUpdate?: (activityId: string, status: 'pending' | 'completed' | 'missed') => Promise<void>;
}

export default function ActivityCard({ activity, onClick, onStatusUpdate }: ActivityCardProps) {
  const getStatusIcon = () => {
    switch (activity.status) {
      case 'completed':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'missed':
        return <XCircle size={18} className="text-red-500" />;
      case 'pending':
      default:
        return <AlertCircle size={18} className="text-yellow-500" />;
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
    <Card 
      className="shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-grow">
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-primary/10 text-primary w-16 h-16">
            <DynamicIcon iconName={activity.icon} size={24} />
            <span className="text-xs font-medium mt-1">{activity.time}</span>
          </div>
          <div className="flex-grow">
            <CardTitle className="text-lg font-semibold text-foreground">{activity.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-0.5">{activity.description}</CardDescription>
            <div className="mt-2 flex items-center gap-2">
              <Badge className={`text-xs capitalize ${getCategoryColor()}`}>{activity.category}</Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
                {getStatusIcon()}
                {activity.status}
              </span>
            </div>
          </div>
        </div>
          <div className="flex gap-2 items-center">
            {activity.status !== 'completed' && onStatusUpdate && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent modal from opening
                  onStatusUpdate(activity.id, 'completed');
                }}
              >
                Mark as Completed
              </Button>
            )}
            <ArrowRight size={20} className="text-muted-foreground shrink-0" />
          </div>
      </CardContent>
    </Card>
  );
}
