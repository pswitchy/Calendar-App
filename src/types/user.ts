// src/types/user.ts

export interface CalendarIntegrationConfig {
  provider: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  syncEnabled?: boolean;
  lastSynced?: Date;
  config?: {
    [key: string]: string | number | boolean | Date | undefined;
  };
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  title?: string;
  bio?: string;
  phoneNumber?: string;
  location?: string;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  language: string;
  timeZone: string;
  timeZonePreference: 'LOCAL' | 'UTC' | 'CUSTOM';
  defaultView: 'MONTH' | 'WEEK' | 'DAY' | 'AGENDA';
  workingHours?: {
    [key: string]: {
      start: string;
      end: string;
      isWorkDay: boolean;
    };
  };
  weekStartsOn: number;
  defaultEventDuration: number;
  showWeekends: boolean;
  showDeclinedEvents: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderDefault?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  calendarIntegrations?: Record<string, CalendarIntegrationConfig>;
  loginCount: number;
  eventsCreated: number;
  totalEventHours: number;
}