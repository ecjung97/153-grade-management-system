import { BookOpen, Users, Award, Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, classes, assessments } = useAppContext();
  
  // Filter classes taught by the current user
  const myClasses = classes.filter(c => c.teacherId === currentUser?.id);
  
  // Calculate total students across all his classes
  const totalStudents = myClasses.reduce((sum, cls) => sum + cls.studentIds.length, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {currentUser?.name} - {currentUser?.englishName}!</h1>
        <p className="text-blue-100">Here's an overview of your classes and recent activities.</p>
      </div>

      {/* Stats and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => document.getElementById('my-subjects')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="bg-blue-100 p-4 rounded-lg text-blue-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Classes</p>
            <p className="text-2xl font-bold text-slate-900">{myClasses.length}</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/students')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="bg-indigo-100 p-4 rounded-lg text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Students</p>
            <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/assessments')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all"
        >
          <div className="bg-emerald-100 p-4 rounded-lg text-emerald-600">
            <Award size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Recorded Assessments</p>
            <p className="text-2xl font-bold text-slate-900">{assessments.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="flex justify-end gap-4">
        <button 
          onClick={() => navigate('/record-results')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Record New Assessment</span>
        </button>
      </div>

      {/* Classes Overview */}
      <div>
        <h2 id="my-subjects" className="text-xl font-bold text-slate-900 mb-4 scroll-mt-6">My Subjects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myClasses.map(cls => (
            <div key={cls.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-600">
                    {cls.gradeLevel}
                  </div>
                  <Users size={18} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{cls.name}</h3>
                <p className="text-slate-500 text-sm mb-6">{cls.studentIds.length} Students</p>
                
                <button 
                  onClick={() => navigate(`/class/${cls.id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors border border-slate-200"
                >
                  <span>View Roster</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
