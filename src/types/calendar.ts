import { User } from "@prisma/client";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  isAllDay: boolean;
  color?: string;
  googleCalendarEventId?: string;
  userId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventAttendee {
    id: string;
    eventId: string;
    userId: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';
    role: 'ORGANIZER' | 'REQUIRED' | 'OPTIONAL';
    response?: string;
    notifyBefore?: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy?: string;
    event?: Event;
    user?: User;
}

export type ViewMode = 'month' | 'week' | 'day' | 'agenda';
  
  export interface DateRange {
    start: Date;
    end: Date;
  }
  
  export interface CalendarState {
    currentDate: Date;
    selectedDate: Date;
    viewMode: ViewMode;
    dateRange: DateRange;
  }
  
  export interface CalendarFilter {
    categories?: string[];
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }