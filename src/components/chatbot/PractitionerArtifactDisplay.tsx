
'use client';

import type { Practitioner } from '@/lib/types';
import PractitionerCard from '@/components/practitioners/PractitionerCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PractitionerArtifactDisplayProps {
  practitioners: Practitioner[];
  // Callbacks for actions on PractitionerCard will be handled by the card itself
  // as it already has modal logic. If more complex interaction specific to artifact view
  // is needed, props for callbacks can be added here.
}

export default function PractitionerArtifactDisplay({ practitioners }: PractitionerArtifactDisplayProps) {
  if (!practitioners || practitioners.length === 0) {
    return <p className="text-muted-foreground text-sm p-4">No practitioners to display.</p>;
  }

  return (
    <div className="space-y-3">
      {practitioners.map(practitioner => (
        <PractitionerCard key={practitioner.id} practitioner={practitioner} />
      ))}
    </div>
  );
}
