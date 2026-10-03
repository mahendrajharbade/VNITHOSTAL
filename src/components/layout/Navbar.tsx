import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActivePage } from '../../types';
import {
  Menu,
  Database,
  User,
  LogOut,
  Search,
  Bell,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { DbStatusModal } from '../common/DbStatusModal';

interface NavbarProps {
  currentPage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  onToggleSidebar: () => void;
  onOpenQuickSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onToggleSidebar,
  onOpenQuickSearch,
}) => {
  const { admin, logout, systemStatus } = useAuth();
  const [showDbModal, setShowDbModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getPageTitle = (page: ActivePage): { title: string; subtitle: string } => {
    switch (page) {
      case 'dashboard':
        return { title: 'Executive Overview', subtitle: 'Hostel analytics and active allocations' };
      case 'add-student':
        return { title: 'New Student Registration', subtitle: 'Enroll and allot room in VNIT hostel' };
      case 'student-records':
        return { title: 'Student Records Directory', subtitle: 'Search, filter, update and manage students' };
      case 'student-profile':
        return { title: 'Student Profile Dossier', subtitle: 'Detailed institutional record and emergency contacts' };
      case 'search-student':
        return { title: 'Instant Student Lookup', subtitle: 'Search across roll numbers, names, rooms, and hostels' };
      case 'hostels':
        return { title: 'Hostel Blocks & Capacity', subtitle: 'Manage VNIT hostels, wardens, and occupancy' };
      case 'reports':
        return { title: 'Hostel Administrative Reports', subtitle: 'Departmental statistics and occupancy summaries' };
      case 'admin-profile':
        return { title: 'Administrator Profile', subtitle: 'System credentials, security, and database status' };
      default:
        return { title: 'VNIT Hostel Management', subtitle: 'Visvesvaraya National Institute of Technology' };
    }
  };

  const pageInfo = getPageTitle(currentPage);
  const isMySQL = systemStatus?.connectedToMySQL;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger + Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                {pageInfo.title}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                {pageInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Quick actions + DB status badge + Admin profile */}
          <div className="flex items-center gap-3">
            {/* Quick search button */}
            <button
              onClick={onOpenQuickSearch}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-colors"
              title="Quick Search (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search student...</span>
              <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* DB Status Button */}
            <button
              onClick={() => setShowDbModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isMySQL
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
              }`}
              title="Click to view database connection details"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isMySQL ? 'MySQL Connected' : 'Relational Engine'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isMySQL ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
            </button>

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {admin?.full_name ? admin.full_name.charAt(0) : 'A'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {admin?.full_name || 'Administrator'}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    {admin?.role || 'Admin'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{admin?.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{admin?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('admin-profile');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Admin Profile & Security
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowDbModal(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Database className="w-4 h-4 text-slate-400" />
                      Database Status
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <DbStatusModal isOpen={showDbModal} onClose={() => setShowDbModal(false)} />
    </>
  );
};
