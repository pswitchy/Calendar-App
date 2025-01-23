// src/components/calendar/EventList.tsx
'use client';

import { useState } from 'react';
import { DatePicker } from './DatePicker'; 
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { EventCard } from './EventCard';
import { EventAttendee } from '@/types/calendar';

export interface Event {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color?: string;
  stopPropagation: () => void;
  category?: string;
  googleCalendarEventId?: string;
  createdBy?: string;
  updatedBy?: string;
  location?: string;
  description?: string;
  organizer?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  attendees?: EventAttendee[];
}

export const EventList = () => {
  const [filter, setFilter] = useState<{ startDate?: Date; endDate?: Date }>({ startDate: undefined, endDate: undefined });
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['events', filter],
    queryFn: () => fetchEvents(filter)
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <DatePicker
          value={filter.startDate}
          onChange={(date: any) => setFilter(prev => ({ ...prev, startDate: date }))}
          label="Start Date"
        />
        <DatePicker
          value={filter.endDate}
          onChange={(date: any) => setFilter(prev => ({ ...prev, endDate: date }))}
          label="End Date"
        />
      </div>
      
      <div className="grid gap-4">
        {events?.map((event: Event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

function fetchEvents(filter: { startDate?: Date; endDate?: Date }): Promise<Event[]> {
    throw new Error('Function not implemented.');
}
