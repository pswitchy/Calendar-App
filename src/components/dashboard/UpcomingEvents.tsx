'use client';

import { useQuery } from '@tanstack/react-query';
import { format, isSameDay } from 'date-fns';
import { EventCard } from '../calendar/EventCard';
import { Event } from '../calendar/EventList';

interface GroupedEvents {
  [key: string]: Event[];
}

export const UpcomingEvents = () => {
  const currentDateTime = new Date('2025-01-21T11:05:06Z');

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['upcoming-events'],
    queryFn: () => fetch('/api/events/upcoming').then(res => res.json()),
  });

  if (isLoading) {
    return <div>Loading upcoming events...</div>;
  }

  const groupedEvents = events?.reduce((acc: GroupedEvents, event: Event) => {
    const date = format(new Date(event.startTime), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Upcoming Events</h2>
      {Object.entries(groupedEvents || {}).map(([date, events]) => (
        <div key={date} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">
            {isSameDay(new Date(date), currentDateTime)
              ? 'Today'
              : format(new Date(date), 'EEEE, MMMM d')}
          </h3>
          <div className="space-y-2">
            {(events as Event[]).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};