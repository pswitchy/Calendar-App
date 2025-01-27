'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to access your calendar</p>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/calendar' })}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Image
            src="https://www.vectorlogo.zone/logos/google/google-icon.svg"
            alt="Google logo"
            width={20}
            height={20}
          />
          Sign in with Google
        </button>

        <div className="text-center text-sm text-gray-600">
          Don't have an account? 
          <Link 
            href="./register" 
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}