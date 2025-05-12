'use client';

import DailyScheduleView from '@/components/treatment-plan/DailyScheduleView';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDailySchedule } from '@/hooks/use-daily-schedule';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function SchedulePage() {
  const { data: activities, isLoading, error } = useDailySchedule();

  return (
    <div className="space-y-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary tracking-tight">Your Daily Wellness Schedule</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Follow your personalized daily plan for optimal health and well-being.
        </p>
      </header>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Today's Activities</CardTitle>
          <CardDescription>Click on an activity to see more details.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : (
            <DailyScheduleView activities={activities} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
