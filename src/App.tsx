import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActivePage } from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/common/Toast';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AddStudentPage } from './pages/AddStudentPage';
import { StudentRecordsPage } from './pages/StudentRecordsPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { SearchStudentPage } from './pages/SearchStudentPage';
import { HostelsPage } from './pages/HostelsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminProfilePage } from './pages/AdminProfilePage';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<ActivePage>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | string | null>(null);
  const [editStudentId, setEditStudentId] = useState<number | string | null>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K opens quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCurrentPage('search-student');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold font-mono">
          VNIT Hostel System Loading...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toast />
      </>
    );
  }

  const navigateTo = (page: ActivePage) => {
    if (page !== 'add-student') {
      setEditStudentId(null);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStudent = (studentId: number | string) => {
    setSelectedStudentId(studentId);
    setCurrentPage('student-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditStudent = (studentId: number | string) => {
    setEditStudentId(studentId);
    setCurrentPage('add-student');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterByHostel = (hostelId: number | string) => {
    setCurrentPage('student-records');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigateTo}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          currentPage={currentPage}
          onNavigate={navigateTo}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenQuickSearch={() => setCurrentPage('search-student')}
        />

        <main className="flex-1 pb-16">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={navigateTo}
              onSelectStudent={handleSelectStudent}
            />
          )}

          {currentPage === 'add-student' && (
            <AddStudentPage
              onNavigate={navigateTo}
              editStudentId={editStudentId}
              onStudentSaved={(id) => handleSelectStudent(id)}
            />
          )}

          {currentPage === 'student-records' && (
            <StudentRecordsPage
              onNavigate={navigateTo}
              onSelectStudent={handleSelectStudent}
              onEditStudent={handleEditStudent}
            />
          )}

          {currentPage === 'student-profile' && selectedStudentId && (
            <StudentProfilePage
              studentId={selectedStudentId}
              onNavigate={navigateTo}
              onEditStudent={handleEditStudent}
            />
          )}

          {currentPage === 'search-student' && (
            <SearchStudentPage
              onNavigate={navigateTo}
              onSelectStudent={handleSelectStudent}
            />
          )}

          {currentPage === 'hostels' && (
            <HostelsPage
              onNavigate={navigateTo}
              onFilterByHostel={handleFilterByHostel}
            />
          )}

          {currentPage === 'reports' && (
            <ReportsPage onNavigate={navigateTo} />
          )}

          {currentPage === 'admin-profile' && (
            <AdminProfilePage />
          )}
        </main>
      </div>

      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
