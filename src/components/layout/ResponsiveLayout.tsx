'use client';

import { useState } from 'react';
import { Menu, X, Calendar, User, Settings } from 'lucide-react';
import { SidebarLink } from './SidebarLink';

import { ReactNode } from 'react';

export const ResponsiveLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Calendar App</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r transform transition-transform
          lg:translate-x-0 lg:static
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="p-4 space-y-2">
          <SidebarLink href="/calendar" icon={Calendar} label=''>
            Calendar
          </SidebarLink>
          <SidebarLink href="/profile" icon={User} label=''>
            Profile
          </SidebarLink>
          <SidebarLink href="/settings" icon={Settings} label=''>
            Settings
          </SidebarLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </main>
    </div>
  );
};