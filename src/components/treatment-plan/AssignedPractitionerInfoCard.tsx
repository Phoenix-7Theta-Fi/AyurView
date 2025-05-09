
'use client';

import type { Practitioner } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, UserCircle, ShieldCheck, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

interface AssignedPractitionerInfoCardProps {
  practitioner: Practitioner;
}

export default function AssignedPractitionerInfoCard({ practitioner }: AssignedPractitionerInfoCardProps) {
  const generatedImageUrl = practitioner.imageUrl || `https://randomuser.me/api/portraits/${practitioner.gender === 'male' ? 'men' : 'women'}/${parseInt(practitioner.id) % 100}.jpg`;

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center items-center">
         <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary mb-3">
            <Image
              src={generatedImageUrl}
              alt={practitioner.name}
              layout="fill"
              objectFit="cover"
              // data-ai-hint not needed here as image is specific
            />
          </div>
        <CardTitle className="text-xl font-semibold text-primary">{practitioner.name}</CardTitle>
        <CardDescription className="text-md text-accent">{practitioner.specialization}</CardDescription>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={16}
                className={index < Math.floor(practitioner.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/50'}
              />
            ))}
            <span className="ml-1.5">({practitioner.rating.toFixed(1)})</span>
          </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-foreground/90 text-center italic px-2">
          "{practitioner.bio.substring(0, 100)}{practitioner.bio.length > 100 && '...'}"
        </p>
        <div className="pt-2 border-t border-border/50">
             <Button asChild variant="outline" className="w-full">
                <Link href={`/practitioners#${practitioner.id}`}> {/* Assuming practitioner page can handle fragment ID */}
                    <UserCircle size={16} className="mr-2" /> View Full Profile
                </Link>
            </Button>
        </div>
        {/* Placeholder for contact info, not in mock data currently */}
        {/* <div className="flex items-center gap-2">
            <Mail size={14} className="text-primary" /> <span>practitioner@email.com</span>
        </div>
        <div className="flex items-center gap-2">
            <Phone size={14} className="text-primary" /> <span>+123 456 7890</span>
        </div> */}
      </CardContent>
    </Card>
  );
}
