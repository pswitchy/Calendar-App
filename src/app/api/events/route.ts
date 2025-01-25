import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleCalendarService } from '@/lib/google-calendar';
import prisma from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

// Update the schema to match the frontend data structure
const eventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().optional(),
  isAllDay: z.boolean().optional().default(false),
  color: z.string().optional(),
  // createdBy: z.string(),
  // createdAt: z.date().or(z.string()),
  // updatedAt: z.date().or(z.string()),
});

export async function GET(
  req: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = eventSchema.parse({
      ...body,
      createdAt: new Date(body.createdAt),
      updatedAt: new Date(body.updatedAt),
    });

    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        location: validatedData.location,
        isAllDay: validatedData.isAllDay || false,
        color: validatedData.color,
        userId: session.user.id,
        createdBy: 'parthsharma-git',
        createdAt: new Date('2025-01-25 15:06:52'),
        updatedAt: new Date('2025-01-25 15:06:52'),
      },
    });

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'CREATE_EVENT',
        details: `Created event: ${event.title}`,
        createdAt: new Date('2025-01-25 15:06:52'),
        createdBy: 'parthsharma-git',
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Event creation error:', error);
    return handleApiError(error);
  }
}