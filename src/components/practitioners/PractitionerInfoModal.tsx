
'use client';

import type { Practitioner } from '@/lib/types';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, MapPin, CalendarDays } from 'lucide-react';

interface PractitionerInfoModalProps {
  practitioner: Practitioner;
  generatedImageUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PractitionerInfoModal({ practitioner, generatedImageUrl, open, onOpenChange }: PractitionerInfoModalProps) {
  if (!practitioner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground shadow-xl">
        <DialogHeader className="pt-4">
          <div className="relative w-full h-48 sm:h-56 rounded-t-lg overflow-hidden mb-4">
            <Image
              src={generatedImageUrl}
              alt={practitioner.name}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <DialogTitle className="text-2xl font-bold text-primary text-center">{practitioner.name}</DialogTitle>
          <DialogDescription className="text-center text-accent text-md font-medium">
            {practitioner.specialization}
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={18}
                className={index < Math.floor(practitioner.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/50'}
              />
            ))}
            <span className="ml-2">({practitioner.rating.toFixed(1)} rating)</span>
          </div>

          <p className="text-sm text-foreground/90 leading-relaxed text-justify max-h-40 overflow-y-auto p-1 border-t border-b border-border/50 my-2">
            {practitioner.bio}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3 p-2 bg-muted/30 rounded-md">
              <MapPin size={20} className="text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Location:</h4>
                <p className="text-muted-foreground">{practitioner.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2 bg-muted/30 rounded-md">
              <CalendarDays size={20} className="text-primary mt-1 flex-shrink-0" />
               <div>
                <h4 className="font-semibold text-foreground">Availability:</h4>
                <p className="text-muted-foreground">{practitioner.availability}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
