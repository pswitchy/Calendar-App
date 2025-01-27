import { Event, UserPreferences, User, UserActivity } from '@prisma/client';

export interface ExtendedUser extends User {
  preferences?: UserPreferences | null;
  accessToken?: string;
  refreshToken?: string;
}

export interface ExtendedEvent extends Event {
  createdBy: string;
  updatedBy: string | null;
  category: string | null;
  googleCalendarEventId: string | null;
}

export interface UserActivityLog extends UserActivity {
  event?: Event;
  user?: User;
}

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface CalendarEventInput {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string;
  category?: string;
}

export interface UserStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  recentActivities: number;
  categoryDistribution: {
    category: string;
    _count: number;
  }[];
  lastUpdated: string;
}


  
export interface CalendarViewState {
    view: 'month' | 'week' | 'day' | 'list';
    date: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  color?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// interface DayEvent {
//   id: string;
//   title: string;
//   description?: string;
//   startTime: string;
//   endTime: string;
//   location?: string;
//   color?: string;
//   userId: string;
//   createdAt: string;
//   updatedAt: string;
// }

export type { Event };
