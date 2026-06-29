import { useState } from 'react';
import type { Person } from '../types';
import { generateId } from '../utils';

interface Props {
  initial?: Partial<Person>;
  categories: string[];
  onSave: (person: Person) => void;
  onCancel: () => void;
}

const FREQUENCY_PRESETS = [
  { label: 'Weekly', days: 7 },
  { label: 'Biweekly', days: 14 },
  { label: 'Monthly', days: 30 },
  { label: 'Quarterly', days: 90 },
  { label: 'Annually', days: 365 },
];

export default function PersonForm({ initial, categories, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [newCategory, setNewCategory] = useState('');
  const [frequency, setFrequency] = useState(initial?.frequency ?? 30);
  const [lastContact, setLastContact] = useState(initial?.lastContact ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const effectiveCategory = newCategory.trim() || category;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !effectiveCategory) return;
    onSave({
      id: initial?.id ?? generateId(),
      name: name.trim(),
      category: effectiveCategory.trim(),
      frequency,
      lastContact: lastContact || null,
      notes: notes.trim(),
      createdAt: initial?.createdAt ?? Date.now(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="person-form">
      <div className="form-group">
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
      </div>
      <div className="form-group">
        <label>Category</label>
        {categories.length > 0 && !newCategory && (
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Select category…</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <input
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder={categories.length > 0 ? 'Or type a new category…' : 'Category (e.g. Friend, Work)'}
        />
      </div>
      <div className="form-group">
        <label>Contact frequency</label>
        <div className="preset-buttons">
          {FREQUENCY_PRESETS.map(p => (
            <button
              type="button"
              key={p.days}
              className={frequency === p.days ? 'preset active' : 'preset'}
              onClick={() => setFrequency(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="custom-freq">
          <input
            type="number"
            min={1}
            value={frequency}
            onChange={e => setFrequency(Number(e.target.value))}
          />
          <span>days</span>
        </div>
      </div>
      <div className="form-group">
        <label>Last contacted</label>
        <input type="date" value={lastContact} onChange={e => setLastContact(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any context or reminders…" />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save</button>
      </div>
    </form>
  );
}
