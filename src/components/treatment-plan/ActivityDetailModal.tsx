
'use client';

import type { TreatmentPlanActivity } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import DynamicIcon from './DynamicIcon'; // Import the new DynamicIcon component

interface ActivityDetailModalProps {
  activity: TreatmentPlanActivity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ActivityDetailModal({ activity, open, onOpenChange }: ActivityDetailModalProps) {
  const getStatusInfo = () => {
    switch (activity.status) {
      case 'completed':
        return { icon: <CheckCircle size={18} className="text-green-500" />, text: 'Completed', color: 'text-green-500' };
      case 'missed':
        return { icon: <XCircle size={18} className="text-red-500" />, text: 'Missed', color: 'text-red-500' };
      case 'pending':
      default:
        return { icon: <AlertCircle size={18} className="text-yellow-500" />, text: 'Pending', color: 'text-yellow-500' };
    }
  };

  const statusInfo = getStatusInfo();
  
  const getCategoryColor = () => {
    switch (activity.category.toLowerCase()) {
      case 'wellness': return 'bg-green-500';
      case 'fitness': return 'bg-blue-500';
      case 'nutrition': return 'bg-orange-500';
      case 'medical': return 'bg-red-500';
      case 'productivity': return 'bg-purple-500';
      case 'lifestyle': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground shadow-xl">
        <DialogHeader className="pt-4 text-center items-center">
          <div className={`p-3 rounded-full ${getCategoryColor()} inline-block mb-3`}>
            <DynamicIcon iconName={activity.icon} size={32} className="text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-primary">{activity.title}</DialogTitle>
          <DialogDescription className="text-md text-muted-foreground">
            Scheduled for: {activity.time}
          </DialogDescription>
          <div className="flex items-center justify-center gap-2 mt-1">
             <Badge variant="outline" className="capitalize">{activity.category}</Badge>
            <span className={`flex items-center gap-1 text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.icon}
              {statusInfo.text}
            </span>
          </div>
        </DialogHeader>
        
        <div className="px-6 py-4 space-y-4">
          <div className="prose prose-sm dark:prose-invert max-w-none max-h-60 overflow-y-auto p-2 border-t border-b border-border/50 my-2">
            <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{activity.details}</p>
          </div>
        </div>

        <DialogFooter className="px-6 pb-4">
          {/* Placeholder for actions like "Mark as Complete" */}
          {activity.status === 'pending' && (
             <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <CheckCircle size={16} className="mr-2" /> Mark as Completed
            </Button>
          )}
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
