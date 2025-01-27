// src/app/api/events/[id]/attendees/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Resend } from 'resend';
import { ApiError, handleApiError } from '@/lib/api-utils';

// Initialize Resend with environment variable validation
const resend = new Resend(process.env.RESEND_API_KEY!);

// Validation schemas
const paramsSchema = z.object({
  id: z.string().min(1, 'Valid event ID is required'),
});

const attendeeSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .transform(email => email.toLowerCase()),
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

// Utility function for common authorization checks
async function verifyEventAccess(eventId: string, userId: string, requiredRole?: 'OWNER') {
  const whereClause = {
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
  };

  const event = await prisma.event.findFirst({
    where: whereClause,
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  if (!event) {
    throw new ApiError(404, 'Event not found or access denied');
  }

  return event;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = paramsSchema.parse(params);
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    // Verify event access
    await verifyEventAccess(id, session.user.id);

    // Retrieve attendees with user details
    const attendees = await prisma.eventAttendee.findMany({
      where: { eventId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'VIEW_ATTENDEES',
        details: `Viewed attendees for event ${id}`,
        createdAt: new Date(),
        createdBy: session.user.email || 'system'
      }
    });

    return NextResponse.json(attendees, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = paramsSchema.parse(params);
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const body = await request.json();
    const { email, role, status } = attendeeSchema.parse(body);

    // Verify event access with owner privileges
    const event = await verifyEventAccess(id, session.user.id, 'OWNER');

    // Check existing attendee
    const existingAttendee = await prisma.eventAttendee.findUnique({
      where: {
        eventId_email: {
          eventId: id,
          email
        }
      }
    });

    if (existingAttendee) {
      throw new ApiError(409, 'Attendee already exists for this event');
    }

    // Create attendee transaction
    const [attendee] = await prisma.$transaction([
      prisma.eventAttendee.create({
        data: {
          eventId: id,
          email,
          role,
          status,
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

    // Validate organizer information
    if (!event.user.name || !event.user.email) {
      throw new ApiError(500, 'Event organizer information incomplete');
    }

    // Send invitation
    await sendEventInvitation(event, email);

    return NextResponse.json(attendee, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = paramsSchema.parse(params);
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      throw new ApiError(400, 'Email parameter is required');
    }

    // Verify event access with owner privileges
    await verifyEventAccess(id, session.user.id, 'OWNER');

    // Delete attendee transaction
    await prisma.$transaction([
      prisma.eventAttendee.deleteMany({
        where: {
          eventId: id,
          email
        }
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

    return new NextResponse(null, { 
      status: 204,
      headers: {
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}

// Email service function
async function sendEventInvitation(event: EventWithUser, recipientEmail: string) {
  try {
    if (!process.env.NEXTAUTH_URL) {
      throw new Error('NEXTAUTH_URL environment variable not set');
    }

    const response = await resend.emails.send({
      from: 'Event Manager <noreply@yourdomain.com>',
      to: recipientEmail,
      subject: `Invitation: ${event.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Event Invitation</h2>
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>Organizer:</strong> ${event.user.name} (${event.user.email})</p>
          <p><strong>Date:</strong> ${event.startTime.toLocaleString()}</p>
          ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
          ${event.description ? `<p><strong>Details:</strong> ${event.description}</p>` : ''}
          <div style="margin-top: 2rem;">
            <a href="${process.env.NEXTAUTH_URL}/events/${event.id}/respond?email=${encodeURIComponent(recipientEmail)}" 
               style="background-color: #2563eb; color: white; padding: 0.75rem 1.5rem; 
                      text-decoration: none; border-radius: 0.375rem;">
              Respond to Invitation
            </a>
          </div>
        </div>
      `
    });

    return response;

  } catch (error) {
    console.error('Email sending failed:', error);
    // Consider adding failed email logging to your database
  }
}