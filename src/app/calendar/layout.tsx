// src/app/calendar/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import { useCalendar } from '@/components/calendar/CalendarContext';
import { useCustomToast } from '@/components/ui/useCustomToast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { AnimatePresence, motion } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

function CalendarLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const toast = useCustomToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { currentDate: date, navigateToNext, navigateToPrevious, navigateToToday } = useCalendar();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    // Set initial sidebar state based on screen size
    setIsSidebarOpen(isDesktop);
  }, [isDesktop]);

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
    <div className="flex h-screen flex-col bg-background">
      <motion.div
        initial={false}
        animate={{ height: 'auto' }}
        className="sticky top-0 z-10"
      >
        <CalendarHeader
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          currentDate={date}
          onPrevMonth={navigateToPrevious}
          onNextMonth={navigateToNext}
          onToday={navigateToToday}
          className="border-b backdrop-blur-sm bg-background/80"
        />
      </motion.div>

      <div className="flex flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              initial={{ x: isDesktop ? 0 : -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute lg:relative z-20"
            >
              <CalendarSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                className={cn(
                  'w-80 border-r border-border bg-background/80 backdrop-blur-sm h-full',
                  'shadow-lg lg:shadow-none'
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.main
          layout
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            isSidebarOpen && !isDesktop && "opacity-50"
          )}
          style={{
            transformOrigin: "left"
          }}
        >
          <div className="h-full p-4 lg:p-6">{children}</div>
        </motion.main>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
          />
        )}
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <div className="h-16 border-b border-border">
        <Skeleton className="h-full w-full animate-pulse" />
      </div>
      <div className="flex flex-1">
        <div className="w-80 border-r border-border">
          <Skeleton className="h-full w-full animate-pulse" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-full w-full animate-pulse" />
        </div>
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