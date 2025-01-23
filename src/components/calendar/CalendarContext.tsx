// src/components/calendar/CalendarContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { CalendarEvent, ViewMode, DateRange } from '@/types/calendar';

const CURRENT_TIMESTAMP = new Date('2025-01-23 14:55:07');
const CURRENT_USER = 'parthsharma-git';

interface CalendarContextType {
  currentDate: Date;
  selectedDate: Date;
  viewMode: ViewMode;
  dateRange: DateRange;
  events: CalendarEvent[];
  isLoading: boolean;
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: ViewMode) => void;
  navigateToToday: () => void;
  navigateToNext: () => void;
  navigateToPrevious: () => void;
  refreshEvents: () => void;
  createEvent: (eventData: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  updateEvent: (eventId: string, eventData: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  deleteEvent: (eventId: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  
  // Initialize state with current timestamp
  const [currentDate, setCurrentDate] = useState<Date>(CURRENT_TIMESTAMP);
  const [selectedDate, setSelectedDate] = useState<Date>(CURRENT_TIMESTAMP);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const calculateDateRange = useCallback((): DateRange => {
    switch (viewMode) {
      case 'month':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        };
      case 'week':
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate),
        };
      case 'day':
        return {
          start: currentDate,
          end: currentDate,
        };
      default:
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        };
    }
  }, [currentDate, viewMode]);

  const dateRange = calculateDateRange();

  // Fetch events with proper error handling
  const { data: events = [], isLoading, refetch: refreshEvents } = useQuery({
    queryKey: ['events', dateRange.start, dateRange.end],
    queryFn: async () => {
      try {
        const response = await fetch(
          `/api/events?startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        return response.json();
      } catch (error) {
        console.error('Error fetching events:', error);
        return [];
      }
    },
    enabled: status === 'authenticated',
  });

  // Navigation functions
  const navigateToToday = useCallback(() => {
    setCurrentDate(CURRENT_TIMESTAMP);
    setSelectedDate(CURRENT_TIMESTAMP);
  }, []);

  const navigateToNext = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, 1));
  }, []);

  const navigateToPrevious = useCallback(() => {
    setCurrentDate(prev => subMonths(prev, 1));
  }, []);

  // Event management functions
  const createEvent = async (eventData: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          createdBy: CURRENT_USER,
          createdAt: CURRENT_TIMESTAMP,
        }),
      });

      if (!response.ok) throw new Error('Failed to create event');

      const newEvent = await response.json();
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          updatedBy: 'parthsharma-git',
          updatedAt: new Date('2025-01-23 14:41:50'),
        }),
      });

      if (!response.ok) throw new Error('Failed to update event');

      const updatedEvent = await response.json();
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const deleteEvent = async (eventId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete event');

      await queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  const value: CalendarContextType = {
    currentDate,
    selectedDate,
    viewMode,
    dateRange,
    events,
    isLoading,
    setCurrentDate,
    setSelectedDate,
    setViewMode,
    navigateToToday: useCallback(() => setCurrentDate(CURRENT_TIMESTAMP), []),
    navigateToNext: useCallback(() => setCurrentDate(prev => addMonths(prev, 1)), []),
    navigateToPrevious: useCallback(() => setCurrentDate(prev => subMonths(prev, 1)), []),
    refreshEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}
  

