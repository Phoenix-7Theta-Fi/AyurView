import MedicationAdherenceCalendar from '@/components/dashboard/MedicationAdherenceCalendar';
import CalendarLegend from '@/components/dashboard/CalendarLegend';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Medication Adherence Calendar</CardTitle>
          <CardDescription>
            Track your daily medication adherence. Colors indicate the percentage of medication taken.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 p-6">
          <MedicationAdherenceCalendar />
          <CalendarLegend />
        </CardContent>
      </Card>
      
      {/* Placeholder for more analytics */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary">More Analytics Coming Soon</CardTitle>
          <CardDescription>
            We are working on bringing you more insightful health analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>Stay tuned for updates!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
