import React from 'react';
import { ActivePage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Search,
  Building,
  BarChart3,
  UserCheck,
  LogOut,
  X,
  GraduationCap,
  Database,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  currentPage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const { admin, logout, systemStatus } = useAuth();

  const navItems = [
    { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-student' as ActivePage, label: 'Add Student', icon: UserPlus },
    { id: 'student-records' as ActivePage, label: 'Student Records', icon: Users },
    { id: 'search-student' as ActivePage, label: 'Search Student', icon: Search },
    { id: 'hostels' as ActivePage, label: 'Hostels', icon: Building },
    { id: 'reports' as ActivePage, label: 'Reports', icon: BarChart3 },
    { id: 'admin-profile' as ActivePage, label: 'Admin Profile', icon: UserCheck },
  ];

  const handleNavClick = (page: ActivePage) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide uppercase">
                VNIT Nagpur
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Hostel Records System
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Institution Info Banner */}
        <div className="px-4 py-2.5 bg-slate-800/60 text-[11px] text-slate-300 border-b border-slate-800/80 flex items-center justify-between">
          <span className="truncate">{admin?.role || 'Central Administration'}</span>
          <span className="font-mono text-indigo-400 shrink-0 text-[10px] ml-1 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
            {admin?.hostel_id ? `Hostel ${admin.hostel_id}` : 'Hostels 1–5'}
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom System & Logout Section */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {/* Quick DB Info card */}
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                Database Engine
              </span>
              <span className={`w-2 h-2 rounded-full ${systemStatus?.connectedToMySQL ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            </div>
            <div className="mt-1 text-slate-400 font-mono text-[10px] truncate">
              {systemStatus?.connectedToMySQL ? 'MySQL 8.0: vnit_hostel_db' : 'Built-in Relational Store'}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
};
