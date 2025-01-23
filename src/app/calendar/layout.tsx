'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import { useCalendar } from '@/components/calendar/CalendarContext';
import { useCustomToast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';

function CalendarLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useCustomToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { currentDate: date, navigateToNext, navigateToPrevious, navigateToToday } = useCalendar();
  const currentDateTime = new Date('2025-01-23 16:52:06');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      toast.error('Please sign in to access the calendar');
    }
  }, [status, router, toast]);

  if (status === 'loading') {
    return <CalendarSkeleton />;
  }

  return (
    <div className="flex h-screen flex-col">
      <CalendarHeader
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentDate={date}
        onPrevMonth={navigateToPrevious}
        onNextMonth={navigateToNext}
        onToday={navigateToToday}
      />
      <div className="flex flex-1 overflow-hidden">
        <CalendarSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          className={cn(
            'w-64 border-r border-gray-200 bg-white transition-all duration-300',
            'dark:border-gray-800 dark:bg-gray-900',
            !isSidebarOpen && '-ml-64'
          )}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <CalendarLayoutContent>{children}</CalendarLayoutContent>
    </Providers>
  );
}

function CalendarSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <div className="h-16 border-b border-gray-200 dark:border-gray-800">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="flex flex-1">
        <div className="w-64 border-r border-gray-200 dark:border-gray-800">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}