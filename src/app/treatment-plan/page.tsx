
"use client";

import { useEffect, useState } from 'react';
import ProblemOverviewCard from '@/components/treatment-plan/ProblemOverviewCard';
import BiomarkersConcernCard from '@/components/treatment-plan/BiomarkersConcernCard';
import AssignedPractitionerInfoCard from '@/components/treatment-plan/AssignedPractitionerInfoCard';
import UpcomingConsultationsList from '@/components/treatment-plan/UpcomingConsultationsList';
// import DailyScheduleView from '@/components/treatment-plan/DailyScheduleView'; // Removed
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockProblemOverview, mockMilestones, mockConcerningBiomarkers, mockAssignedPractitioner, mockUpcomingConsultations, mockTreatmentTimeline } from '@/lib/mockData';
import MilestonesTracker from '@/components/treatment-plan/MilestonesTracker';
import TreatmentTimelineGanttChart from '@/components/treatment-plan/TreatmentTimelineGanttChart';

export default function TreatmentPlanPage() {
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("token") && JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.firstName) {
      setFirstName(user.firstName);
    }
  }, []);

  return (
    <div className="space-y-8">
      <header className="text-center mb-12">
        {firstName && (
          <h2 className="text-2xl text-primary mb-6">Welcome back, {firstName}!</h2>
        )}
        <h1 className="text-4xl font-bold text-primary tracking-tight">Your Personalized Treatment Plan</h1>
        <p className="text-lg text-muted-foreground mt-2">
          A holistic approach to guide you towards better health and well-being.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <ProblemOverviewCard 
            overview={mockProblemOverview}
          />
          <MilestonesTracker milestones={mockMilestones} />
        </div>
        <div className="space-y-8">
          <AssignedPractitionerInfoCard practitioner={mockAssignedPractitioner} />
          <UpcomingConsultationsList consultations={mockUpcomingConsultations} />
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Treatment Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <TreatmentTimelineGanttChart tasks={mockTreatmentTimeline} />
        </CardContent>
      </Card>

      <BiomarkersConcernCard biomarkers={mockConcerningBiomarkers} />
      
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
