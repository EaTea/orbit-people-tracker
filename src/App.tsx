import { useState, useRef, useCallback } from 'react';
import type { Person } from './types';
import { loadPeople, savePeople, exportJSON, importJSON } from './storage';
import { isOverdue } from './utils';
import PersonCard from './components/PersonCard';
import PersonForm from './components/PersonForm';
import './App.css';

type ModalState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'edit'; person: Person };

export default function App() {
  const [people, setPeople] = useState<Person[]>(() => loadPeople());
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'overdue'>('all');
  const [search, setSearch] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const categories = [...new Set(people.map(p => p.category))].sort();

  const update = useCallback((next: Person[]) => {
    setPeople(next);
    savePeople(next);
  }, []);

  function handleSave(person: Person) {
    if (modal.type === 'add') {
      update([...people, person]);
    } else if (modal.type === 'edit') {
      update(people.map(p => p.id === person.id ? person : p));
    }
    setModal({ type: 'none' });
  }

  function handleDelete(id: string) {
    if (confirm('Remove this person from Orbit?')) {
      update(people.filter(p => p.id !== id));
    }
  }

  function handleLogContact(id: string) {
    const today = new Date().toISOString().slice(0, 10);
    update(people.map(p => p.id === id ? { ...p, lastContact: today } : p));
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importJSON(file);
      if (confirm(`Import ${imported.length} people? This will merge with your existing list (matching by id).`)) {
        const existing = new Map(people.map(p => [p.id, p]));
        imported.forEach(p => existing.set(p.id, p));
        update([...existing.values()]);
      }
    } catch {
      alert('Failed to import: invalid JSON format.');
    } finally {
      e.target.value = '';
    }
  }

  const visible = people
    .filter(p => filterCategory === 'all' || p.category === filterCategory)
    .filter(p => filterStatus === 'all' || isOverdue(p))
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aOver = isOverdue(a);
      const bOver = isOverdue(b);
      if (aOver !== bOver) return aOver ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  const overdueCount = people.filter(isOverdue).length;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>Orbit</h1>
          <span className="subtitle">Stay in touch, intentionally</span>
        </div>
        <div className="header-actions">
          <input
            ref={importRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <button className="btn-secondary" onClick={() => importRef.current?.click()}>Import</button>
          <button className="btn-secondary" onClick={() => exportJSON(people)}>Export</button>
          <button className="btn-primary" onClick={() => setModal({ type: 'add' })}>+ Add person</button>
        </div>
      </header>

      <div className="filters">
        <input
          className="search"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          className={filterStatus === 'overdue' ? 'btn-filter active' : 'btn-filter'}
          onClick={() => setFilterStatus(s => s === 'overdue' ? 'all' : 'overdue')}
        >
          Overdue {overdueCount > 0 && <span className="badge">{overdueCount}</span>}
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          {people.length === 0
            ? <>
                <p>Your orbit is empty.</p>
                <p>Add the people you want to stay in touch with.</p>
                <button className="btn-primary" onClick={() => setModal({ type: 'add' })}>Add your first person</button>
              </>
            : <p>No people match your filters.</p>
          }
        </div>
      ) : (
        <div className="people-grid">
          {visible.map(person => (
            <PersonCard
              key={person.id}
              person={person}
              onEdit={() => setModal({ type: 'edit', person })}
              onDelete={() => handleDelete(person.id)}
              onLogContact={() => handleLogContact(person.id)}
            />
          ))}
        </div>
      )}

      {modal.type !== 'none' && (
        <div className="modal-overlay" onClick={() => setModal({ type: 'none' })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{modal.type === 'add' ? 'Add person' : 'Edit person'}</h2>
            <PersonForm
              initial={modal.type === 'edit' ? modal.person : undefined}
              categories={categories}
              onSave={handleSave}
              onCancel={() => setModal({ type: 'none' })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
