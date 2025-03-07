# Calendar Application

## Overview
A modern, feature-rich calendar application built with Next.js 14, TypeScript, and Prisma. 

## Features
- 📅 Multiple calendar views (Month, Week, Day)
- 🔄 Real-time updates with optimistic UI
- 👥 Event management with attendees
- 🔔 Notifications system
- 🎨 Customizable themes
- 📱 Responsive design
- 🔒 Secure authentication
- 📊 Event analytics
- 🔍 Advanced search functionality

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **State Management:** TanStack Query
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Forms:** React Hook Form + Zod
- **Testing:** Jest + React Testing Library

## Prerequisites
- Node.js 18.x or later
- PostgreSQL 17 
- npm or yarn
- Git

## Installation

```bash
# Clone the repository
git clone https://github.com/pswitchy/Calendar-App.git

# Navigate to project directory
cd Calendar-App

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Set up database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

## Environment Variables
Create a `.env.local` file with the following variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/calendar_db"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth (if using)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# API Keys
NOTIFICATION_API_KEY="your-notification-api-key"
```

## API Routes

### Events
```typescript
GET    /api/events
POST   /api/events
GET    /api/events/:id
PATCH  /api/events/:id
DELETE /api/events/:id
```

### Attendees
```typescript
GET    /api/events/:id/attendees
POST   /api/events/:id/attendees
PATCH  /api/events/:id/attendees/:userId
DELETE /api/events/:id/attendees/:userId
```

## Scripts
```json
{
  "dev": "Start development server",
  "build": "Build production application",
  "start": "Start production server",
  "lint": "Run ESLint",
  "test": "Run tests",
  "prisma:generate": "Generate Prisma client",
  "prisma:migrate": "Run database migrations"
}
```

## Database Schema
Key models include:
- User
- Event
- EventAttendee
- UserPreferences
- Notification

See `prisma/schema.prisma` for complete schema.

## Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test -- calendar.test.ts

# Run tests with coverage
npm test -- --coverage
```

## Deployment
The application can be deployed to various platforms:

### Vercel
```bash
npm i -g vercel
vercel
```

## Performance Optimizations
- Implemented data caching with TanStack Query
- Uses Next.js Image optimization
- Code splitting and lazy loading
- Database query optimization

## Security Features
- CSRF protection
- XSS prevention
- Rate limiting
- Input validation
- Secure authentication
- Data encryption

## Monitoring
- Error tracking with Sentry
- Performance monitoring
- User analytics
- Server health checks

## Acknowledgments
- shadcn/ui for UI components
- Vercel for hosting
- The Next.js team
- Contributors and testers
