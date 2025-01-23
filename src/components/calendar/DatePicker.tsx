// src/components/calendar/DatePicker.tsx

'use client';

import * as React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
         isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  disabled?: boolean;
}

export function DatePicker({ value, onChange, label = 'Pick a date', disabled }: DatePickerProps) {
  const currentDateTime = new Date('2025-01-21T14:42:52Z');
  const [selectedDate, setSelectedDate] = React.useState<Date>(value || currentDateTime);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(value || currentDateTime);
  const [isOpen, setIsOpen] = React.useState(false);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDaySelect = (day: Date) => {
    setSelectedDate(day);
    onChange(day);
    setIsOpen(false);
  };

  const isSelectedMonth = (date: Date) => isSameMonth(date, currentMonth);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal w-[240px]',
            !value && 'text-gray-500'
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            {days.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isDayToday = isToday(day);

              return (
                <Button
                  key={day.toISOString()}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 w-8 p-0 font-normal',
                    isSelectedMonth(day) ? 'text-gray-900' : 'text-gray-400',
                    isSelected && 'bg-primary text-white hover:bg-primary hover:text-white',
                    isDayToday && !isSelected && 'border border-primary text-primary',
                    !isSelectedMonth(day) && 'hover:bg-transparent hover:text-gray-400'
                  )}
                  onClick={() => handleDaySelect(day)}
                  disabled={!isSelectedMonth(day)}
                >
                  {format(day, 'd')}
                </Button>
              );
            })}
          </div>
          {value && (
            <div className="mt-4 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  handleDaySelect(currentDateTime);
                }}
              >
                Today ({format(currentDateTime, 'PP')})
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}