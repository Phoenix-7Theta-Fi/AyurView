
'use client';

import type { TreatmentPlanActivity } from '@/lib/types';
import ActivityCard from './ActivityCard';
import ActivityDetailModal from './ActivityDetailModal';
import React, { useState } from 'react';
import { useDailySchedule } from '@/hooks/use-daily-schedule';

interface DailyScheduleViewProps {
  activities: TreatmentPlanActivity[];
}

export default function DailyScheduleView({ activities }: DailyScheduleViewProps) {
  const { updateActivityStatus } = useDailySchedule();
  const [selectedActivity, setSelectedActivity] = useState<TreatmentPlanActivity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (activity: TreatmentPlanActivity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const sortedActivities = [...activities].sort((a, b) => {
    // Basic time sort, assumes HH:MM AM/PM format. Could be more robust.
    const timeA = new Date(`1970/01/01 ${a.time}`);
    const timeB = new Date(`1970/01/01 ${b.time}`);
    return timeA.getTime() - timeB.getTime();
  });


  return (
    <div className="space-y-4">
      {sortedActivities.length > 0 ? (
        sortedActivities.map(activity => (
          <ActivityCard 
            key={activity.id} 
            activity={activity} 
            onClick={() => handleCardClick(activity)}
            onStatusUpdate={updateActivityStatus}
          />
        ))
      ) : (
        <p className="text-muted-foreground text-center py-6">No activities scheduled for today.</p>
      )}

      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </div>
  );
}
