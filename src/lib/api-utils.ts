import { NextResponse } from 'next/server';

const CURRENT_TIMESTAMP = new Date('2025-01-23 07:25:31');
const CURRENT_USER = 'parthsharma-git';

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error, {
    timestamp: CURRENT_TIMESTAMP,
    user: CURRENT_USER,
  });

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

export const CONSTANTS = {
  CURRENT_TIMESTAMP,
  CURRENT_USER,
};