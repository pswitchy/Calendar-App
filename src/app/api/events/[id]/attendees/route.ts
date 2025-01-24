// src/app/api/events/[id]/attendees/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const attendees = await prisma.eventAttendee.findMany({
      where: {
        eventId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(attendees);
  } catch (error) {
    return new NextResponse('Error fetching attendees', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { email, role = 'ATTENDEE' } = await request.json();

    const attendee = await prisma.eventAttendee.create({
      data: {
        eventId: params.id,
        email,
        role,
        userId: session.user.id, // Assuming session.user.id contains the userId
      },
    });

    // Send invitation email
    await sendEventInvitation(params.id, email);

    return NextResponse.json(attendee);
  } catch (error) {
    return new NextResponse('Error adding attendee', { status: 500 });
  }
}

async function sendEventInvitation(eventId: string, email: string) {
  // Implementation for sending invitation emails
  // This would typically integrate with an email service
}