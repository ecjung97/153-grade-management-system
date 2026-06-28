import React, { useState } from 'react';
import type { Student, RubricCriteria } from '../types';
import { RubricScorer } from './RubricScorer';
import './GradingTable.css';

interface GradingTableProps {
  students: Student[];
  scores: Record<string, { value: number | ''; notes: string; isAbsent?: boolean }>;
  onScoreChange: (studentId: string, value: number | '') => void;
  onNotesChange: (studentId: string, notes: string) => void;
  onAbsentChange: (studentId: string, isAbsent: boolean) => void;
  maxScore: number;
  gradingMode?: 'Standard' | 'Rubric' | 'Homework';
  rubric?: RubricCriteria[];
  onRubricScoreChange?: (studentId: string, rubricScores: Record<string, number>, totalValue: number) => void;
}

export const GradingTable: React.FC<GradingTableProps> = ({ 
  students, 
  scores, 
  onScoreChange, 
  onNotesChange,
  onAbsentChange,
  maxScore,
  gradingMode = 'Standard',
  rubric,
  onRubricScoreChange
}) => {
  const [activeRubricStudentId, setActiveRubricStudentId] = useState<string | null>(null);
  if (students.length === 0) {
    return <div className="empty-state">No students found in this class.</div>;
  }

  return (
    <div className="grading-table-container">
      <table className="grading-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th className="w-20 text-center">Absent</th>
            <th className="score-col">{gradingMode === 'Homework' ? 'Status' : `Score (out of ${maxScore})`}</th>
            <th>Notes (Optional)</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            const studentScore = scores[student.id] || { value: '', notes: '' };
            return (
              <tr key={student.id}>
                <td className="student-name">
                  <div className="name-primary">{student.firstName} {student.lastName}</div>
                  <div className="name-secondary">{student.id}</div>
                </td>
                <td className="text-center">
                  <input 
                    type="checkbox"
                    checked={!!studentScore.isAbsent}
                    onChange={(e) => onAbsentChange(student.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </td>
                <td className="score-cell">
                  {gradingMode === 'Homework' ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => onScoreChange(student.id, 2)}
                        disabled={studentScore.isAbsent}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${studentScore.value === 2 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'} disabled:opacity-50`}
                      >
                        🟢 Done
                      </button>
                      <button
                        onClick={() => onScoreChange(student.id, 1)}
                        disabled={studentScore.isAbsent}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${studentScore.value === 1 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'} disabled:opacity-50`}
                      >
                        🟡 Partial
                      </button>
                      <button
                        onClick={() => onScoreChange(student.id, 0)}
                        disabled={studentScore.isAbsent}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${studentScore.value === 0 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'} disabled:opacity-50`}
                      >
                        🔴 Not Done
                      </button>
                    </div>
                  ) : gradingMode === 'Rubric' ? (
                    <button 
                      onClick={() => !studentScore.isAbsent && setActiveRubricStudentId(student.id)}
                      disabled={studentScore.isAbsent}
                      className="w-full text-left px-3 py-2 border rounded-lg border-slate-300 hover:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400 font-medium transition-colors"
                    >
                      {studentScore.isAbsent ? "Absent" : (studentScore.value !== '' ? `${studentScore.value} / ${maxScore}` : "Click to Grade")}
                    </button>
                  ) : (
                    <input
                      type="number"
                      className="score-input disabled:bg-slate-50 disabled:text-slate-400"
                      value={studentScore.isAbsent ? '' : studentScore.value}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        onScoreChange(student.id, val);
                      }}
                      onFocus={() => studentScore.value === 0 && !studentScore.isAbsent && onScoreChange(student.id, '')}
                      min="0"
                      max={maxScore}
                      placeholder={studentScore.isAbsent ? "Absent" : "--"}
                      disabled={studentScore.isAbsent}
                    />
                  )}
                </td>
                <td className="notes-cell">
                  <input
                    type="text"
                    className="notes-input"
                    value={studentScore.notes}
                    onChange={(e) => onNotesChange(student.id, e.target.value)}
                    placeholder="Add a note..."
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {activeRubricStudentId && gradingMode === 'Rubric' && rubric && (
        <RubricScorer 
          isOpen={true}
          onClose={() => setActiveRubricStudentId(null)}
          studentName={
            (() => {
              const s = students.find(s => s.id === activeRubricStudentId);
              return s ? `${s.lastName} ${s.firstName}` : '';
            })()
          }
          rubric={rubric}
          initialScores={(scores[activeRubricStudentId] as any)?.rubricScores}
          onSave={(rubricScores, totalValue) => {
            onRubricScoreChange?.(activeRubricStudentId, rubricScores, totalValue);
          }}
        />
      )}
    </div>
  );
};
