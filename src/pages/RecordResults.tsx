import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { AssessmentType, RubricCriteria } from '../types';
import { EXCEL_PRACTICAL_RUBRIC } from '../utils/defaultRubrics';
import { useAppContext } from '../context/AppContext';
import { ClassSelector } from '../components/ClassSelector';
import { GradingTable } from '../components/GradingTable';
import { AssessmentTypeSettings } from '../components/AssessmentTypeSettings';
import { RubricBuilder } from '../components/RubricBuilder';
import { Save, FileText, Calendar, Hash, Award, Users, Settings, Edit3 } from 'lucide-react';
import { getKoreanMonthWeek } from '../utils/dateUtils';
import { saveAssessmentResults, updateAssessmentResults } from '../services/db';
import './RecordResults.css';

export const RecordResults: React.FC = () => {
  const { classes, students, currentUser, assessments, refreshData, assessmentTypes } = useAppContext();
  const myClasses = classes.filter(c => c.teacherId === currentUser?.id);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [assessmentTitle, setAssessmentTitle] = useState('');
  
  // Try to use the first available assessment type, or fallback to 'Test'
  const [assessmentType, setAssessmentType] = useState<AssessmentType>(
    assessmentTypes.length > 0 ? assessmentTypes[0] : 'Test'
  );
  
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [maxScore, setMaxScore] = useState<number | "">(100);
  const [gradingMode, setGradingMode] = useState<'Standard' | 'Rubric'>('Standard');
  const [rubric, setRubric] = useState<RubricCriteria[]>(EXCEL_PRACTICAL_RUBRIC);
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRubricBuilderOpen, setIsRubricBuilderOpen] = useState(false);
  
  // scores map: studentId -> { value, notes, isAbsent, rubricScores }
  const [scores, setScores] = useState<Record<string, { value: number | ''; rubricScores?: Record<string, number>; notes: string; isAbsent?: boolean }>>({});

  const calculatedMaxScore = useMemo(() => {
    if (gradingMode === 'Standard') return maxScore === "" ? 0 : maxScore;
    return rubric.reduce((sum, crit) => {
      const maxLevel = Math.max(...crit.levels.map(l => l.score));
      return sum + maxLevel;
    }, 0);
  }, [gradingMode, maxScore, rubric]);

  useEffect(() => {
    if (editId) {
      const existing = assessments.find(a => a.id === editId);
      if (existing) {
        setSelectedClassId(existing.classId);
        setAssessmentTitle(existing.title);
        setAssessmentType(existing.type);
        setAssessmentDate(existing.date);
        setGradingMode(existing.gradingMode || 'Standard');
        if (existing.rubric) setRubric(existing.rubric);
        if (existing.gradingMode === 'Standard') {
          setMaxScore(existing.maxScore);
        }
        setScores(existing.results as any);
      }
    }
  }, [editId, assessments]);

  const handleScoreChange = (studentId: string, value: number | '') => {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], value, notes: prev[studentId]?.notes || '', isAbsent: false }
    }));
  };

  const handleRubricScoreChange = (studentId: string, rubricScores: Record<string, number>, totalValue: number) => {
    setScores(prev => ({
      ...prev,
      [studentId]: { 
        ...prev[studentId], 
        value: totalValue, 
        rubricScores: rubricScores, 
        notes: prev[studentId]?.notes || '', 
        isAbsent: false 
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes, value: prev[studentId]?.value ?? '' }
    }));
  };

  const handleAbsentChange = (studentId: string, isAbsent: boolean) => {
    setScores(prev => ({
      ...prev,
      [studentId]: { 
        ...prev[studentId], 
        isAbsent, 
        value: isAbsent ? '' : (prev[studentId]?.value ?? ''),
        notes: prev[studentId]?.notes || ''
      }
    }));
  };

  const studentsInClass = useMemo(() => {
    if (!selectedClassId) return [];
    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (!selectedClass) return [];
    return students.filter(s => selectedClass.studentIds.includes(s.id));
  }, [selectedClassId, classes, students]);

  const handleSave = async () => {
    if (!selectedClassId || !assessmentTitle) return;
    
    setIsSaving(true);
    try {
      const payload = {
        classId: selectedClassId,
        teacherId: currentUser?.id,
        title: assessmentTitle,
        type: assessmentType,
        date: assessmentDate,
        maxScore: calculatedMaxScore,
        gradingMode,
        ...(gradingMode === 'Rubric' ? { rubric } : {}),
        results: scores
      };

      if (editId) {
        await updateAssessmentResults(editId, payload);
        alert('Scores updated successfully!');
        await refreshData();
        navigate('/assessments');
      } else {
        await saveAssessmentResults(payload);
        alert('Scores saved successfully!');
        await refreshData();
        
        // Reset form
        setScores({});
        setAssessmentTitle('');
      }
    } catch (err) {
      console.error('Error saving assessment:', err);
      alert('Failed to save. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="record-results-page">
      <header className="page-header">
        <div>
          <h1>{editId ? 'Edit Assessment' : 'Record Test Results'}</h1>
          <p className="subtitle">{editId ? 'Modify previously recorded scores' : 'Enter assessment scores for your class'}</p>
        </div>
        <button 
          className="btn-primary flex items-center gap-2" 
          onClick={handleSave} 
          disabled={!selectedClassId || !assessmentTitle || isSaving}
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save size={18} />
          )}
          {isSaving ? 'Saving...' : (editId ? 'Update Results' : 'Save Results')}
        </button>
      </header>

      <div className="content-grid">
        <div className="left-column">
          <div className="glass-panel config-panel">
            <ClassSelector 
              classes={myClasses} 
              selectedClassId={selectedClassId} 
              onSelectClass={(id) => {
                setSelectedClassId(id);
                setScores({}); // Reset scores on class change
              }} 
            />

            <div className="divider" />

            <div className="form-group">
              <label>
                <FileText size={16} />
                Assessment Title
              </label>
              <input 
                type="text" 
                value={assessmentTitle}
                onChange={e => setAssessmentTitle(e.target.value)}
                placeholder="e.g., Midterm Exam"
                className="input-field"
              />
            </div>

            <div className="form-group flex-1 min-w-[200px]">
              <label htmlFor="assessmentType" className="flex items-center gap-2 mb-2 font-medium text-slate-700">
                <Award size={16} className="text-purple-500" />
                Assessment Type
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="assessmentType"
                  className="form-input flex-1"
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                >
                  {assessmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md border border-slate-200 hover:border-blue-200 transition-colors"
                  title="Manage Assessment Types"
                >
                  <Settings size={20} />
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Calendar size={16} />
                  Date
                </label>
                <input 
                  type="date" 
                  value={assessmentDate}
                  onChange={e => setAssessmentDate(e.target.value)}
                  className="input-field"
                />
                {assessmentDate && (
                  <span className="text-sm font-medium text-blue-600 mt-1">
                    {getKoreanMonthWeek(assessmentDate)}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>
                <Award size={16} />
                Grading Mode
              </label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${gradingMode === 'Standard' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                  onClick={() => setGradingMode('Standard')}
                >
                  Standard
                </button>
                <button
                  className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${gradingMode === 'Rubric' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                  onClick={() => setGradingMode('Rubric')}
                >
                  Rubric (실기평가)
                </button>
              </div>
            </div>

            {gradingMode === 'Standard' && (
              <div className="form-group">
                <label>
                  <Hash size={16} />
                  Max Score
                </label>
                <input 
                  type="number" 
                  value={maxScore} 
                  onChange={(e) => setMaxScore(e.target.value === "" ? "" : Number(e.target.value))}
                  onFocus={() => maxScore === 0 && setMaxScore("")}
                  min="1"
                  className="input-field"
                />
              </div>
            )}
            
            {gradingMode === 'Rubric' && (
              <div className="form-group p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Rubric Grading Active</h4>
                    <p className="text-sm text-blue-700">Scores will be calculated automatically based on the selected rubric levels.</p>
                  </div>
                  <button 
                    onClick={() => setIsRubricBuilderOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm font-medium transition-colors border border-blue-200"
                  >
                    <Edit3 size={14} />
                    Edit Rubric
                  </button>
                </div>
                <div className="flex justify-between items-center bg-white px-3 py-2 rounded shadow-sm">
                  <span className="text-sm font-medium text-slate-600">Total Max Score</span>
                  <span className="font-bold text-blue-600">{calculatedMaxScore} pts</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="right-column">
          {selectedClassId ? (
            <div className="glass-panel">
              <h2 className="section-title">Student Roster</h2>
              <GradingTable 
                students={studentsInClass}
                scores={scores}
                onScoreChange={handleScoreChange}
                onNotesChange={handleNotesChange}
                onAbsentChange={handleAbsentChange}
                maxScore={calculatedMaxScore}
                gradingMode={gradingMode}
                rubric={rubric}
                onRubricScoreChange={handleRubricScoreChange}
              />
            </div>
          ) : (
            <div className="placeholder-panel glass-panel">
              <Users size={48} className="placeholder-icon" />
              <h3>No Class Selected</h3>
              <p>Please select a class from the left panel to begin entering scores.</p>
            </div>
          )}
        </div>
      </div>

      {/* Render the Settings Modal */}
      <AssessmentTypeSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* Render the Rubric Builder Modal */}
      <RubricBuilder 
        isOpen={isRubricBuilderOpen}
        onClose={() => setIsRubricBuilderOpen(false)}
        initialRubric={rubric}
        onSave={(newRubric) => setRubric(newRubric)}
      />
    </div>
  );
};


