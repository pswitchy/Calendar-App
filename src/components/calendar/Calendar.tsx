// src/components/calendar/Calendar.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { CalendarDay } from './CalendarDay';
import { useCalendar } from './CalendarContext';
import { CalendarHeader } from './CalendarHeader';
import { CalendarSidebar } from './CalendarSidebar';
import type { CalendarEvent } from '@/types/calendar';

export const Calendar = () => {
  const {
    currentDate,
    events,
    isLoading,
    navigateToNext,
    navigateToPrevious,
    navigateToToday,
  } = useCalendar();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const days = useMemo(() => 
    eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    }),
    [currentDate]
  );

  const eventsByDay = useMemo(() => {
    const eventMap = new Map<string, CalendarEvent[]>();
    
    events.forEach(event => {
      const dateKey = format(new Date(event.startTime), 'yyyy-MM-dd');
      if (!eventMap.has(dateKey)) {
        eventMap.set(dateKey, []);
      }
      eventMap.get(dateKey)?.push(event);
    });

    return eventMap;
  }, [events]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {isSidebarOpen && (
        <CalendarSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          className="w-64 flex-shrink-0"
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <CalendarHeader
          currentDate={currentDate}
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onPrevMonth={navigateToPrevious}
          onNextMonth={navigateToNext}
          onToday={navigateToToday}
        />
        
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium">
                {day}
              </div>
            ))}
            
            {days.map((day) => (
              <CalendarDay 
                key={day.toISOString()} 
                date={day}
                isCurrentMonth={isSameMonth(day, currentDate)}
                events={eventsByDay.get(format(day, 'yyyy-MM-dd')) || []}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};