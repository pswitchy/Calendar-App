// src/app/api/events/upcoming/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-utils';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const currentDateTime = new Date('2025-01-23 07:27:43');

    const upcomingEvents = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        startTime: {
          gte: currentDateTime,
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      take: 5,
    });

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'VIEW_UPCOMING_EVENTS',
        details: 'Viewed upcoming events',
        createdAt: currentDateTime,
        createdBy: 'parthsharma-git',
      },
    });

    return NextResponse.json(upcomingEvents);
  } catch (error) {
    return handleApiError(error);
  }
}