// src/app/api/events/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-utils';
import { GoogleCalendarService } from '@/lib/google-calendar';
import { z } from 'zod';

// Validation schemas
const eventIdSchema = z.string().min(1, 'Event ID is required');
const updateEventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
});

// Helper function to extract event ID from URL
function extractEventId(url: string): string {
  const match = new URL(url).pathname.match(/^\/api\/events\/([^/]+)/);
  if (!match) throw new ApiError(400, 'Invalid URL structure');
  return match[1];
}

export async function GET(request: Request) {
  try {
    const id = extractEventId(request.url);
    const eventId = eventIdSchema.parse(id);
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: session.user.id,
      },
    });

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'VIEW_EVENT',
        details: `Viewed event: ${event.title}`,
        createdAt: new Date('2025-01-23 07:26:03'),
        createdBy: 'parthsharma-git',
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const id = extractEventId(request.url);
    const eventId = eventIdSchema.parse(id);
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const data = await request.json();
    const validatedData = updateEventSchema.parse(data);

    const event = await prisma.event.update({
      where: {
        id: eventId,
        userId: session.user.id,
      },
      data: {
        ...validatedData,
        updatedAt: new Date('2025-01-23 07:26:03'),
      },
    });

    if (event.googleCalendarEventId) {
      const accessToken = session.user.accessToken;
      if (!accessToken) {
        throw new ApiError(401, 'Google Calendar access token not found');
      }
      
      const calendarService = new GoogleCalendarService(accessToken);
      await calendarService.updateEvent(event.googleCalendarEventId, validatedData);
    }

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'UPDATE_EVENT',
        details: `Updated event: ${event.title}`,
        createdAt: new Date('2025-01-23 07:26:03'),
        createdBy: 'parthsharma-git',
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = extractEventId(request.url);
    const eventId = eventIdSchema.parse(id);
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const event = await prisma.event.delete({
      where: {
        id: eventId,
        userId: session.user.id,
      },
    });

    if (event.googleCalendarEventId) {
      const accessToken = session.user.accessToken;
      if (!accessToken) {
        throw new ApiError(401, 'Google Calendar access token not found');
      }
      
      const calendarService = new GoogleCalendarService(accessToken);
      await calendarService.deleteEvent(event.googleCalendarEventId);
    }

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'DELETE_EVENT',
        details: `Deleted event: ${event.title}`,
        createdAt: new Date('2025-01-23 07:26:03'),
        createdBy: 'parthsharma-git',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}