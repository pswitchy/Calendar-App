// src/app/layout.tsx
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Calendar App',
  description: 'A modern calendar application with Google Calendar integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <ResponsiveLayout>{children}</ResponsiveLayout>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}