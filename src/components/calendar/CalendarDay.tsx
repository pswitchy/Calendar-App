// src/components/calendar/CalendarDay.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { format, isSameDay, isToday, isWithinInterval } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { MoreHorizontal, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalendar } from './CalendarContext';
import { EventCard } from './EventCard';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CreateEventModal } from './CreateEventModal';
import { useRouter } from 'next/navigation';
import type { CalendarEvent } from '@/types/calendar';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth?: boolean;
  events?: CalendarEvent[];
  maxVisibleEvents?: number;
}

const CURRENT_DATETIME = '2025-01-27 11:57:51';
const CURRENT_USER = 'parthsharma-git';

export function CalendarDay({
  date,
  isCurrentMonth = true,
  events = [],
  maxVisibleEvents = 3
}: CalendarDayProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { selectedDate, setSelectedDate } = useCalendar();

  // Fetch events for this day
  const { data: dayEvents, isError } = useQuery({
    queryKey: ['events', format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await fetch(`/api/events?date=${format(date, 'yyyy-MM-dd')}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    },
    enabled: isCurrentMonth, // Only fetch if it's current month
  });

  const allEvents = useMemo(() => {
    return [...(events || []), ...(dayEvents || [])].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [events, dayEvents]);

  const visibleEvents = allEvents.slice(0, maxVisibleEvents);
  const remainingEvents = allEvents.length - maxVisibleEvents;

  const handleDayClick = useCallback(() => {
    setSelectedDate(date);
  }, [date, setSelectedDate]);

  const handleCreateEvent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCreateModal(true);
  }, []);

  const handleEventClick = useCallback((e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    router.push(`/calendar/events/${eventId}`);
  }, [router]);

  const isEventOngoing = useCallback((event: CalendarEvent) => {
    const now = new Date(CURRENT_DATETIME);
    return isWithinInterval(now, {
      start: new Date(event.startTime),
      end: new Date(event.endTime),
    });
  }, []);

  if (isError) {
    return (
      <div className="min-h-[120px] p-2 border border-red-200 bg-red-50">
        <span className="text-sm text-red-600">Failed to load events</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-[120px] p-2 border border-gray-200',
        'transition-colors duration-200',
        {
          'bg-white': isCurrentMonth,
          'bg-gray-50': !isCurrentMonth,
          'cursor-pointer hover:bg-gray-50': isCurrentMonth,
          'border-primary': isSameDay(date, selectedDate),
          'bg-blue-50': isToday(date),
        }
      )}
      onClick={handleDayClick}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            'text-sm font-medium',
            {
              'text-gray-900': isCurrentMonth,
              'text-gray-400': !isCurrentMonth,
              'text-primary': isToday(date),
            }
          )}
        >
          {format(date, 'd')}
        </span>
        {isCurrentMonth && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleCreateEvent}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-1">
        {visibleEvents.map((event) => (
          <EventCard
            key={event.id}
            event={{
              ...event,
              isOngoing: isEventOngoing(event),
              createdBy: event.createdBy || CURRENT_USER,
              updatedAt: new Date(event.updatedAt || CURRENT_DATETIME),
            }}
            onClick={(e) => handleEventClick(e, event.id)}
          />
        ))}

        {remainingEvents > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-500 hover:text-gray-900"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4 mr-1" />
                {remainingEvents} more
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="space-y-1">
                {allEvents.slice(maxVisibleEvents).map((event) => (
                  <EventCard
                    key={event.id}
                    event={{
                      ...event,
                      isOngoing: isEventOngoing(event),
                      createdBy: event.createdBy || CURRENT_USER,
                      updatedAt: new Date(event.updatedAt || CURRENT_DATETIME),
                    }}
                    onClick={(e) => handleEventClick(e, event.id)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {showCreateModal && (
        <CreateEventModal
          initialDate={date}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // Refetch events after creation
            router.refresh();
          }}
        />
      )}
    </div>
  );
}