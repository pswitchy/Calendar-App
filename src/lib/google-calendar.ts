import { google } from 'googleapis';

export class GoogleCalendarService {
  deleteEvent(googleCalendarEventId: any) {
      throw new Error('Method not implemented.');
  }
  updateEvent(googleCalendarEventId: any, data: any) {
      throw new Error('Method not implemented.');
  }
  private oauth2Client;

  constructor(accessToken: string) {
    this.oauth2Client = new google.auth.OAuth2();
    this.oauth2Client.setCredentials({ access_token: accessToken });
  }

  async listEvents(timeMin: Date, timeMax: Date) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    
    try {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      return response.data.items;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  async createEvent(eventData: {
    summary: string;
    description?: string;
    start: { dateTime: string, timeZone: string };
    end: { dateTime: string, timeZone: string };
    location?: string;
  }) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    
    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventData,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }
}