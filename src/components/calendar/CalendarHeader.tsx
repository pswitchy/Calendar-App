// src/components/calendar/CalendarHeader.tsx

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { CurrentDateTime } from './CurrentDateTime';

interface CalendarHeaderProps {
  currentDate: Date;
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  className?: string;
}

export const CalendarHeader = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onToday}>
          Today
        </Button>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>
      <div className="flex items-center space-x-2">
        <CurrentDateTime />
      </div>
    </div>
  );
};