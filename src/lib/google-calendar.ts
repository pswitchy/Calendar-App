// src/lib/google-calendar.ts
import { google, calendar_v3 } from 'googleapis';

interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: string;
  colorId?: string;
  attendees?: { email: string }[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
}

export class GoogleCalendarService {
  private oauth2Client;
  private calendar: calendar_v3.Calendar;
  private readonly createdAt: string = '2025-01-27 12:36:08';
  private readonly createdBy: string = 'parthsharma-git';

  constructor(accessToken: string) {
    this.oauth2Client = new google.auth.OAuth2();
    this.oauth2Client.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  async deleteEvent(googleCalendarEventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: googleCalendarEventId,
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete Google Calendar event');
    }
  }

  async updateEvent(
    googleCalendarEventId: string, 
    data: Partial<GoogleCalendarEvent>
  ): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId: googleCalendarEventId,
        requestBody: {
          ...data,
          updated: new Date(this.createdAt).toISOString(),
        },
      });

      if (!response.data) {
        throw new Error('No data returned from Google Calendar');
      }

      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update Google Calendar event');
    }
  }

  async listEvents(
    timeMin: Date, 
    timeMax: Date
  ): Promise<calendar_v3.Schema$Event[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      if (!response.data.items) {
        return [];
      }

      return response.data.items.map(event => ({
        ...event,
        created: event.created || this.createdAt,
        creator: {
          ...event.creator,
          email: event.creator?.email || this.createdBy,
        },
      }));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw new Error('Failed to fetch Google Calendar events');
    }
  }

  async createEvent(
    eventData: GoogleCalendarEvent
  ): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          ...eventData,
          reminders: {
            useDefault: true,
            ...(eventData.reminders || {}),
          },
          created: new Date(this.createdAt).toISOString(),
          creator: {
            email: this.createdBy,
          },
        },
      });
      
      if (!response.data) {
        throw new Error('No data returned from Google Calendar');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create Google Calendar event');
    }
  }

  // Helper method to format dates for Google Calendar
  // private formatDate(date: Date): { dateTime: string; timeZone: string } {
  //   return {
  //     dateTime: date.toISOString(),
  //     timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  //   };
  // }
}