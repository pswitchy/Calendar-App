'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Calendar, User, Settings, ChevronLeft } from 'lucide-react';
import { SidebarLink } from './SidebarLink';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Only visible on mobile */}
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-14",
          "bg-background/80 backdrop-blur-sm border-b",
          "lg:hidden" // Hide on desktop
        )}
      >
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <h1 className="text-lg font-semibold">Calendar App</h1>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <>
            {/* Overlay for mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              />
            )}
            
            {/* Sidebar */}
            <motion.aside
              initial={isMobile ? { x: -320 } : undefined}
              animate={{ x: 0 }}
              exit={isMobile ? { x: -320 } : undefined}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "fixed top-0 left-0 z-50 h-full w-64",
                "bg-background border-r",
                "flex flex-col",
                "lg:translate-x-0 lg:z-0"
              )}
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 h-14 border-b">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold">Calendar App</h2>
                </div>
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <ChevronLeft size={20} />
                  </Button>
                )}
              </div>
              
              {/* Sidebar Navigation */}
              <nav className="flex-1 p-4 space-y-1">
                <SidebarLink 
                  href="/calendar" 
                  icon={Calendar}
                  label="View your schedule"
                  className="group"
                >
                  <span>Calendar</span>
                  <span className="hidden group-hover:block text-xs text-muted-foreground">
                    View your schedule
                  </span>
                </SidebarLink>
                <SidebarLink 
                  href="/profile" 
                  icon={User}
                  label="Manage your profile"
                  className="group"
                >
                  <span>Profile</span>
                  <span className="hidden group-hover:block text-xs text-muted-foreground">
                    Manage your profile
                  </span>
                </SidebarLink>
                <SidebarLink 
                  href="/settings" 
                  icon={Settings}
                  label="Adjust preferences"
                  className="group"
                >
                  <span>Settings</span>
                  <span className="hidden group-hover:block text-xs text-muted-foreground">
                    Adjust preferences
                  </span>
                </SidebarLink>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 ease-in-out",
          isMobile ? "pt-14" : "pt-0", // Only add top padding on mobile
          isSidebarOpen && !isMobile ? "lg:pl-64" : "lg:pl-0"
        )}
      >
        <motion.div
          layout
          className={cn(
            "min-h-screen p-4",
            "lg:p-6" // Larger padding on desktop
          )}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};