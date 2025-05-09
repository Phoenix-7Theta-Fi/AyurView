
'use client';

import type { Milestone } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, CircleDotDashed, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface MilestonesTrackerProps {
  milestones: Milestone[];
}

export default function MilestonesTracker({ milestones }: MilestonesTrackerProps) {
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const progressPercentage = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'in-progress':
        return <CircleDotDashed size={18} className="text-blue-500 animate-spin-slow" />;
      case 'pending':
        return <Clock size={18} className="text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: Milestone['status']): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
    switch (status) {
      case 'completed':
        return 'default'; // Uses primary color from theme
      case 'in-progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  }


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">Milestones & Progress</CardTitle>
        <div className="mt-2">
          <Progress value={progressPercentage} className="w-full h-3" />
          <p className="text-sm text-muted-foreground mt-1 text-right">{completedMilestones} of {milestones.length} milestones completed ({progressPercentage.toFixed(0)}%)</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {milestones.map(milestone => (
          <div key={milestone.id} className="p-3 bg-muted/30 rounded-md flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5">{getStatusIcon(milestone.status)}</span>
              <div>
                <h4 className="font-medium text-foreground">{milestone.title}</h4>
                {milestone.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    Due: {format(new Date(milestone.dueDate), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
            </div>
            <Badge variant={getStatusBadgeVariant(milestone.status)} className="capitalize text-xs h-6">
              {milestone.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
