import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Award, Hash, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const getEGSGrade = (score: number | '', maxScore: number): { letter: string, color: string } | null => {
  if (score === '' || !maxScore) return null;
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return { letter: 'E', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  if (percentage >= 80) return { letter: 'G', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  return { letter: 'S', color: 'bg-orange-100 text-orange-800 border-orange-200' };
};

export default function AssessmentDetails() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { assessments, classes, students } = useAppContext();

  const assessment = assessments.find(a => a.id === assessmentId);
  
  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <BookOpen size={48} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-bold mb-2">Assessment Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const classGroup = classes.find(c => c.id === assessment.classId);
  const classStudents = students.filter(s => classGroup?.studentIds.includes(s.id));

  const gradingMode = assessment.gradingMode || 'Standard';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Assessments
        </button>
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-start justify-between gap-6">
          <div className="flex gap-6">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 rounded-xl text-blue-600">
              <BookOpen size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {assessment.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-sm">
                  <Calendar size={14} />
                  {assessment.date}
                </span>
                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-sm">
                  <BookOpen size={14} />
                  {classGroup?.name || 'Unknown Class'}
                </span>
                <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-full text-sm">
                  <Award size={14} />
                  {assessment.type}
                </span>
                {gradingMode === 'Homework' ? (
                  <span className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-sm">
                    <CheckCircle2 size={14} />
                    Homework
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-sm">
                    <Hash size={14} />
                    Max Score: {assessment.maxScore}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate(`/record-results?edit=${assessment.id}`)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Edit Grades
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Student Results</h2>
          <span className="text-sm font-medium text-slate-500">{classStudents.length} Students</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Score / Status</th>
                <th className="px-6 py-4 font-semibold w-1/2">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((student) => {
                const result = (assessment.results as any)[student.id] || { value: '', notes: '' };
                const isAbsent = !!result.isAbsent;
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{student.lastName} {student.firstName}</div>
                      <div className="text-xs text-slate-500">{student.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      {isAbsent ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Absent
                        </span>
                      ) : (
                        gradingMode === 'Homework' ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            result.value === 2 ? 'bg-green-50 text-green-700 border-green-200' :
                            result.value === 1 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {result.value === 2 ? '🟢 Done' : result.value === 1 ? '🟡 Partial' : '🔴 Not Done'}
                          </span>
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-900 text-base">
                                {result.value !== '' ? result.value : '-'}
                                <span className="text-slate-400 text-sm font-normal ml-1">/ {assessment.maxScore}</span>
                              </span>
                              {(() => {
                                const egs = getEGSGrade(result.value, assessment.maxScore);
                                return egs ? (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${egs.color}`} title={egs.letter === 'E' ? 'Excellent (≥90%)' : egs.letter === 'G' ? 'Good (≥80%)' : 'Satisfactory (<80%)'}>
                                    {egs.letter}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                            {gradingMode === 'Rubric' && result.rubricScores && assessment.rubric && (
                              <div className="mt-1.5 space-y-1">
                                {assessment.rubric.map((crit: any) => (
                                  <div key={crit.id} className="flex justify-between items-center text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                                    <span className="mr-3">{crit.name}</span>
                                    <span className="font-medium text-slate-700">{result.rubricScores?.[crit.id] || 0} pts</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-normal">
                      {result.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
