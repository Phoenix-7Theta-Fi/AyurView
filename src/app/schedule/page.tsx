
import DailyScheduleView from '@/components/treatment-plan/DailyScheduleView';
import { mockDailySchedule } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SchedulePage() {
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
          <DailyScheduleView activities={mockDailySchedule} />
        </CardContent>
      </Card>
    </div>
  );
}
