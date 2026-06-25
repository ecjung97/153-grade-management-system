import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Award, Calendar, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { students, assessments } = useAppContext();

  const student = students.find(s => s.id === studentId);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <User size={48} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-bold mb-2">Student Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  // Map student's scores to include assessment details
  const studentScores = (student.scores || []).map(score => {
    // Note: AppContext pushes score with assessmentId, so we use any to access it safely based on the context implementation
    const assessmentId = (score as any).assessmentId;
    const assessment = assessments.find(a => a.id === assessmentId);
    return {
      ...score,
      assessmentTitle: assessment?.title || 'Unknown Assessment',
      assessmentType: assessment?.type || 'Unknown Type',
      gradingMode: assessment?.gradingMode || 'Standard',
      rubric: assessment?.rubric
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-start gap-6">
          <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-6 rounded-full text-indigo-600">
            <User size={48} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {student.lastName} {student.firstName}
            </h1>
            <div className="flex gap-4 text-slate-500 font-medium">
              <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">
                {student.gradeLevel}
              </span>
              <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">
                ID: {student.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Award className="text-emerald-500" />
          Academic Record
        </h2>

        {studentScores.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <FileText size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">No recorded assessments yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Assessment</th>
                    <th className="px-6 py-4 font-semibold">Score</th>
                    <th className="px-6 py-4 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentScores.map((score, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-slate-400" />
                          {score.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-medium">
                          {score.assessmentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {score.assessmentTitle}
                      </td>
                      <td className="px-6 py-4">
                        {score.isAbsent ? (
                          <span className="text-red-500 font-semibold bg-red-50 px-2 py-1 rounded text-sm whitespace-nowrap">
                            Absent
                          </span>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-900 whitespace-nowrap">
                              {score.value} <span className="text-slate-400 text-sm font-normal">/ {(score as any).maxScore}</span>
                            </span>
                            {score.gradingMode === 'Rubric' && score.rubricScores && score.rubric && (
                              <div className="mt-2 space-y-1 min-w-[150px]">
                                {score.rubric.map((crit: any) => (
                                  <div key={crit.id} className="flex justify-between text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                                    <span className="truncate w-32" title={crit.name}>{crit.name}</span>
                                    <span className="font-medium text-slate-700">{score.rubricScores?.[crit.id] || 0} pts</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate">
                        {score.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
