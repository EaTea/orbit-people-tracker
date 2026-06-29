import type { Person } from './types';

const KEY = 'orbit_people';

export function loadPeople(): Person[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePeople(people: Person[]): void {
  localStorage.setItem(KEY, JSON.stringify(people));
}

export function exportJSON(people: Person[]): void {
  const blob = new Blob([JSON.stringify(people, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'orbit-people.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file: File): Promise<Person[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!Array.isArray(data)) throw new Error('Expected an array');
        resolve(data as Person[]);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
