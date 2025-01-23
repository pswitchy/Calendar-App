//src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError, ApiError, CONSTANTS } from '@/lib/api-utils';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const categories = await prisma.event.groupBy({
      by: ['category'],
      where: {
        userId: session.user.id,
        category: { not: null },
        createdAt: {
          lte: CONSTANTS.CURRENT_TIMESTAMP,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
    });

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'VIEW_CATEGORIES',
        details: 'User viewed categories',
        createdAt: CONSTANTS.CURRENT_TIMESTAMP,
        createdBy: CONSTANTS.CURRENT_USER,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error);
  }
}