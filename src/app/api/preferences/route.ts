// src/app/api/preferences/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.boolean().optional(),
  weekStartsOn: z.number().min(0).max(6).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const data = await request.json();
    const validatedData = preferencesSchema.parse(data);

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        ...validatedData,
        updatedAt: new Date('2025-01-23 07:28:50'),
      },
      create: {
        userId: session.user.id,
        ...validatedData,
        createdAt: new Date('2025-01-23 07:28:50'),
        createdBy: 'parthsharma-git',
      },
    });

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'UPDATE_PREFERENCES',
        details: 'Updated user preferences',
        createdAt: new Date('2025-01-23 07:28:50'),
        createdBy: 'parthsharma-git',
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    return handleApiError(error);
  }
}