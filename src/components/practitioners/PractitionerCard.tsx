'use client';

import type { Practitioner } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, CalendarDays, Info, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PractitionerInfoModal from './PractitionerInfoModal';
import BookAppointmentModal from './BookAppointmentModal';
import { useToast } from '@/hooks/use-toast';
import { bookConsultation } from '@/hooks/use-practitioners';

interface PractitionerCardProps {
  practitioner: Practitioner;
}

export default function PractitionerCard({ practitioner }: PractitionerCardProps) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleBookClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book an appointment",
        variant: "destructive"
      });
      router.push('/login');
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleBookAppointment = async (date: string, time: string, mode: 'online' | 'in-person') => {
    try {
      setIsBooking(true);
      await bookConsultation({
        practitionerId: practitioner._id?.toString() || practitioner.id,
        date,
        time,
        mode
      });
      
      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${practitioner.name} has been scheduled for ${date} at ${time}.`,
      });
      
      setIsBookingModalOpen(false);
    } catch (error) {
      // Handle authentication errors
      if (error instanceof Error && error.message.includes('sign in')) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to book an appointment",
          variant: "destructive"
        });
        setIsBookingModalOpen(false);
        router.push('/login');
      } else {
        // Handle other booking errors
        toast({
          title: "Booking Failed",
          description: error instanceof Error ? error.message : "Failed to book appointment",
          variant: "destructive"
        });
      }
    } finally {
      setIsBooking(false);
    }
  };

  // Generate a consistent image URL
  const generatedImageUrl = practitioner.imageUrl || `https://picsum.photos/seed/${practitioner.name.toLowerCase().replace(/\s+/g, '_')}/400/400`;

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
          <Button 
            onClick={handleBookClick} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isBooking}
          >
            <CheckCircle size={18} className="mr-2" />
            {isBooking ? 'Booking...' : 'Book'}
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
        onBook={handleBookAppointment}
        isBooking={isBooking}
      />
    </>
  );
}
