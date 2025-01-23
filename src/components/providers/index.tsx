'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { CalendarProvider } from '@/components/calendar/CalendarContext';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <CalendarProvider>{children}</CalendarProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}