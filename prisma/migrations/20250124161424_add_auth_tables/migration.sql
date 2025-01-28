/*
  Warnings:

  - Added the required column `email` to the `EventAttendee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "TimeZonePreference" AS ENUM ('LOCAL', 'UTC', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CalendarView" AS ENUM ('MONTH', 'WEEK', 'DAY', 'AGENDA');

-- AlterTable
ALTER TABLE "EventAttendee" ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "failedAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lockoutUntil" TIMESTAMP(3),
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "title" TEXT,
    "bio" TEXT,
    "phoneNumber" TEXT,
    "location" TEXT,
    "theme" "Theme" NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "timeZonePreference" "TimeZonePreference" NOT NULL DEFAULT 'LOCAL',
    "defaultView" "CalendarView" NOT NULL DEFAULT 'MONTH',
    "workingHours" JSONB,
    "weekStartsOn" INTEGER NOT NULL DEFAULT 0,
    "defaultEventDuration" INTEGER NOT NULL DEFAULT 60,
    "showWeekends" BOOLEAN NOT NULL DEFAULT true,
    "showDeclinedEvents" BOOLEAN NOT NULL DEFAULT false,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "reminderDefault" INTEGER,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastActive" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'parthsharma-git',
    "updatedBy" TEXT,
    "calendarIntegrations" JSONB,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "eventsCreated" INTEGER NOT NULL DEFAULT 0,
    "totalEventHours" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_profiles_userId_idx" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_profiles_status_idx" ON "user_profiles"("status");

-- CreateIndex
CREATE INDEX "user_profiles_lastActive_idx" ON "user_profiles"("lastActive");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
