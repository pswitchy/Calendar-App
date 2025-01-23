// src/app/api/events/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleCalendarService } from '@/lib/google-calendar';
import prisma from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const eventSchema = z.object({
  summary: z.string().min(1).max(255),
  description: z.string().optional(),
  start: z.object({
    dateTime: z.string().datetime(),
    timeZone: z.string().optional(),
  }),
  end: z.object({
    dateTime: z.string().datetime(),
    timeZone: z.string().optional(),
  }),
  location: z.string().optional(),
  category: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date().toISOString();
    const endDate = searchParams.get('endDate') || 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        startTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'LIST_EVENTS',
        details: `Listed events from ${startDate} to ${endDate}`,
        createdAt: new Date('2025-01-23 07:30:16'),
        createdBy: 'parthsharma-git',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const body = await request.json();
    const validatedData = eventSchema.parse(body);

    let googleCalendarEventId = null;

    // Create in Google Calendar if connected
    if (session.user.accessToken) {
      const calendarService = new GoogleCalendarService(session.user.accessToken);
      const googleEvent = await calendarService.createEvent(validatedData);
      googleCalendarEventId = googleEvent.id;
    }

    // Save to local database
    const event = await prisma.event.create({
      data: {
        title: validatedData.summary,
        description: validatedData.description,
        startTime: new Date(validatedData.start.dateTime),
        endTime: new Date(validatedData.end.dateTime),
        location: validatedData.location,
        category: validatedData.category,
        googleCalendarEventId,
        userId: session.user.id,
        createdAt: new Date('2025-01-23 07:30:16'),
        createdBy: 'parthsharma-git',
      },
    });

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'CREATE_EVENT',
        details: `Created event: ${event.title}`,
        createdAt: new Date('2025-01-23 07:30:16'),
        createdBy: 'parthsharma-git',
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}