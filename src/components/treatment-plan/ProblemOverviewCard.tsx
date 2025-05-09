
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, ListChecks } from 'lucide-react';

interface ProblemOverviewCardProps {
  overview: {
    problemTitle: string;
    problemDescription: string;
    treatmentPlanSummary: string;
    goals: string[];
  };
}

export default function ProblemOverviewCard({ overview }: ProblemOverviewCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">{overview.problemTitle}</CardTitle>
        <CardDescription className="text-md text-muted-foreground pt-1">{overview.problemDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
            <ListChecks size={20} className="mr-2 text-accent" />
            Treatment Plan Summary
          </h3>
          <p className="text-sm text-foreground/90 leading-relaxed">{overview.treatmentPlanSummary}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
            <CheckCircle size={20} className="mr-2 text-accent" />
            Key Goals
          </h3>
          <ul className="list-disc list-inside space-y-1 pl-2">
            {overview.goals.map((goal, index) => (
              <li key={index} className="text-sm text-foreground/90">{goal}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
