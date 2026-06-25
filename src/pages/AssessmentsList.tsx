import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { deleteAssessment } from '../services/db';
import { Edit2, Trash2, Calendar, BookOpen, Award, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AssessmentsList() {
    const { assessments, classes, assessmentTypes, refreshData, currentUser } = useAppContext();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterClass, setFilterClass] = useState('All');
    const [filterType, setFilterType] = useState('All');

    const myClasses = classes.filter(c => c.teacherId === currentUser?.id);

    // Filter and sort assessments
    const filteredAssessments = [...assessments]
        .filter(a => {
            const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesClass = filterClass === 'All' || a.classId === filterClass;
            const matchesType = filterType === 'All' || a.type === filterType;
            return matchesSearch && matchesClass && matchesType;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to permanently delete the assessment "${title}"? This cannot be undone.`)) return;
        
        try {
            await deleteAssessment(id);
            await refreshData();
        } catch (err) {
            console.error("Failed to delete assessment", err);
            alert("Failed to delete. Check console for details.");
        }
    };

    const getClassName = (classId: string) => {
        return classes.find(c => c.id === classId)?.name || 'Unknown Class';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Assessment History</h1>
                    <p className="text-slate-500">Review, edit, or delete past recorded assessments</p>
                </div>
                <button 
                    onClick={() => navigate('/record-results')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                >
                    + Record New
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                        <Search size={14} className="text-slate-400"/> Search Title
                    </label>
                    <input 
                        type="text"
                        placeholder="e.g. Midterm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-slate-400"/> Filter by Class
                    </label>
                    <select
                        value={filterClass}
                        onChange={e => setFilterClass(e.target.value)}
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                        <option value="All">All Classes</option>
                        {myClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full sm:w-48">
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                        <Filter size={14} className="text-slate-400"/> Filter by Type
                    </label>
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                        <option value="All">All Types</option>
                        {assessmentTypes.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Assessment Title</th>
                            <th className="px-6 py-4 font-semibold">Class</th>
                            <th className="px-6 py-4 font-semibold">Type</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredAssessments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    No assessments found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            filteredAssessments.map((assessment) => (
                                <tr key={assessment.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar size={14} className="text-slate-400" />
                                            {assessment.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{assessment.title}</div>
                                        <div className="text-xs text-slate-500">Max Score: {assessment.maxScore}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <BookOpen size={14} className="text-blue-500" />
                                            {getClassName(assessment.classId)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                            <Award size={12} />
                                            {assessment.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-slate-400">
                                            <button 
                                                onClick={() => navigate(`/record-results?edit=${assessment.id}`)}
                                                className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                                                title="Edit Assessment"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(assessment.id, assessment.title)}
                                                className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                                                title="Delete Assessment"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
