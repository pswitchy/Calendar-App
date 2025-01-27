// src/components/calendar/EventList.tsx
'use client';

import { useState } from 'react';
import { DatePicker } from './DatePicker';
import { useQuery } from '@tanstack/react-query';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { EventCard } from './EventCard';
import { Button } from '@/components/ui/button';
import { Calendar, List, Grid, Filter, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { EventAttendee } from '@/types/calendar';

const CURRENT_DATETIME = '2025-01-27 12:15:17';
const CURRENT_USER = 'parthsharma-git';

export interface Event {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color?: string;
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

type ViewMode = 'list' | 'grid';
type FilterType = 'all' | 'upcoming' | 'past' | 'ongoing';

interface EventFilter {
  startDate?: Date;
  endDate?: Date;
}

export function EventList() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filter, setFilter] = useState<EventFilter>({
    startDate: new Date(CURRENT_DATETIME),
    endDate: undefined,
  });

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', filter.startDate, filter.endDate, filterType],
    queryFn: async () => {
      try {
        return await fetchEvents(filter);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch events',
          variant: 'error',
        });
        throw error;
      }
    },
  });

  const filteredEvents = events?.filter((event: Event) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    const now = new Date(CURRENT_DATETIME);

    switch (filterType) {
      case 'upcoming':
        return eventStart > now;
      case 'past':
        return eventEnd < now;
      case 'ongoing':
        return isWithinInterval(now, { start: eventStart, end: eventEnd });
      default:
        return true;
    }
  });

  const handleDateChange = (type: 'start' | 'end', date: Date | null) => {
    setFilter((prev) => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: date,
    }));
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h3 className="text-lg font-semibold text-red-600">Failed to load events</h3>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Events</h2>
        <div className="flex items-center gap-4">
          <Select
            value={filterType}
            onValueChange={(value: FilterType) => setFilterType(value)}
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={toggleViewMode}>
            {viewMode === 'list' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <DatePicker
          value={filter.startDate}
          onChange={(date) => handleDateChange('start', date)}
          label="Start Date"
        />
        <DatePicker
          value={filter.endDate}
          onChange={(date) => handleDateChange('end', date)}
          label="End Date"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredEvents?.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No events found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {filterType === 'all'
              ? 'Try adjusting your filters or create a new event'
              : `No ${filterType} events found`}
          </p>
        </div>
      ) : (
        <>
          {filterType !== 'all' && filter.startDate && (
            <Badge variant="outline" className="mb-4">
              Showing {filterType} events
              {filter.startDate && ` from ${format(filter.startDate, 'MMM d, yyyy')}`}
              {filter.endDate && ` to ${format(filter.endDate, 'MMM d, yyyy')}`}
            </Badge>
          )}
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-4'
            }
          >
            {filteredEvents?.map((event: Event) => (
              <EventCard
                key={event.id}
                event={{
                  ...event,
                  createdBy: event.createdBy || CURRENT_USER,
                  updatedAt: new Date(event.updatedAt || CURRENT_DATETIME),
                }}
                onClick={() => {
                  window.location.href = `/calendar/events/${event.id}`;
                }}
                viewMode={viewMode}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

async function fetchEvents(filter: EventFilter): Promise<Event[]> {
  const params = new URLSearchParams();
  
  if (filter.startDate) {
    params.append('startDate', format(startOfDay(filter.startDate), "yyyy-MM-dd'T'HH:mm:ss'Z'"));
  }
  
  if (filter.endDate) {
    params.append('endDate', format(endOfDay(filter.endDate), "yyyy-MM-dd'T'HH:mm:ss'Z'"));
  }

  const response = await fetch(`/api/events?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  const data: Event[] = await response.json();
  
  return data.map((event: Event) => ({
    ...event,
    startTime: new Date(event.startTime),
    endTime: new Date(event.endTime),
    createdAt: new Date(event.createdAt || CURRENT_DATETIME),
    updatedAt: new Date(event.updatedAt || CURRENT_DATETIME),
    createdBy: event.createdBy || CURRENT_USER,
  }));
}