import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit2, TrendingUp, Plus, Trash2, X } from 'lucide-react';
import type { Student, ClassGroup } from '../types';
import { useAppContext } from '../context/AppContext';
import { addStudentToClass, removeStudentFromClass } from '../services/db';

const getGradeDisplay = (average: number | 'N/A') => {
    if (average === 'N/A') return { label: 'N/A (해당사항 없음)', color: 'bg-slate-100 text-slate-600' };
    if (average >= 90) return { label: `E (매우 잘함)`, color: 'bg-green-100 text-green-800' };
    if (average >= 80) return { label: `G (잘함)`, color: 'bg-blue-100 text-blue-800' };
    if (average >= 70) return { label: `S (보통)`, color: 'bg-yellow-100 text-yellow-800' };
    return { label: `N (노력 요함)`, color: 'bg-red-100 text-red-800' };
};

interface ClassRosterProps {
    classGroup: ClassGroup;
}

export default function ClassRoster({ classGroup }: ClassRosterProps) {
    const { students, refreshData } = useAppContext();
    const navigate = useNavigate();
    const studentsToDisplay = students.filter(s => classGroup.studentIds.includes(s.id));
    
    const [isAdding, setIsAdding] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAddStudent = async () => {
        if (!newStudentName.trim()) return;
        setIsSaving(true);
        try {
            await addStudentToClass(classGroup.id, newStudentName.trim(), classGroup.gradeLevel || "Other");
            setNewStudentName('');
            setIsAdding(false);
            await refreshData();
        } catch (err) {
            console.error("Failed to add student", err);
            alert("Failed to add student. Check console.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveStudent = async (studentId: string, studentName: string) => {
        if (!window.confirm(`Are you sure you want to remove ${studentName} from this class?`)) return;
        try {
            await removeStudentFromClass(classGroup.id, studentId);
            await refreshData();
        } catch (err) {
            console.error("Failed to remove student", err);
            alert("Failed to remove student. Check console.");
        }
    };

    // A simple helper to calculate the average score for the UI
    const calculateAverage = (scores?: any[], classId?: string) => {
        if (!scores || scores.length === 0) return 'N/A';
        
        // Filter by class and exclude absent records
        const classScores = scores.filter(s => 
            (classId ? s.classId === classId : true) && !s.isAbsent
        );
        
        if (classScores.length === 0) return 'N/A';
    
        const totalValue = classScores.reduce((sum, score) => sum + (score.value || 0), 0);
        const totalMax = classScores.reduce((sum, score) => sum + (score.maxScore || 100), 0);
        return Math.round((totalValue / totalMax) * 100);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{classGroup.name} Roster</h1>
                    <p className="text-slate-500">Manage students and view overall progress</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 text-sm text-white font-medium bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
                    >
                        <Plus size={16} />
                        <span>Add Student</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md transition-colors">
                        <TrendingUp size={16} />
                        <span>Export to Excel</span>
                    </button>
                </div>
            </div>

            {/* Add Student Form */}
            {isAdding && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap gap-4 items-end mb-6">
                    <div className="flex-1 min-w-[200px] max-w-sm">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Student Name *</label>
                        <input 
                            type="text" 
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="e.g., 홍길동"
                            value={newStudentName}
                            onChange={(e) => setNewStudentName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                        <button 
                            onClick={handleAddStudent}
                            disabled={!newStudentName.trim() || isSaving}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                            onClick={() => { setIsAdding(false); setNewStudentName(''); }}
                            disabled={isSaving}
                            className="text-slate-500 hover:bg-slate-200 px-3 py-2 rounded-md transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Data Table Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Student Name</th>
                            <th className="px-6 py-4 font-semibold">Current Average</th>
                            <th className="px-6 py-4 font-semibold">Assessments Taken</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {studentsToDisplay.map((student) => {
                            const average = calculateAverage(student.scores, classGroup.id);
                            // Count only records where the student was actually present
                            const classRecordsCount = student.scores?.filter(s => s.classId === classGroup.id && !s.isAbsent).length || 0;

                            return (
                                <tr 
                                    key={student.id} 
                                    onClick={() => navigate(`/student/${student.id}`)}
                                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors inline-block">
                                            {student.lastName} {student.firstName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const { label, color } = getGradeDisplay(average);
                                            return (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${color}`}>
                                                    {label} {typeof average === 'number' && <span className="ml-1 opacity-75 text-xs">({average}%)</span>}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {classRecordsCount} Records
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-slate-400">
                                            <button 
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                                                title="Edit Profile"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveStudent(student.id, student.firstName);
                                                }}
                                                className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                                                title="Remove from Class"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}