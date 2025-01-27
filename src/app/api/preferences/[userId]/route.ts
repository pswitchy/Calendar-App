// src/app/api/preferences/[userId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

// Validation schema
const userIdSchema = z.string().min(1, 'User ID is required');

// Helper function to extract user ID from URL
function extractUserId(url: string): string {
  const match = new URL(url).pathname.match(/^\/api\/preferences\/([^/]+)/);
  if (!match) throw new ApiError(400, 'Invalid URL structure');
  return match[1];
}

export async function GET(request: Request) {
  try {
    const id = extractUserId(request.url);
    const userId = userIdSchema.parse(id);
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.id !== userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId }
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