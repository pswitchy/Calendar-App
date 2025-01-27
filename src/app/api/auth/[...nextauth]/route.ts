// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function logAuthAttempt(
//   success: boolean,
//   providerId: string,
//   ip: string,
//   userAgent: string
// ) {
//   const timestamp = new Date('2025-01-24 15:53:35');
//   const userId = 'parthsharma-git';

//   try {
//     await prisma.authLog.create({
//       data: {
//         success,
//         providerId,
//         ipAddress: ip,
//         userAgent,
//         timestamp,
//         createdBy: userId,
//         createdAt: timestamp,
//         updatedAt: timestamp,
//       },
//     });
//   } catch (error) {
//     console.error('Failed to log auth attempt:', error);
//   }
// }

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };