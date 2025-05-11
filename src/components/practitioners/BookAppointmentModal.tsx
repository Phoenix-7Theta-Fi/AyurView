'use client';

import type { Practitioner } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarOff } from 'lucide-react';

interface BookAppointmentModalProps {
  practitioner: Practitioner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBook: (date: string, time: string, mode: 'online' | 'in-person') => Promise<void>;
  isBooking: boolean;
}

export default function BookAppointmentModal({ 
  practitioner, 
  open, 
  onOpenChange,
  onBook,
  isBooking
}: BookAppointmentModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [bookingMode, setBookingMode] = useState<'online' | 'in-person'>('online');

  useEffect(() => {
    // Reset state when modal is closed or practitioner changes
    if (!open) {
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setBookingMode('online');
    }
  }, [open, practitioner]);

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    onBook(dateStr, selectedTime, bookingMode);
  };

  // Get available time slots for selected date
  const getAvailableSlots = () => {
    if (!selectedDate || !practitioner.availabilitySlots) return [];
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return practitioner.availabilitySlots
      .filter(slot => slot.date === dateStr && slot.available)
      .map(slot => slot.time);
  };

  // Check if a date has any available slots
  const hasAvailableSlots = (date: Date) => {
    if (!practitioner.availabilitySlots) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return practitioner.availabilitySlots.some(
      slot => slot.date === dateStr && slot.available
    );
  };

  // Check if practitioner has any available slots at all
  const hasAnyAvailableSlots = practitioner.availabilitySlots?.some(slot => slot.available) ?? false;

  const availableSlots = getAvailableSlots();
  const canBookInPerson = practitioner.location.includes('Clinic') || practitioner.location.includes('Hospital');

  if (!hasAnyAvailableSlots) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>No Available Slots</DialogTitle>
            <DialogDescription className="text-center flex flex-col items-center gap-4 pt-4">
              <CalendarOff className="h-12 w-12 text-muted-foreground" />
              <span>
                {practitioner.name} currently has no available appointment slots. 
                Please check back later or try another practitioner.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Schedule an appointment with {practitioner.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedTime(undefined); // Reset time when date changes
              }}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today || !hasAvailableSlots(date);
              }}
              className="rounded-md border"
            />
          </div>

          <div>
            <Label>Select Time</Label>
            <Select 
              value={selectedTime} 
              onValueChange={setSelectedTime}
              disabled={!selectedDate || availableSlots.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Consultation Mode</Label>
            <RadioGroup 
              value={bookingMode} 
              onValueChange={(value: 'online' | 'in-person') => setBookingMode(value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" disabled={isBooking} />
                <Label htmlFor="online">Online</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="in-person" 
                  id="in-person"
                  disabled={!canBookInPerson || isBooking}
                />
                <Label htmlFor="in-person">
                  In-Person {!canBookInPerson && "(Not available)"}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleBooking} 
            className="w-full"
            disabled={!selectedDate || !selectedTime || isBooking}
          >
            {isBooking ? 'Booking...' : 'Book Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
