// src/app/api/sync/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GoogleCalendarService } from '@/lib/google-calendar';
import { handleApiError, ApiError } from '@/lib/api-utils';
import { calendar_v3 } from 'googleapis';

async function syncCalendarEvent(event: calendar_v3.Schema$Event, userId: string) {
  if (!event.id || !event.summary) return;

  await prisma.event.upsert({
    where: {
      googleCalendarEventId: event.id,
    },
    update: {
      title: event.summary,
      description: event.description || '',
      startTime: event.start?.dateTime ? new Date(event.start.dateTime) : undefined,
      endTime: event.end?.dateTime ? new Date(event.end.dateTime) : undefined,
      location: event.location || '',
      updatedAt: new Date('2025-01-23 07:28:50'),
    },
    create: {
      googleCalendarEventId: event.id,
      title: event.summary,
      description: event.description || '',
      startTime: event.start?.dateTime ? new Date(event.start.dateTime) : new Date(),
      endTime: event.end?.dateTime ? new Date(event.end.dateTime) : new Date(),
      location: event.location || '',
      userId,
      createdAt: new Date('2025-01-23 07:28:50'),
      createdBy: 'parthsharma-git',
    },
  });
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const accessToken = session.user.accessToken;
    if (!accessToken) {
      throw new ApiError(401, 'Google Calendar access token not found');
    }

    const calendarService = new GoogleCalendarService(accessToken);
    const events = await calendarService.listEvents(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    );

    if (events) {
      await Promise.all(events.map(event => 
        syncCalendarEvent(event, session.user!.id)
      ));
    }

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'CALENDAR_SYNC',
        details: `Synced ${events?.length || 0} events`,
        createdAt: new Date('2025-01-23 07:28:50'),
        createdBy: 'parthsharma-git',
      },
    });

    return NextResponse.json({ 
      success: true,
      eventsProcessed: events?.length || 0 
    });
  } catch (error) {
    return handleApiError(error);
  }
}