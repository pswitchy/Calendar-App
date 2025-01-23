// src/app/api/notifications/subscribe/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const subscription = await request.json();
    const validatedSub = subscriptionSchema.parse(subscription);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pushSubscription: JSON.stringify(validatedSub),
        updatedAt: new Date('2025-01-23 07:27:43'),
      },
    });

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'PUSH_SUBSCRIPTION',
        details: 'Subscribed to push notifications',
        createdAt: new Date('2025-01-23 07:27:43'),
        createdBy: 'parthsharma-git',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}