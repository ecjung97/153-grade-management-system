import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, GripVertical } from 'lucide-react';
import type { RubricCriteria, RubricLevel } from '../types';

interface RubricBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  initialRubric: RubricCriteria[];
  onSave: (rubric: RubricCriteria[]) => void;
}

export const RubricBuilder: React.FC<RubricBuilderProps> = ({ isOpen, onClose, initialRubric, onSave }) => {
  const [rubric, setRubric] = useState<RubricCriteria[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRubric(JSON.parse(JSON.stringify(initialRubric)));
    }
  }, [isOpen, initialRubric]);

  if (!isOpen) return null;

  const handleAddCriteria = () => {
    setRubric(prev => [
      ...prev,
      {
        id: `crit-${Date.now()}`,
        name: '새 평가 요소',
        levels: [
          { label: '상', score: 3, description: '' },
          { label: '중', score: 2, description: '' },
          { label: '하', score: 1, description: '' }
        ]
      }
    ]);
  };

  const handleRemoveCriteria = (id: string) => {
    setRubric(prev => prev.filter(c => c.id !== id));
  };

  const updateCriteriaName = (id: string, name: string) => {
    setRubric(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const updateLevel = (critId: string, levelIndex: number, field: keyof RubricLevel, value: any) => {
    setRubric(prev => prev.map(c => {
      if (c.id === critId) {
        const newLevels = [...c.levels];
        newLevels[levelIndex] = { ...newLevels[levelIndex], [field]: value };
        return { ...c, levels: newLevels };
      }
      return c;
    }));
  };

  const handleAddLevel = (critId: string) => {
    setRubric(prev => prev.map(c => {
      if (c.id === critId) {
        return {
          ...c,
          levels: [...c.levels, { label: '새 등급', score: 0, description: '' }]
        };
      }
      return c;
    }));
  };

  const handleRemoveLevel = (critId: string, levelIndex: number) => {
    setRubric(prev => prev.map(c => {
      if (c.id === critId) {
        return {
          ...c,
          levels: c.levels.filter((_, idx) => idx !== levelIndex)
        };
      }
      return c;
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Rubric (평가 기준표 수정)</h2>
            <p className="text-sm text-slate-500">Customize the evaluation criteria and scoring levels for this assessment.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 bg-slate-50 flex-1 space-y-6">
          {rubric.map((crit) => (
            <div key={crit.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-slate-100 p-3 flex justify-between items-center border-b border-slate-200">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical size={16} className="text-slate-400" />
                  <input 
                    type="text" 
                    value={crit.name}
                    onChange={(e) => updateCriteriaName(crit.id, e.target.value)}
                    className="font-bold text-slate-800 bg-white px-3 py-1.5 rounded border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-1/3"
                    placeholder="Criteria Name"
                  />
                </div>
                <button 
                  onClick={() => handleRemoveCriteria(crit.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                  title="Remove Criteria"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-4 overflow-x-auto">
                <div className="flex gap-4 min-w-max">
                  {crit.levels.map((level, lIdx) => (
                    <div key={lIdx} className="w-64 border border-slate-200 rounded-lg p-3 relative group bg-slate-50 hover:bg-white transition-colors flex flex-col">
                      <button 
                        onClick={() => handleRemoveLevel(crit.id, lIdx)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 shadow-sm z-10"
                      >
                        <X size={12} />
                      </button>
                      <div className="flex gap-2 mb-3">
                        <input 
                          type="text" 
                          value={level.label}
                          onChange={(e) => updateLevel(crit.id, lIdx, 'label', e.target.value)}
                          className="w-full font-bold px-2 py-1 border border-slate-200 rounded text-sm text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Label (e.g. 상)"
                        />
                        <input 
                          type="number" 
                          value={level.score}
                          onChange={(e) => updateLevel(crit.id, lIdx, 'score', Number(e.target.value))}
                          className="w-20 font-bold px-2 py-1 border border-slate-200 rounded text-sm text-center text-blue-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Score"
                        />
                      </div>
                      <textarea 
                        value={level.description}
                        onChange={(e) => updateLevel(crit.id, lIdx, 'description', e.target.value)}
                        className="w-full text-sm p-2 border border-slate-200 rounded resize-none h-24 flex-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Description of this level..."
                      />
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => handleAddLevel(crit.id)}
                    className="w-12 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    title="Add Level"
                  >
                    <Plus size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={handleAddCriteria}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Evaluation Criteria (평가 요소 추가)
          </button>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 flex justify-end gap-3 bg-white">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave(rubric);
              onClose();
            }}
            className="px-6 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Save size={18} />
            Save Rubric
          </button>
        </div>
      </div>
    </div>
  );
};
