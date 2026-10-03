import React, { useState, useEffect } from 'react';
import { DashboardStats, Student, ActivePage } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  Download,
  Printer,
  Building,
  GraduationCap,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ReportsPageProps {
  onNavigate: (page: ActivePage) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const { notify } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedDate, setGeneratedDate] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const res = await api.getReportsSummary();
        setStats(res.stats);
        setStudents(res.students);
        setGeneratedDate(new Date(res.generated_at).toLocaleString());
      } catch (err: any) {
        notify('error', err.message || 'Failed to generate reports');
      } finally {
        setIsLoading(false);
      }
    };
    loadReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!stats) return;

    const headers = ['Hostel Code', 'Hostel Name', 'Type', 'Capacity', 'Enrolled Students', 'Occupancy Rate (%)', 'Warden'];
    const rows = stats.hostelStats.map((h) => [
      `"${h.code}"`,
      `"${h.name}"`,
      `"${h.type}"`,
      h.capacity,
      h.student_count,
      `${h.occupancy_rate}%`,
      `"${h.warden_name}"`,
    ]);

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', `VNIT_Hostels_Occupancy_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('success', 'Hostel occupancy report exported to CSV!');
  };

  if (isLoading || !stats) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="h-10 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const totalCapacity = stats.hostelStats.reduce((sum, h) => sum + h.capacity, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header and Print/Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Hostel Reports
          </h2>
          <p className="text-xs text-slate-500">
            Official VNIT Nagpur hostel administration & occupancy dossier · Session 2026
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Official Header for Print & Web */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                Visvesvaraya National Institute of Technology, Nagpur
              </h1>
              <p className="text-xs text-slate-500">
                Council of Wardens · Hostel Student Allotment & Statistical Summary
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-500 font-mono">
            <div>Report Generated: {generatedDate || new Date().toLocaleDateString()}</div>
            <div className="text-indigo-600 font-semibold">Status: Official Verified Record</div>
          </div>
        </div>

        {/* 4 Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Records</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.totalStudents}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Operational Hostels</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.totalHostels}</div>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase">Active Residents</span>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-1">{stats.activeStudents}</div>
          </div>
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <span className="text-[11px] font-semibold text-indigo-800 uppercase">Total Bed Capacity</span>
            <div className="text-2xl font-black text-indigo-700 font-mono mt-1">{totalCapacity}</div>
          </div>
        </div>
      </div>

      {/* Table 1: Hostel-Wise Capacity & Warden Roster */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Hostel Residential Block Occupancy Matrix
          </h3>
          <p className="text-xs text-slate-500">Live seat utilization and warden jurisdiction</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Hostel Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Warden</th>
                <th className="py-2.5 px-3 text-right">Capacity</th>
                <th className="py-2.5 px-3 text-right">Occupied</th>
                <th className="py-2.5 px-3 text-right">Occupancy %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.hostelStats.map((h) => (
                <tr key={h.id}>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700">{h.code}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{h.name}</td>
                  <td className="py-3 px-3 text-slate-600">{h.type}</td>
                  <td className="py-3 px-3 text-slate-600">{h.warden_name}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-800">{h.capacity}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{h.student_count}</td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-indigo-700">
                    {h.occupancy_rate}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/80 font-bold border-t border-slate-200">
                <td colSpan={4} className="py-3 px-3 text-slate-900">Total Institutional Capacity</td>
                <td className="py-3 px-3 text-right font-mono text-slate-900">{totalCapacity}</td>
                <td className="py-3 px-3 text-right font-mono text-slate-900">{stats.activeStudents}</td>
                <td className="py-3 px-3 text-right font-mono text-indigo-700">
                  {totalCapacity > 0 ? Math.round((stats.activeStudents / totalCapacity) * 100) : 0}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Table 2: Departmental Roster Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Departmental Student Distribution
          </h3>
          <p className="text-xs text-slate-500">Hostel residency count across VNIT academic branches</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stats.branchStats.map((branch, idx) => {
            const share = stats.totalStudents > 0 ? Math.round((branch.count / stats.totalStudents) * 100) : 0;
            return (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-900 truncate max-w-[200px]">
                    {branch.branch}
                  </div>
                  <div className="text-[11px] text-slate-500">{share}% of total residents</div>
                </div>
                <div className="font-mono text-base font-extrabold text-indigo-700">
                  {branch.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
