// src/lib/user/createDefaultProfile.ts

import { prisma } from '@/lib/prisma';

export async function createDefaultProfile(userId: string) {
  const currentTimestamp = new Date('2025-01-24 16:09:48');
  
  return await prisma.userProfile.create({
    data: {
      userId,
      displayName: '',
      theme: 'system',
      language: 'en',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timeZonePreference: 'LOCAL',
      defaultView: 'MONTH',
      weekStartsOn: 0,
      defaultEventDuration: 60,
      showWeekends: true,
      showDeclinedEvents: false,
      emailNotifications: true,
      pushNotifications: true,
      status: 'ACTIVE',
      lastActive: currentTimestamp,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      createdBy: 'parthsharma-git',
      workingHours: {
        // Default 9-5 working hours
        '1': { start: '09:00', end: '17:00', isWorkDay: true },
        '2': { start: '09:00', end: '17:00', isWorkDay: true },
        '3': { start: '09:00', end: '17:00', isWorkDay: true },
        '4': { start: '09:00', end: '17:00', isWorkDay: true },
        '5': { start: '09:00', end: '17:00', isWorkDay: true },
        '6': { start: '00:00', end: '00:00', isWorkDay: false },
        '0': { start: '00:00', end: '00:00', isWorkDay: false },
      },
    },
  });
}