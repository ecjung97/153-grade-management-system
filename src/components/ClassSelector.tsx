import React from 'react';
import type { ClassGroup } from '../types';
import { ChevronDown, Users } from 'lucide-react';
import './ClassSelector.css';

interface ClassSelectorProps {
  classes: ClassGroup[];
  selectedClassId: string;
  onSelectClass: (id: string) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({ classes, selectedClassId, onSelectClass }) => {
  return (
    <div className="class-selector">
      <label className="selector-label">
        <Users size={18} className="icon-label" />
        Select Class
      </label>
      <div className="select-wrapper">
        <select 
          value={selectedClassId} 
          onChange={(e) => onSelectClass(e.target.value)}
          className="class-select"
        >
          <option value="" disabled>Choose a class...</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.gradeLevel})
            </option>
          ))}
        </select>
        <ChevronDown className="select-icon" size={20} />
      </div>
    </div>
  );
};
