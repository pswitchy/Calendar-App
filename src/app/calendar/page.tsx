'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { EventList } from '@/components/calendar/EventList';
import { CreateEventModal } from '@/components/calendar/CreateEventModal';
import { Calendar } from '@/components/calendar/Calendar';
import { Toggle } from '@/components/ui/toggle';
import { useCalendar } from '@/components/calendar/CalendarContext';

export default function CalendarPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { currentDate } = useCalendar();
  
  if (!session) {
    return <div>Please sign in to view your calendar.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="flex gap-4">
          <Toggle
            pressed={view === 'calendar'}
            onPressedChange={() => setView(view === 'calendar' ? 'list' : 'calendar')}
          >
            {view === 'calendar' ? 'Switch to List' : 'Switch to Calendar'}
          </Toggle>
          <CreateEventModal
            initialDate={currentDate}
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        </div>
      </div>

      {view === 'calendar' ? <Calendar /> : <EventList />}
    </div>
  );
}