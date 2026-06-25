import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { updateTeacherAssessmentTypes, batchUpdateAssessmentTypes } from '../services/db';
import { X, Plus, Edit2, Trash2, Check } from 'lucide-react';

interface AssessmentTypeSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AssessmentTypeSettings: React.FC<AssessmentTypeSettingsProps> = ({ isOpen, onClose }) => {
    const { currentUser, assessmentTypes, refreshData } = useAppContext();
    const [newType, setNewType] = useState('');
    const [editingType, setEditingType] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !currentUser) return null;

    const handleAdd = async () => {
        if (!newType.trim() || assessmentTypes.includes(newType.trim())) return;
        setIsSaving(true);
        try {
            const updatedTypes = [...assessmentTypes, newType.trim()];
            await updateTeacherAssessmentTypes(currentUser.id, updatedTypes);
            await refreshData();
            setNewType('');
        } catch (err) {
            console.error(err);
            alert("Failed to add type.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemove = async (typeToRemove: string) => {
        if (!window.confirm(`Remove "${typeToRemove}" from your assessment types?`)) return;
        setIsSaving(true);
        try {
            const updatedTypes = assessmentTypes.filter(t => t !== typeToRemove);
            await updateTeacherAssessmentTypes(currentUser.id, updatedTypes);
            await refreshData();
        } catch (err) {
            console.error(err);
            alert("Failed to remove type.");
        } finally {
            setIsSaving(false);
        }
    };

    const startEditing = (type: string) => {
        setEditingType(type);
        setEditValue(type);
    };

    const saveEdit = async (oldType: string) => {
        const trimmedNew = editValue.trim();
        if (!trimmedNew || trimmedNew === oldType || assessmentTypes.includes(trimmedNew)) {
            setEditingType(null);
            return;
        }

        setIsSaving(true);
        try {
            // Update the array
            const updatedTypes = assessmentTypes.map(t => t === oldType ? trimmedNew : t);
            await updateTeacherAssessmentTypes(currentUser.id, updatedTypes);
            
            // Batch update existing assessments
            await batchUpdateAssessmentTypes(currentUser.id, oldType, trimmedNew);
            
            await refreshData();
            setEditingType(null);
        } catch (err) {
            console.error(err);
            alert("Failed to modify type.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Manage Assessment Types</h2>
                        <p className="text-sm text-slate-500">Add, rename, or remove types.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-5 space-y-4">
                    {/* Add New Type */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add new type (e.g. Pop Quiz)"
                            value={newType}
                            onChange={e => setNewType(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            disabled={isSaving}
                            className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        <button 
                            onClick={handleAdd}
                            disabled={!newType.trim() || isSaving}
                            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Type List */}
                    <div className="space-y-2 mt-4 max-h-64 overflow-y-auto pr-1">
                        {assessmentTypes.map((type) => (
                            <div key={type} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg group">
                                {editingType === type ? (
                                    <div className="flex flex-1 gap-2 mr-2">
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && saveEdit(type)}
                                            disabled={isSaving}
                                            className="flex-1 rounded border-slate-300 py-1 px-2 text-sm"
                                            autoFocus
                                        />
                                        <button 
                                            onClick={() => saveEdit(type)}
                                            disabled={isSaving}
                                            className="text-green-600 p-1 hover:bg-green-50 rounded"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button 
                                            onClick={() => setEditingType(null)}
                                            disabled={isSaving}
                                            className="text-slate-400 p-1 hover:bg-slate-200 rounded"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="font-medium text-slate-700">{type}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => startEditing(type)}
                                                disabled={isSaving}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleRemove(type)}
                                                disabled={isSaving}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
