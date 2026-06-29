import type { Person } from './types';

export function daysSinceContact(person: Person): number | null {
  if (!person.lastContact) return null;
  const last = new Date(person.lastContact).getTime();
  const now = Date.now();
  return Math.floor((now - last) / (1000 * 60 * 60 * 24));
}

export function daysUntilDue(person: Person): number | null {
  const days = daysSinceContact(person);
  if (days === null) return null;
  return person.frequency - days;
}

export function isOverdue(person: Person): boolean {
  const days = daysSinceContact(person);
  if (days === null) return true;
  return days >= person.frequency;
}

export function statusLabel(person: Person): { label: string; color: string } {
  if (!person.lastContact) return { label: 'Never contacted', color: '#ef4444' };
  const due = daysUntilDue(person)!;
  if (due < 0) return { label: `${Math.abs(due)}d overdue`, color: '#ef4444' };
  if (due === 0) return { label: 'Due today', color: '#f59e0b' };
  if (due <= 3) return { label: `Due in ${due}d`, color: '#f59e0b' };
  return { label: `Due in ${due}d`, color: '#22c55e' };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
