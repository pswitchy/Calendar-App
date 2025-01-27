import { User } from "@prisma/client";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  colorId: string | number;
  location?: string;
  isAllDay: boolean;
  color?: string;
  googleCalendarEventId?: string;
  attendees?: EventAttendee[];
  userId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventAttendee {
    id: string;
    eventId: string;
    userId: string;
    email: string;
    status?: 'pending' | 'accepted' | 'declined' | 'tentative';
    role?: 'owner' | 'attendee';
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

  // src/types/calendar.ts
export interface GoogleCalendarEventResponse {
  id: string;
  status: string;
  htmlLink: string;
  created: string;
  updated: string;
  summary: string;
  description?: string;
  location?: string;
  creator: {
    email: string;
    displayName?: string;
  };
  organizer: {
    email: string;
    displayName?: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  colorId?: string;
  visibility?: 'default' | 'public' | 'private';
  guestsCanModify?: boolean;
  guestsCanInviteOthers?: boolean;
  guestsCanSeeOtherGuests?: boolean;
}