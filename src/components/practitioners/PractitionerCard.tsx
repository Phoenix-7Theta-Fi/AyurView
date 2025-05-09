
'use client';

import type { Practitioner } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, CalendarDays, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PractitionerCardProps {
  practitioner: Practitioner;
}

export default function PractitionerCard({ practitioner }: PractitionerCardProps) {
  const { toast } = useToast();

  const handleBookAppointment = () => {
    toast({
      title: "Booking In-Progress",
      description: `Appointment booking for ${practitioner.name} is coming soon!`,
      duration: 3000,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative w-full h-48">
          <Image
            src={practitioner.imageUrl}
            alt={practitioner.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={practitioner.dataAiHint || "person professional"}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-semibold text-primary mb-1">{practitioner.name}</CardTitle>
        <CardDescription className="text-accent font-medium mb-2">{practitioner.specialization}</CardDescription>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={16}
              className={index < Math.floor(practitioner.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/50'}
            />
          ))}
          <span className="ml-1.5">({practitioner.rating.toFixed(1)})</span>
        </div>

        <p className="text-sm text-foreground/90 mb-3 h-20 overflow-y-auto text-ellipsis">
          {practitioner.bio}
        </p>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-primary" />
            <span>{practitioner.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-primary" />
            <span>{practitioner.availability}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/30">
        <Button onClick={handleBookAppointment} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <CheckCircle size={18} className="mr-2" />
          Book Appointment
        </Button>
      </CardFooter>
    </Card>
  );
}
