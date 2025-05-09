
'use client';

import type { UpcomingConsultation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, UserMd, Video, Building } from 'lucide-react'; // UserMd is a placeholder, consider an alternative if not available
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface UpcomingConsultationsListProps {
  consultations: UpcomingConsultation[];
}

const PlaceholderUserMd = UserMd || CalendarDays; // Fallback if UserMd is not a valid Lucide icon

export default function UpcomingConsultationsList({ consultations }: UpcomingConsultationsListProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">Upcoming Consultations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-80 overflow-y-auto">
        {consultations.length > 0 ? (
          consultations.map(consultation => (
            <div key={consultation.id} className="p-3 bg-muted/30 rounded-md shadow-sm border border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-foreground">{consultation.practitionerName}</h4>
                  <p className="text-xs text-muted-foreground">{consultation.specialization}</p>
                </div>
                <Badge variant={consultation.mode === 'online' ? 'secondary' : 'outline'} className="capitalize text-xs h-6 flex items-center gap-1">
                  {consultation.mode === 'online' ? <Video size={12} /> : <Building size={12} />}
                  {consultation.mode}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/90 mt-2">
                <CalendarDays size={14} className="text-accent" />
                <span>{format(new Date(consultation.date), "EEEE, MMM dd, yyyy")} at {consultation.time}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">No upcoming consultations scheduled.</p>
        )}
      </CardContent>
    </Card>
  );
}
