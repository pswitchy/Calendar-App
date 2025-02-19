// src/app/calendar/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { EventList } from '@/components/calendar/EventList';
import { CreateEventModal } from '@/components/calendar/CreateEventModal';
import { Calendar } from '@/components/calendar/Calendar';
import { Toggle } from '@/components/ui/toggle';
import { useCalendar } from '@/components/calendar/CalendarContext';
import { motion } from 'framer-motion';
import { Plus, List, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CalendarPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { currentDate } = useCalendar();
  
  if (!session) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-full items-center justify-center"
      >
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Please sign in</h2>
          <p className="text-muted-foreground">Sign in to view and manage your calendar</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold"
        >
          Calendar
        </motion.h1>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
              className="flex items-center gap-2"
            >
              <Grid size={16} />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="flex items-center gap-2"
            >
              <List size={16} />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
          
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Plus size={16} className="mr-2" />
            New Event
          </Button>
        </div>
      </div>

      <motion.div
        key={view}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="flex-1 overflow-hidden"
      >
        {view === 'calendar' ? <Calendar /> : <EventList />}
      </motion.div>

      <CreateEventModal
        initialDate={currentDate}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </motion.div>
  );
}