import React, { useState, useEffect } from 'react';
import { Student, Hostel, ActivePage } from '../types';
import { api } from '../services/api';
import {
  Search,
  Users,
  Building,
  GraduationCap,
  ArrowRight,
  Phone,
  Mail,
  User,
  Sparkles,
  X,
  FileQuestion,
} from 'lucide-react';

interface SearchStudentPageProps {
  onNavigate: (page: ActivePage) => void;
  onSelectStudent: (studentId: number) => void;
}

export const SearchStudentPage: React.FC<SearchStudentPageProps> = ({
  onNavigate,
  onSelectStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostel, setSelectedHostel] = useState<string>('all');
  const [results, setResults] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    api.getHostels().then(setHostels).catch(console.error);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim() && selectedHostel === 'all') {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const handler = setTimeout(async () => {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const res = await api.getStudents({
          search: searchTerm.trim(),
          hostel_id: selectedHostel !== 'all' ? selectedHostel : undefined,
          limit: 50,
          sortBy: 'full_name',
          sortOrder: 'asc',
        });
        setResults(res.data);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [searchTerm, selectedHostel]);

  const quickSearchPresets = [
    { label: 'Hostel 1 (Mega Boys)', action: () => setSelectedHostel('1') },
    { label: 'Hostel 4 (Girls Hostel)', action: () => setSelectedHostel('4') },
    { label: 'Computer Science', action: () => setSearchTerm('Computer Science') },
    { label: 'Mechanical', action: () => setSearchTerm('Mechanical') },
    { label: 'B.Tech', action: () => setSearchTerm('B.Tech') },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Instant Student Record Lookup
        </h2>
        <p className="text-xs text-slate-500">
          Search across Roll Number, Name, Allotted Room, Email, Phone, or Hostel Block
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-indigo-500" />
            </div>
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter Roll No (e.g. BT22CSE018), Name, Room (e.g. A-204), or Phone..."
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="w-full py-3 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Search All Hostels (1–5)</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.code} · {h.name.split('(')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Quick Filters:</span>
          {quickSearchPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={preset.action}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {preset.label}
            </button>
          ))}
          {(searchTerm || selectedHostel !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedHostel('all');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold ml-2 underline underline-offset-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results View */}
      <div>
        {isLoading ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200/80 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Searching student records...</p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No matching student records</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any student matching "{searchTerm}". Check the roll number or spelling.
            </p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 text-xs text-slate-500">
              <span>Found {results.length} matching student{results.length === 1 ? '' : 's'}</span>
              <span>Click any card to inspect full profile dossier</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((student) => (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student.id)}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {student.roll_number}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mt-1">
                        {student.full_name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {student.course} · {student.branch}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-800 font-mono block">
                        Rm #{student.room_number}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                        {student.hostel_name || `Hostel ${student.hostel_id}`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {student.mobile_number}
                    </span>
                    <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 bg-white rounded-2xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Quick Student Lookup Ready</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Type a roll number, student name, department, or select a hostel block above to quickly locate and view student records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
