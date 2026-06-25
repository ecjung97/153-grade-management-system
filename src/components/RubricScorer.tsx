import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { RubricCriteria } from '../types';

interface RubricScorerProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  rubric: RubricCriteria[];
  initialScores?: Record<string, number>;
  onSave: (scores: Record<string, number>, totalValue: number) => void;
}

export const RubricScorer: React.FC<RubricScorerProps> = ({ isOpen, onClose, studentName, rubric, initialScores, onSave }) => {
  const [selectedScores, setSelectedScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      setSelectedScores(initialScores || {});
    }
  }, [isOpen, initialScores]);

  if (!isOpen) return null;

  const handleSelect = (criteriaId: string, score: number) => {
    setSelectedScores(prev => ({
      ...prev,
      [criteriaId]: score
    }));
  };

  const calculateTotal = () => {
    return Object.values(selectedScores).reduce((sum, score) => sum + score, 0);
  };

  const maxTotal = rubric.reduce((sum, crit) => {
    const maxLevel = Math.max(...crit.levels.map(l => l.score));
    return sum + maxLevel;
  }, 0);

  const totalScore = calculateTotal();

  const handleSave = () => {
    onSave(selectedScores, totalScore);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Rubric Grading: {studentName}</h2>
            <p className="text-sm text-slate-500">Select the appropriate level for each criteria.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto p-2 sm:p-5 bg-slate-50 flex-1">
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm min-w-[600px]">
            <table className="w-full text-left text-sm table-fixed">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold w-1/4">평가 요소 (Criteria)</th>
                  <th className="px-4 py-3 font-semibold w-1/4 text-center">상</th>
                  <th className="px-4 py-3 font-semibold w-1/4 text-center">중</th>
                  <th className="px-4 py-3 font-semibold w-1/4 text-center">하</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rubric.map(crit => (
                  <tr key={crit.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold text-slate-900 align-top">
                      {crit.name}
                    </td>
                    {crit.levels.map(level => {
                      const isSelected = selectedScores[crit.id] === level.score;
                      return (
                        <td key={level.score} className="p-2 align-top h-full">
                          <div 
                            onClick={() => handleSelect(crit.id, level.score)}
                            className={`h-full p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col ${
                              isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-sm' 
                              : 'border-transparent hover:border-blue-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className={`font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                                {level.label} ({level.score}점)
                              </span>
                              {isSelected && <Check size={16} className="text-blue-600" />}
                            </div>
                            <p className={`text-xs leading-relaxed ${isSelected ? 'text-blue-800' : 'text-slate-600'}`}>
                              {level.description}
                            </p>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 flex justify-between items-center bg-white">
          <div className="text-lg">
            Total Score: <span className="text-2xl font-bold text-blue-600">{totalScore}</span> <span className="text-slate-500">/ {maxTotal}</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-5 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Save Score
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
