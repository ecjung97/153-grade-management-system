import { Users, User, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useState, useMemo } from 'react';

export default function AllStudents() {
  const navigate = useNavigate();
  const { currentUser, classes, students } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique student IDs from classes taught by current user
  const myClasses = classes.filter(c => c.teacherId === currentUser?.id);
  const myStudentIds = new Set(myClasses.flatMap(c => c.studentIds));

  // Filter students to only those taught by the user
  const myStudents = students.filter(s => myStudentIds.has(s.id));

  // Filter by search term
  const filteredStudents = myStudents.filter(s => 
    `${s.lastName}${s.firstName}`.toLowerCase().includes(searchTerm.toLowerCase().replace(/\s/g, '')) ||
    s.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by grade
  const groupedStudents = useMemo(() => {
    const groups: Record<string, typeof students> = {};
    filteredStudents.forEach(student => {
      if (!groups[student.gradeLevel]) {
        groups[student.gradeLevel] = [];
      }
      groups[student.gradeLevel].push(student);
    });
    return groups;
  }, [filteredStudents]);

  // Sort grades (e.g., 3rd Grade, 4th Grade...)
  const sortedGrades = Object.keys(groupedStudents).sort();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-500 hover:text-slate-700 transition-colors mb-2"
          >
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="text-indigo-600" size={32} />
            My Students
          </h1>
          <p className="text-slate-500 mt-1">Overview of all students across your classes grouped by grade.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative shadow-sm rounded-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search students by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700"
        />
      </div>

      {/* Students by Grade */}
      <div className="space-y-6">
        {sortedGrades.map(grade => (
          <div key={grade} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {grade}
              </h2>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                {groupedStudents[grade].length} Students
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
              {groupedStudents[grade].map(student => (
                <div 
                  key={student.id} 
                  onClick={() => navigate(`/student/${student.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white cursor-pointer"
                >
                  <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-2.5 rounded-full text-indigo-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{student.lastName} {student.firstName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {sortedGrades.length === 0 && (
          <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <Users size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-600">No students found.</p>
            <p className="text-sm mt-1">Try adjusting your search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
