
'use client';

import type { Practitioner } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, CalendarDays, Info, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import PractitionerInfoModal from './PractitionerInfoModal';
import BookAppointmentModal from './BookAppointmentModal';

interface PractitionerCardProps {
  practitioner: Practitioner;
}

export default function PractitionerCard({ practitioner }: PractitionerCardProps) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const generatedImageUrl = practitioner.imageUrl || `https://randomuser.me/api/portraits/${practitioner.gender === 'male' ? 'men' : 'women'}/${parseInt(practitioner.id) % 100}.jpg`;

  return (
    <>
      <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="p-0">
          <div className="relative w-full h-48">
            <Image
              src={generatedImageUrl}
              alt={practitioner.name}
              layout="fill"
              objectFit="cover"
              // data-ai-hint removed as image source is now specific (randomuser.me)
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
            {practitioner.bio.substring(0, 120)}{practitioner.bio.length > 120 && '...'}
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
        <CardFooter className="p-4 bg-muted/30 flex gap-2">
          <Button onClick={() => setIsInfoModalOpen(true)} variant="outline" className="w-full">
            <Info size={18} className="mr-2" />
            Info
          </Button>
          <Button onClick={() => setIsBookingModalOpen(true)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <CheckCircle size={18} className="mr-2" />
            Book 
          </Button>
        </CardFooter>
      </Card>

      <PractitionerInfoModal 
        practitioner={practitioner} 
        generatedImageUrl={generatedImageUrl}
        open={isInfoModalOpen} 
        onOpenChange={setIsInfoModalOpen} 
      />
      <BookAppointmentModal 
        practitioner={practitioner} 
        open={isBookingModalOpen} 
        onOpenChange={setIsBookingModalOpen} 
      />
    </>
  );
}
