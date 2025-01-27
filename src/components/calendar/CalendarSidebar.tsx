// src/components/calendar/CalendarSidebar.tsx

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { 
  Calendar,
  ChevronDown,
  Filter,
  Plus,
  Tag,
  Settings,
  CheckSquare,
  Square,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

interface CalendarSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface CalendarItem {
  id: string;
  name: string;
  color: string;
  isChecked: boolean;
}

export function CalendarSidebar({
  // isOpen,
  // onClose,
  className,
}: CalendarSidebarProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [calendars, setCalendars] = useState<CalendarItem[]>([
    { id: '1', name: 'Personal', color: '#2196f3', isChecked: true },
    { id: '2', name: 'Work', color: '#4caf50', isChecked: true },
    { id: '3', name: 'Family', color: '#ff9800', isChecked: true },
    { id: '4', name: 'Holidays', color: '#f44336', isChecked: true },
  ]);
  const currentDateTime = new Date('2025-01-22T09:57:12Z');
  const userId = 'parthsharma-git';

  const toggleCalendar = (id: string) => {
    setCalendars(calendars.map(cal => 
      cal.id === id ? { ...cal, isChecked: !cal.isChecked } : cal
    ));
  };

  const filteredCalendars = calendars.filter(cal =>
    cal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-gray-200',
        'dark:border-gray-800',
        className
      )}
    >
      <div className="p-4 space-y-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => {/* Handle new event */}}
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search calendars"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                My Calendars
              </span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {filteredCalendars.map((cal) => (
                <div
                  key={cal.id}
                  className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <button
                    onClick={() => toggleCalendar(cal.id)}
                    className="flex items-center gap-2 flex-1"
                  >
                    {cal.isChecked ? (
                      <CheckSquare
                        className="h-4 w-4"
                        style={{ color: cal.color }}
                      />
                    ) : (
                      <Square
                        className="h-4 w-4"
                        style={{ color: cal.color }}
                      />
                    )}
                    <span className="text-sm">{cal.name}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => {/* Handle calendar settings */}}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {/* Add filter options here */}
              <div className="flex items-center gap-2 py-1 px-2">
                <Tag className="h-4 w-4" />
                <span className="text-sm">Important</span>
              </div>
              <div className="flex items-center gap-2 py-1 px-2">
                <Tag className="h-4 w-4" />
                <span className="text-sm">Work</span>
              </div>
              <div className="flex items-center gap-2 py-1 px-2">
                <Tag className="h-4 w-4" />
                <span className="text-sm">Personal</span>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="pt-4">
            <div className="rounded-md bg-gray-100 p-4 dark:bg-gray-800">
              <h3 className="text-sm font-medium mb-2">Upcoming Events</h3>
              <div className="space-y-2">
                {/* Add upcoming events here */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium">Team Meeting</p>
                  <p className="text-xs">
                    {format(currentDateTime, 'MMM dd, HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {session?.user?.name || userId}
            </p>
            <p className="text-xs text-gray-500">
              {session?.user?.email || 'user@example.com'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {/* Handle settings */}}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}