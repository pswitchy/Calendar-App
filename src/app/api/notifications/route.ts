// src/app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import webPush from 'web-push';
import { handleApiError, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const notificationSchema = z.object({
  eventId: z.string(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const data = await request.json();
    const validated = notificationSchema.parse(data);

    const event = await prisma.event.findUnique({
      where: { id: validated.eventId },
    });

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { preferences: true },
    });

    if (user?.preferences?.notifications && user.pushSubscription) {
      const subscription = JSON.parse(user.pushSubscription);
      await webPush.sendNotification(
        subscription,
        JSON.stringify({
          title: 'Upcoming Event',
          body: `${event.title} starts in 15 minutes`,
          url: `/calendar/events/${event.id}`,
          timestamp: new Date('2025-01-23 07:27:43').toISOString(),
        })
      );

      await prisma.userActivity.create({
        data: {
          userId: session.user.id,
          type: 'NOTIFICATION_SENT',
          details: `Notification sent for event: ${event.title}`,
          createdAt: new Date('2025-01-23 07:27:43'),
          createdBy: 'parthsharma-git',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}