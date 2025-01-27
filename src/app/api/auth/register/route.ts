import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/lib/n-auth';
import { prisma } from '@/lib/prisma';

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Password must include uppercase, lowercase, number and special character'
    ),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const currentDateTime = new Date('2025-01-22T18:58:50Z');
    // const userId = 'parthsharma-git';
    
    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password using crypto
    const { hash, salt } = await hashPassword(validatedData.password);

    // Create user and password in transaction
    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          role: 'USER',
          createdAt: currentDateTime,
          updatedAt: currentDateTime,
        },
      });

      await tx.password.create({
        data: {
          userId: user.id,
          hash,
          salt,
        },
      });

      return user;
    });

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}