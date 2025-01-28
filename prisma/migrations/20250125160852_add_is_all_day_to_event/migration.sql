/*
  Warnings:

  - Made the column `isAllDay` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "isAllDay" SET NOT NULL,
ALTER COLUMN "isAllDay" SET DEFAULT false;
