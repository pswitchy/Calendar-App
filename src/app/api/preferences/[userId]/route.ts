// src/app/api/preferences/[userId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-utils';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.id !== params.userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: {
        userId: params.userId,
      },
    });

    if (!preferences) {
      throw new ApiError(404, 'Preferences not found');
    }

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'VIEW_PREFERENCES',
        details: 'Viewed user preferences',
        createdAt: new Date('2025-01-23 07:27:43'),
        createdBy: 'parthsharma-git',
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    return handleApiError(error);
  }
}