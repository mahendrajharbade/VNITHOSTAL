import React, { useState, useEffect } from 'react';
import { DashboardStats, ActivePage, Student } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Building,
  UserCheck,
  UserPlus,
  ArrowRight,
  Shield,
  Search,
  BedDouble,
  GraduationCap,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: ActivePage) => void;
  onSelectStudent: (studentId: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectStudent,
}) => {
  const { admin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
        <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl">
          <p className="text-sm font-semibold text-rose-800 mb-3">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalCapacity = stats.hostelStats.reduce((sum, h) => sum + h.capacity, 0);
  const overallOccupancy = totalCapacity > 0 ? Math.round((stats.activeStudents / totalCapacity) * 100) : 0;
  const availableBeds = Math.max(0, totalCapacity - stats.activeStudents);

  // If logged in as specific hostel warden, filter or highlight their hostel
  const assignedHostel = admin?.hostel_id
    ? stats.hostelStats.find((h) => h.id === admin.hostel_id)
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto font-sans">
      {/* Simple, Clean Header Banner with Campus Backdrop */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-slate-900 text-white p-6 sm:p-8">
        {/* Subtle Campus Collage Background */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="/src/assets/images/vnit_college_campus_1791039388075.jpg"
            alt="VNIT Campus"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/80 z-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>
                {assignedHostel ? `${assignedHostel.name} · Warden Desk` : 'VNIT Nagpur · Central Hostel Portal'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {admin?.full_name?.split(' ')[0] || 'Admin'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {assignedHostel
                ? `Managing room allocations and student residency for ${assignedHostel.code}.`
                : 'Simple overview of student enrollments, room allotments, and capacity across all 5 VNIT hostels.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onNavigate('add-student')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
            <button
              onClick={() => onNavigate('search-student')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/15 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <button
              onClick={fetchStats}
              className="p-2.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl text-xs transition-colors border border-white/10"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Simple, Bold Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Enrolled
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {stats.totalStudents}
            </div>
            <div className="text-xs text-slate-500 mt-1">student records in system</div>
          </div>
        </div>

        {/* Active Residents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Residents
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {stats.activeStudents}
            </div>
            <div className="text-xs text-slate-500 mt-1">currently occupying rooms</div>
          </div>
        </div>

        {/* Total Bed Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Capacity
            </span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {totalCapacity}
            </div>
            <div className="text-xs text-slate-500 mt-1">{stats.totalHostels} hostel blocks</div>
          </div>
        </div>

        {/* Occupancy % */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Occupancy Rate
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono">
              {overallOccupancy}%
            </div>
            <div className="text-xs text-slate-500 mt-1">{availableBeds} beds available</div>
          </div>
        </div>
      </div>

      {/* Simple 5 Hostels Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Hostels Status & Capacity</h2>
            <p className="text-xs text-slate-500">Live room occupancy across the 5 VNIT hostels</p>
          </div>
          <button
            onClick={() => onNavigate('hostels')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Manage All Hostels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {stats.hostelStats.map((hostel) => {
            const isAssigned = admin?.hostel_id === hostel.id;
            return (
              <div
                key={hostel.id}
                onClick={() => onNavigate('student-records')}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-xs flex flex-col justify-between space-y-3 ${
                  isAssigned
                    ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {hostel.code}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{hostel.type}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">
                    {hostel.name.split('(')[0]}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    Warden: {hostel.warden_name.split(' ')[1] || hostel.warden_name}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Occupied:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {hostel.student_count} / {hostel.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${Math.max(6, hostel.occupancy_rate)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple Recent Students Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recently Enrolled Students</h2>
            <p className="text-xs text-slate-500">Latest hostel student admissions</p>
          </div>
          <button
            onClick={() => onNavigate('student-records')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Roll Number</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Hostel & Room</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentStudents.slice(0, 5).map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                    {student.roll_number}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {student.full_name}
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    <span>{student.hostel_name?.split('(')[0] || `Hostel ${student.hostel_id}`}</span>
                    <span className="mx-1 text-slate-300">·</span>
                    <span className="font-mono font-bold text-slate-800">Rm {student.room_number}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap truncate max-w-[180px]">
                    {student.branch}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      student.status === 'Active' ? 'text-emerald-700' : 'text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        student.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} />
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectStudent(student.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                    >
                      Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
