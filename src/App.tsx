// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ClassRoster from './pages/ClassRoster';
import { RecordResults } from './pages/RecordResults';
import { Dashboard } from './pages/Dashboard';
import AssessmentsList from './pages/AssessmentsList';
import AllStudents from './pages/AllStudents';
import StudentProfile from './pages/StudentProfile';
import Migration from './pages/Migration';
import { AppProvider, useAppContext } from './context/AppContext';

function AppContent() {
  const { classes, isLoading, error } = useAppContext();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
          <h2 className="text-lg font-bold mb-2">Error loading data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assessments" element={<AssessmentsList />} />
          <Route path="/students" element={<AllStudents />} />
          <Route path="/student/:studentId" element={<StudentProfile />} />
          <Route path="/record-results" element={<RecordResults />} />
          <Route path="/migrate-ids" element={<Migration />} />

          {/* Dynamically create routes for all classes in Context */}
          {classes.map(cls => (
            <Route 
              key={cls.id} 
              path={`/class/${cls.id}`} 
              element={<ClassRoster classGroup={cls} />} 
            />
          ))}
        </Routes>
      </MainLayout>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;