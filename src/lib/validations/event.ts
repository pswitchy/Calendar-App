import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().optional(),
  category: z.string().optional(),
});