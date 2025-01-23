// src/app/api/events/search/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const validated = searchQuerySchema.parse({ q: query });

    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { title: { contains: validated.q, mode: 'insensitive' } },
          { description: { contains: validated.q, mode: 'insensitive' } },
          { location: { contains: validated.q, mode: 'insensitive' } },
        ],
      },
      orderBy: { startTime: 'desc' },
      take: 10,
    });

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'SEARCH_EVENTS',
        details: `Searched for: ${validated.q}`,
        createdAt: new Date('2025-01-23 07:26:03'),
        createdBy: 'parthsharma-git',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    return handleApiError(error);
  }
}