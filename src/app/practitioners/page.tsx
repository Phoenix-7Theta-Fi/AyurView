'use client';

import PractitionerCard from '@/components/practitioners/PractitionerCard';
import { Badge } from '@/components/ui/badge';
import { usePractitioners } from '@/hooks/use-practitioners';
import { Skeleton } from '@/components/ui/skeleton';

export default function PractitionersPage() {
  const { practitioners, loading, error } = usePractitioners();

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-destructive">Error Loading Practitioners</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

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
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            </div>
          ))
        ) : (
          practitioners.map(practitioner => (
            <PractitionerCard key={practitioner.id} practitioner={practitioner} />
          ))
        )}
      </div>

      <div className="text-center mt-12">
        <Badge variant="secondary" className="text-sm p-2">
          More practitioners coming soon!
        </Badge>
      </div>
    </div>
  );
}
