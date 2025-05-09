
import MedicationAdherenceCalendar from '@/components/dashboard/MedicationAdherenceCalendar';
import CalendarLegend from '@/components/dashboard/CalendarLegend';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import DietAnalyticsChart from '@/components/dashboard/charts/DietAnalyticsChart';
import WorkoutRadialChart from '@/components/dashboard/charts/WorkoutRadialChart';
import CardioChart from '@/components/dashboard/charts/CardioChart';
import YogaSunburstChart from '@/components/dashboard/charts/YogaSunburstChart';
import SleepMetricsChart from '@/components/dashboard/charts/SleepMetricsChart';
import MeditationDonutChart from '@/components/dashboard/charts/MeditationDonutChart';
import BiomarkersChart from '@/components/dashboard/charts/BiomarkersChart';

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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary">Diet Analytics</CardTitle>
          <CardDescription>Daily macronutrient and micronutrient intake over the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <DietAnalyticsChart />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Workout Overview</CardTitle>
            <CardDescription>Key fitness metrics.</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <WorkoutRadialChart />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Cardio Performance</CardTitle>
            <CardDescription>Cardio workout trends over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <CardioChart />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary">Yoga Practice Breakdown</CardTitle>
          <CardDescription>Distribution of yoga types and focus areas.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <YogaSunburstChart />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary">Sleep & Mental Wellness</CardTitle>
          <CardDescription>Sleep stages and mental health metrics over the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <SleepMetricsChart />
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary">Meditation Practices</CardTitle>
          <CardDescription>Distribution of time spent in different meditation types.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <MeditationDonutChart />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary">Key Biomarkers</CardTitle>
          <CardDescription>Overview of important health indicators against optimal ranges.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <BiomarkersChart />
        </CardContent>
      </Card>
      
    </div>
  );
}
