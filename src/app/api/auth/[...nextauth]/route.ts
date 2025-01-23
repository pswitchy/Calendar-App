import NextAuth from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth'; // Assuming you have an authOptions file
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

const handler = NextAuth(authOptions);

interface AuthLog {
  id: string;
  success: boolean;
  providerId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Log authentication attempts
async function logAuthAttempt(
  req: NextApiRequest,
  success: boolean,
  providerId: string
) {
  const timestamp = new Date();
  const userId = 'parthsharma-git';

  try {
    await prisma.authLog.create({
      data: {
        success,
        providerId,
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        timestamp,
        createdBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    });
  } catch (error) {
    console.error('Failed to log auth attempt:', error);
  }
}

async function enhancedHandler(req: NextApiRequest, res: NextApiResponse) {
  // Track authentication provider
  const providerId = (req.query?.providerId as string) || 'credentials';

  try {
    // For sign-in attempts
    if (req.method === 'POST' && req.url?.includes('/signin')) {
      await logAuthAttempt(req, true, providerId);
    }

    // Call the original handler
    await handler(req, res);

    // Redirect to profile page if Google sign-in is successful
    if (providerId === 'google') {
      return NextResponse.redirect('/profile');
    }
  } catch (error) {
    console.error('Error in enhancedHandler:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Success' });
}

export { enhancedHandler as GET, enhancedHandler as POST };