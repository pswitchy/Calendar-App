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
import type { Event } from './EventList'
import type { CalendarEvent } from '@/types/calendar';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth?: boolean;
  events?: CalendarEvent[];
  maxVisibleEvents?: number;
}

export function CalendarDay({
  date,
  isCurrentMonth = true,
  events = [],
  maxVisibleEvents = 3
}: CalendarDayProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const { selectedDate, setSelectedDate } = useCalendar();
  const currentDateTime = new Date('');
  const userId = 'parthsharma-git';

  // Fetch events for this day
  const { data: dayEvents } = useQuery({
    queryKey: ['events', format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await fetch(`/api/events?date=${format(date, 'yyyy-MM-dd')}`);
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

  const handleCreateEvent = useCallback(() => {
    setShowCreateModal(true);
  }, []);

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
            onClick={(e) => {
              e.stopPropagation();
              handleCreateEvent();
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-1">
        {visibleEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => {
              // Handle event click
            }}
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
                    event={event}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle event click
                    }}
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
        />
      )}
    </div>
  );
}

// Compact variant of EventCard specific to CalendarDay
interface CompactEventCardProps {
  event: Event;
  onClick?: (e: React.MouseEvent) => void;
}

function CompactEventCard({ event, onClick }: CompactEventCardProps) {
  const isOngoing = useMemo(() => {
    const now = new Date('2025-01-21T14:53:41Z');
    return isWithinInterval(now, {
      start: new Date(event.startTime),
      end: new Date(event.endTime),
    });
  }, [event]);

  return (
    <div
      onClick={onClick}
      className={cn(
        'px-2 py-1 rounded text-xs truncate',
        'hover:opacity-90 transition-opacity cursor-pointer',
        {
          'bg-primary text-white': isOngoing,
          'bg-gray-100': !isOngoing,
        }
      )}
      style={{
        borderLeft: `3px solid ${event.color || '#2196f3'}`,
      }}
    >
      <div className="flex items-center space-x-1">
        <span className="font-medium truncate">{event.title}</span>
        {event.location && (
          <span className="text-xs opacity-75 truncate">• {event.location}</span>
        )}
      </div>
    </div>
  );
}

