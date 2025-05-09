
'use client';

import type { ConcerningBiomarker } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Activity, CalendarClock } from 'lucide-react';

interface BiomarkersConcernCardProps {
  biomarkers: ConcerningBiomarker[];
}

export default function BiomarkersConcernCard({ biomarkers }: BiomarkersConcernCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">Key Biomarkers to Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {biomarkers.map(marker => (
          <div key={marker.id} className="p-4 bg-muted/30 rounded-lg shadow-sm border border-border/50">
            <h4 className="text-md font-semibold text-foreground mb-1">{marker.name} <span className="text-xs text-muted-foreground">({marker.unit})</span></h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center">
                <Activity size={16} className="mr-2 text-accent" />
                Current: <span className="font-medium ml-1">{marker.currentValue}</span>
              </div>
              <div className="flex items-center">
                <Target size={16} className="mr-2 text-green-500" />
                Target: <span className="font-medium ml-1">{marker.targetValue}</span>
              </div>
              <div className="flex items-center">
                <CalendarClock size={16} className="mr-2 text-blue-500" />
                Last Checked: <span className="font-medium ml-1">{marker.lastChecked}</span>
              </div>
            </div>
          </div>
        ))}
        {biomarkers.length === 0 && (
          <p className="text-muted-foreground text-center py-4">No specific biomarkers are currently being tracked.</p>
        )}
      </CardContent>
    </Card>
  );
}
