
import PractitionerCard from '@/components/practitioners/PractitionerCard';
import { mockPractitioners } from '@/lib/mockData'; // Updated import
import { Badge } from '@/components/ui/badge';

export default function PractitionersPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary tracking-tight sm:text-4xl">
          Connect with Our Experts
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse our curated list of experienced Ayurvedic practitioners, yoga therapists, and wellness coaches. Find the right guide for your journey to holistic health.
        </p>
      </div>
      
      {/* Placeholder for Filters and Search - Future Enhancement */}
      {/* 
      <div className="py-4 px-2 bg-card rounded-lg shadow-sm border border-border">
        <p className="text-center text-muted-foreground">Filters and Search Functionality (Coming Soon)</p>
      </div> 
      */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
        {mockPractitioners.map(practitioner => (
          <PractitionerCard key={practitioner.id} practitioner={practitioner} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Badge variant="secondary" className="text-sm p-2">
          More practitioners coming soon!
        </Badge>
      </div>
    </div>
  );
}
