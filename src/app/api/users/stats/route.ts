// src/app/api/users/stats/route.ts
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

    const now = new Date('2025-01-23 07:30:16');
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const [
      totalEvents,
      upcomingEvents,
      completedEvents,
      recentActivities,
      categoryStats
    ] = await Promise.all([
      // Total events count
      prisma.event.count({
        where: { userId: session.user.id },
      }),
      // Upcoming events count
      prisma.event.count({
        where: {
          userId: session.user.id,
          startTime: { gte: now },
        },
      }),
      // Completed events in last 30 days
      prisma.event.count({
        where: {
          userId: session.user.id,
          endTime: {
            gte: thirtyDaysAgo,
            lte: now,
          },
        },
      }),
      // Recent activities count
      prisma.userActivity.count({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      // Category distribution
      prisma.event.groupBy({
        by: ['category'],
        where: {
          userId: session.user.id,
          category: { not: null },
        },
        _count: true,
      }),
    ]);

    // Log this stats view
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'VIEW_STATS',
        details: 'Viewed user statistics',
        createdAt: now,
        createdBy: 'parthsharma-git',
      },
    });

    return NextResponse.json({
      totalEvents,
      upcomingEvents,
      completedEvents,
      recentActivities,
      categoryDistribution: categoryStats,
      lastUpdated: now.toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}