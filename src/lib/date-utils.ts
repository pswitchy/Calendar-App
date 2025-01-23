export const CURRENT_TIMESTAMP = new Date('2025-01-23 08:19:13');
export const CURRENT_USER = 'parthsharma-git';

export function getCurrentTimestamp(): Date {
  return CURRENT_TIMESTAMP;
}

export function getCurrentUser(): string {
  return CURRENT_USER;
}

export function formatDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}