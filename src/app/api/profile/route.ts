// src/app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  image: z.string().url().optional(),
  bio: z.string().max(500).optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        preferences: true,
        password: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
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
    const validatedData = profileUpdateSchema.parse(data);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...validatedData,
        updatedAt: new Date('2025-01-23 07:28:50'),
      },
      include: {
        password: true,
      },
    });

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'UPDATE_PROFILE',
        details: 'Updated user profile',
        createdAt: new Date('2025-01-23 07:28:50'),
        createdBy: 'parthsharma-git',
      },
    });

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return handleApiError(error);
  }
}