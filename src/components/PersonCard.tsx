import type { Person } from '../types';
import { statusLabel, formatDate, isOverdue } from '../utils';

interface Props {
  person: Person;
  onEdit: () => void;
  onDelete: () => void;
  onLogContact: () => void;
}

export default function PersonCard({ person, onEdit, onDelete, onLogContact }: Props) {
  const { label, color } = statusLabel(person);

  return (
    <div className={`person-card ${isOverdue(person) ? 'overdue' : ''}`}>
      <div className="card-header">
        <div className="card-name-row">
          <h3>{person.name}</h3>
          <span className="category-tag">{person.category}</span>
        </div>
        <span className="status-badge" style={{ color }}>{label}</span>
      </div>
      <div className="card-meta">
        <span>Every {person.frequency} days</span>
        {person.lastContact && <span>Last: {formatDate(person.lastContact)}</span>}
      </div>
      {person.notes && <p className="card-notes">{person.notes}</p>}
      <div className="card-actions">
        <button className="btn-contact" onClick={onLogContact}>Log contact</button>
        <button className="btn-icon" onClick={onEdit} title="Edit">✏️</button>
        <button className="btn-icon btn-delete" onClick={onDelete} title="Delete">🗑</button>
      </div>
    </div>
  );
}
