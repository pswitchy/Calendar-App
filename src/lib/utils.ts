import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';
import { TIME_ZONES, EVENT_COLORS } from './constants';
import { CalendarEvent } from '@/types/calendar';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: Date | string, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsedDate) ? format(parsedDate, formatStr) : '';
}

export function validateTimeZone(timeZone: string): boolean {
  return TIME_ZONES.includes(timeZone);
}

export function generateEventColor(): string {
  const colors = Object.values(EVENT_COLORS);
  return colors[Math.floor(Math.random() * colors.length)];
}

export function createGoogleCalendarEvent(event: CalendarEvent) {
  return {
    summary: event.title,
    description: event.description,
    start: {
      dateTime: new Date(event.startTime).toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: new Date(event.endTime).toISOString(),
      timeZone: 'UTC',
    },
    location: event.location,
    colorId: event.colorId,
  };
}

export function debounce<Args extends unknown[], Return>(
  func: (...args: Args) => Return,
  wait: number
): (...args: Args) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateRecurringDates(
  startDate: Date,
  frequency: 'daily' | 'weekly' | 'monthly',
  count: number
): Date[] {
  const dates: Date[] = [];
  const date = new Date(startDate);

  for (let i = 0; i < count; i++) {
    dates.push(new Date(date));
    
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
    }
  }

  return dates;
}

export function getTimeSlots(
  startTime: string = '09:00',
  endTime: string = '17:00',
  interval: number = 30
): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  for (let mins = start; mins <= end; mins += interval) {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    slots.push(
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    );
  }

  return slots;
}