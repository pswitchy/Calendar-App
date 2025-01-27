// src/app/api/events/[id]/attendees/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Resend } from 'resend';
import { ApiError, handleApiError } from '@/lib/api-utils';

// Initialize Resend with non-null assertion
const resend = new Resend(process.env.RESEND_API_KEY!);

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

// Proper Next.js route handler types
type RouteParams = { params: { [key: string]: string } };

// Shared authorization check
async function verifyEventAccess(eventId: string, userId: string, requiredRole?: 'OWNER') {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      OR: [
        { userId },
        {
          attendees: {
            some: {
              userId,
              ...(requiredRole && { role: requiredRole })
            }
          }
        }
      ]
    },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  if (!event) throw new ApiError(404, 'Event not found or access denied');
  return event;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = paramsSchema.parse(params);
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    await verifyEventAccess(id, session.user.id);

    const attendees = await prisma.eventAttendee.findMany({
      where: { eventId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'VIEW_ATTENDEES',
        details: `Viewed attendees for event ${id}`,
        createdAt: new Date(),
        createdBy: session.user.email || 'system'
      }
    });

    return NextResponse.json(attendees);

  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = paramsSchema.parse(params);
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const body = await request.json();
    const { email } = attendeeSchema.parse(body);

    const event = await verifyEventAccess(id, session.user.id, 'OWNER');

    const existingAttendee = await prisma.eventAttendee.findUnique({
      where: { eventId_email: { eventId: id, email } }
    });

    if (existingAttendee) {
      throw new ApiError(409, 'Attendee already exists');
    }

    const [newAttendee] = await prisma.$transaction([
      prisma.eventAttendee.create({
        data: {
          eventId: id,
          email,
          userId: session.user.id,
          createdAt: new Date(),
          createdBy: session.user.email || 'system'
        }
      }),
      prisma.userActivity.create({
        data: {
          userId: session.user.id,
          type: 'ADD_ATTENDEE',
          details: `Added ${email} to event ${id}`,
          createdAt: new Date(),
          createdBy: session.user.email || 'system'
        }
      })
    ]);

    if (!event.user.name || !event.user.email) {
      throw new ApiError(400, 'Organizer information missing');
    }

    await sendEventInvitation(event, email);

    return NextResponse.json(newAttendee, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = paramsSchema.parse(params);
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      throw new ApiError(400, 'Email parameter required');
    }

    await verifyEventAccess(id, session.user.id, 'OWNER');

    await prisma.$transaction([
      prisma.eventAttendee.deleteMany({
        where: { eventId: id, email }
      }),
      prisma.userActivity.create({
        data: {
          userId: session.user.id,
          type: 'REMOVE_ATTENDEE',
          details: `Removed ${email} from event ${id}`,
          createdAt: new Date(),
          createdBy: session.user.email || 'system'
        }
      })
    ]);

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    return handleApiError(error);
  }
}

async function sendEventInvitation(event: EventWithUser, recipientEmail: string) {
  try {
    if (!process.env.NEXTAUTH_URL) {
      throw new Error('NEXTAUTH_URL environment variable missing');
    }

    await resend.emails.send({
      from: 'Event Manager <noreply@yourdomain.com>',
      to: recipientEmail,
      subject: `Invitation: ${event.title}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>You're invited to ${event.title}</h2>
          <p><strong>Organizer:</strong> ${event.user.name}</p>
          <p><strong>Date:</strong> ${event.startTime.toLocaleString()}</p>
          ${event.location && `<p><strong>Location:</strong> ${event.location}</p>`}
          ${event.description && `<p>${event.description}</p>`}
          <a href="${process.env.NEXTAUTH_URL}/events/${event.id}/respond?email=${encodeURIComponent(recipientEmail)}"
             style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
            RSVP Now
          </a>
        </div>
      `
    });

  } catch (error) {
    console.error('Failed to send invitation:', error);
    // Consider logging failed email attempts to your database
  }
}