// src/app/api/events/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleCalendarService } from '@/lib/google-calendar';
import prisma from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

// Zod validation schema matching frontend structure
const eventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().optional(),
  isAllDay: z.boolean().optional().default(false),
  color: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const { searchParams } = new URL(req.url);
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

    return NextResponse.json(events);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Validate request body
    const body = await req.json();
    const validatedData = eventSchema.parse(body);
    
    // Google Calendar integration
    let googleCalendarEventId = null;
    if (session.user.accessToken) {
      try {
        const calendarService = new GoogleCalendarService(session.user.accessToken);
        
        // Map to Google Calendar event format
        const googleEventData = {
          summary: validatedData.title,
          description: validatedData.description,
          start: {
            dateTime: validatedData.startTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: validatedData.endTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          location: validatedData.location,
          colorId: mapColorToGoogleId(validatedData.color || '#2196f3'),
        };

        const googleEvent = await calendarService.createEvent(googleEventData);
        googleCalendarEventId = googleEvent.id;
      } catch (googleError) {
        console.error('Google Calendar sync failed:', googleError);
        // Continue with local database save even if Google sync fails
      }
    }

    // Save to local database
    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        location: validatedData.location,
        isAllDay: validatedData.isAllDay,
        color: validatedData.color,
        googleCalendarEventId,
        userId: session.user.id,
        createdBy: session.user.name || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create activity log
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'CREATE_EVENT',
        details: `Created event: ${event.title}`,
        createdAt: new Date(),
        createdBy: session.user.name || 'system',
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('[EVENT_CREATION_ERROR]', error);
    return handleApiError(error);
  }
}

// Helper function to map hex colors to Google Calendar color IDs
function mapColorToGoogleId(hexColor: string): string {
  const colorMap: Record<string, string> = {
    '#2196f3': '1', // Blue
    '#4caf50': '2', // Green
    '#ff9800': '3', // Orange
    '#9c27b0': '4', // Purple
    '#f44336': '5', // Red
    '#795548': '6', // Brown
    '#607d8b': '7', // Gray
  };
  return colorMap[hexColor.toLowerCase()] || '1';
}