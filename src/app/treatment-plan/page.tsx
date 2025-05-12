'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProblemOverviewCard from '@/components/treatment-plan/ProblemOverviewCard';
import BiomarkersConcernCard from '@/components/treatment-plan/BiomarkersConcernCard';
import AssignedPractitionerInfoCard from '@/components/treatment-plan/AssignedPractitionerInfoCard';
import UpcomingConsultationsList from '@/components/treatment-plan/UpcomingConsultationsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MilestonesTracker from '@/components/treatment-plan/MilestonesTracker';
import TreatmentTimelineGanttChart from '@/components/treatment-plan/TreatmentTimelineGanttChart';
import { Button } from '@/components/ui/button';

export default function TreatmentPlanPage() {
  const router = useRouter();
  const [treatmentPlan, setTreatmentPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTreatmentPlan() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your treatment plan');
          return;
        }

        const response = await fetch('/api/treatment-plan', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch treatment plan');
        }

        const data = await response.json();
        setTreatmentPlan(data);
      } catch (error) {
        setError('Failed to load treatment plan');
      }
    }

    fetchTreatmentPlan();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-2xl font-semibold text-primary">{error}</h1>
        <Button onClick={() => router.push('/')}>Go to Login</Button>
      </div>
    );
  }

  if (!treatmentPlan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-semibold text-primary">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary tracking-tight">Your Personalized Treatment Plan</h1>
        <p className="text-lg text-muted-foreground mt-2">
          A holistic approach to guide you towards better health and well-being.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <ProblemOverviewCard 
            overview={treatmentPlan.problemOverview}
          />
          <MilestonesTracker milestones={treatmentPlan.milestones} />
        </div>
        <div className="space-y-8">
          <AssignedPractitionerInfoCard practitioner={treatmentPlan.assignedPractitioner} />
          <UpcomingConsultationsList consultations={treatmentPlan.upcomingConsultations} />
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Treatment Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <TreatmentTimelineGanttChart tasks={treatmentPlan.treatmentTimeline} />
        </CardContent>
      </Card>

      <BiomarkersConcernCard biomarkers={treatmentPlan.biomarkers} />
      
      {/* DailyScheduleView removed from here */}
      {/* 
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Daily Wellness Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyScheduleView activities={mockDailySchedule} />
        </CardContent>
      </Card>
      */}

    </div>
  );
}
