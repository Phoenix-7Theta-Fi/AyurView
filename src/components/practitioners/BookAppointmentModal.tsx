
'use client';

import type { Practitioner, TimeSlot } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { MOCK_TIME_SLOTS } from '@/lib/mockData'; // Updated import

interface BookAppointmentModalProps {
  practitioner: Practitioner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
  initialTime?: string;
}

export default function BookAppointmentModal({ practitioner, open, onOpenChange, initialDate, initialTime }: BookAppointmentModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(initialTime);
  const [bookingMode, setBookingMode] = useState<'online' | 'in-person'>('online');
  const { toast } = useToast();

  useEffect(() => {
    // Reset state when modal is closed or practitioner changes, but respect initial values if provided again
    if (open) {
      setSelectedDate(initialDate || undefined);
      setSelectedTime(initialTime || undefined);
      setBookingMode('online');
    } else {
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setBookingMode('online');
    }
  }, [open, practitioner, initialDate, initialTime]);

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Incomplete Information",
        description: "Please select a date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Appointment Booked!",
      description: `Your ${bookingMode} appointment with ${practitioner.name} on ${format(selectedDate, "PPP")} at ${selectedTime} has been confirmed.`,
      variant: "default",
      duration: 5000,
    });
    onOpenChange(false); // Close modal on successful booking
  };

  const availableTimeSlots = MOCK_TIME_SLOTS.filter(slot => slot.available);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground shadow-xl">
        <DialogHeader className="pt-4">
          <DialogTitle className="text-xl font-semibold text-primary text-center">Book Appointment</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            With {practitioner.name} - {practitioner.specialization}
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-2 py-4 space-y-6">
          <div>
            <Label htmlFor="appointment-date" className="text-sm font-medium text-foreground/90">Select Date</Label>
            <Calendar
              id="appointment-date"
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedTime(undefined); // Reset time when date changes
              }}
              disabled={{ before: new Date() }} // Disable past dates
              className="rounded-md border border-border mt-1 bg-background"
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary",
                day_today: "bg-accent text-accent-foreground",
              }}
            />
          </div>

          {selectedDate && (
            <div>
              <Label htmlFor="appointment-time" className="text-sm font-medium text-foreground/90">Select Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger id="appointment-time" className="w-full mt-1 bg-background border-input">
                  <SelectValue placeholder="Choose an available time slot" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground">
                  {availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map(slot => (
                      <SelectItem key={slot.time} value={slot.time}>
                        {slot.time}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-slots" disabled>No slots available for this day</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-foreground/90">Booking Mode</Label>
            <RadioGroup 
              defaultValue="online" 
              value={bookingMode} 
              onValueChange={(value: 'online' | 'in-person') => setBookingMode(value)} 
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="mode-online" className="border-primary text-primary focus:ring-primary" />
                <Label htmlFor="mode-online" className="text-sm text-foreground/80">Online</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-person" id="mode-in-person" className="border-primary text-primary focus:ring-primary" />
                <Label htmlFor="mode-in-person" className="text-sm text-foreground/80">In-person</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="px-6 pb-4 flex flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleBooking} 
            disabled={!selectedDate || !selectedTime}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
