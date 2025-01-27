// src/app/api/events/[id]/attendees/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Resend } from 'resend';
import { ApiError, handleApiError } from '@/lib/api-utils';

const CURRENT_DATETIME = '2025-01-27 20:47:49';
const CURRENT_USER = 'parthsharma-git';

// Initialize Resend for email
const resend = new Resend(process.env.RESEND_API_KEY);

// Validation schemas
const paramsSchema = z.object({
  id: z.string().min(1, 'Event ID is required'),
});

const attendeeSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['OWNER', 'ATTENDEE', 'GUEST']).default('ATTENDEE'),
  status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'TENTATIVE']).default('PENDING'),
});

interface EventWithUser {
  id: string;
  title: string;
  startTime: Date;
  location?: string | null;
  description?: string | null;
  user: {
    name: string;
    email: string;
  };
}

type RouteContext = {
  params: Record<string, string | string[]>;
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function GET(request: Request, context: RouteContext) {
  try {
    // Validate params
    const { id } = paramsSchema.parse({ id: context.params.id });

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Check if user has access to the event
    const event = await prisma.event.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          {
            attendees: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
    });

    if (!event) {
      throw new ApiError(404, 'Event not found or access denied');
    }

    const attendees = await prisma.eventAttendee.findMany({
      where: {
        eventId: id,
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'VIEW_ATTENDEES',
        details: `Viewed attendees for event ${id}`,
        createdAt: new Date(CURRENT_DATETIME),
        createdBy: CURRENT_USER,
      },
    });

    return NextResponse.json(attendees);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = paramsSchema.parse({ id: context.params.id });

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const body = await request.json();
    const { email, role, status } = attendeeSchema.parse(body);

    // Check if user has permission to add attendees
    const event = await prisma.event.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          {
            attendees: {
              some: {
                userId: session.user.id,
                role: 'OWNER',
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!event) {
      throw new ApiError(404, 'Event not found or access denied');
    }

    // Check if attendee already exists
    const existingAttendee = await prisma.eventAttendee.findFirst({
      where: {
        eventId: id,
        email: email,
      },
    });

    if (existingAttendee) {
      throw new ApiError(400, 'Attendee already exists for this event');
    }

    // Create new attendee
    const attendee = await prisma.eventAttendee.create({
      data: {
        eventId: id,
        email,
        role,
        status,
        userId: session.user.id,
        createdAt: new Date(CURRENT_DATETIME),
        createdBy: CURRENT_USER,
      },
    });

    // Ensure user name and email are not null
    if (!event.user.name || !event.user.email) {
      throw new ApiError(400, 'Event organizer name or email is missing');
    }

    // Send invitation email
    await sendEventInvitation(event as EventWithUser, email);

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'ADD_ATTENDEE',
        details: `Added attendee ${email} to event ${id}`,
        createdAt: new Date(CURRENT_DATETIME),
        createdBy: CURRENT_USER,
      },
    });

    return NextResponse.json(attendee, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = paramsSchema.parse({ id: context.params.id });

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const url = new URL(request.url);
    const attendeeEmail = url.searchParams.get('email');

    if (!attendeeEmail) {
      throw new ApiError(400, 'Attendee email is required');
    }

    // Check if user has permission to remove attendees
    const event = await prisma.event.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          {
            attendees: {
              some: {
                userId: session.user.id,
                role: 'OWNER',
              },
            },
          },
        ],
      },
    });

    if (!event) {
      throw new ApiError(404, 'Event not found or access denied');
    }

    // Remove attendee
    await prisma.eventAttendee.deleteMany({
      where: {
        eventId: id,
        email: attendeeEmail,
      },
    });

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'REMOVE_ATTENDEE',
        details: `Removed attendee ${attendeeEmail} from event ${id}`,
        createdAt: new Date(CURRENT_DATETIME),
        createdBy: CURRENT_USER,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}

async function sendEventInvitation(event: EventWithUser, recipientEmail: string) {
  try {
    const response = await resend.emails.send({
      from: 'Calendar App <noreply@yourdomain.com>',
      to: recipientEmail,
      subject: `Invitation: ${event.title}`,
      html: `
        <h2>You've been invited to an event</h2>
        <p><strong>Event:</strong> ${event.title}</p>
        <p><strong>Organizer:</strong> ${event.user.name} (${event.user.email})</p>
        <p><strong>Date:</strong> ${new Date(event.startTime).toLocaleString()}</p>
        ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
        ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
        <p>
          <a href="${process.env.NEXTAUTH_URL}/calendar/events/${event.id}/respond?email=${recipientEmail}">
            Respond to Invitation
          </a>
        </p>
      `,
    });

    return response;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    // Don't throw error to prevent blocking the attendee creation
  }
}