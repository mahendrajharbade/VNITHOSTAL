import React, { useState, useEffect, useCallback } from 'react';
import { Student, Hostel, Pagination, ActivePage } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Building,
  GraduationCap,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface StudentRecordsPageProps {
  onNavigate: (page: ActivePage) => void;
  onSelectStudent: (studentId: number | string) => void;
  onEditStudent: (studentId: number | string) => void;
}

const BRANCH_OPTIONS = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Metallurgical & Materials Engineering',
  'Mining Engineering',
  'Architecture & Planning',
];

const SEMESTER_OPTIONS = [
  '1st Year / Sem 1',
  '1st Year / Sem 2',
  '2nd Year / Sem 3',
  '2nd Year / Sem 4',
  '3rd Year / Sem 5',
  '3rd Year / Sem 6',
  '4th Year / Sem 7',
  '4th Year / Sem 8',
];

export const StudentRecordsPage: React.FC<StudentRecordsPageProps> = ({
  onNavigate,
  onSelectStudent,
  onEditStudent,
}) => {
  const { notify } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHostel, setSelectedHostel] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Hostels list
  useEffect(() => {
    api.getHostels().then(setHostels).catch(console.error);
  }, []);

  // Fetch Students with Debounce / Params
  const fetchStudents = useCallback(async (pageToLoad = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.getStudents({
        page: pageToLoad,
        limit: pagination.limit,
        search: searchQuery.trim(),
        hostel_id: selectedHostel !== 'all' ? selectedHostel : undefined,
        branch: selectedBranch !== 'all' ? selectedBranch : undefined,
        year_semester: selectedYear !== 'all' ? selectedYear : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        sortBy,
        sortOrder,
      });

      setStudents(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student records');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedHostel, selectedBranch, selectedYear, selectedStatus, sortBy, sortOrder, pagination.limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchStudents(newPage);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedHostel('all');
    setSelectedBranch('all');
    setSelectedYear('all');
    setSelectedStatus('all');
    setSortBy('id');
    setSortOrder('desc');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedHostel !== 'all' ||
    selectedBranch !== 'all' ||
    selectedYear !== 'all' ||
    selectedStatus !== 'all';

  const confirmDelete = (student: Student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteStudent(studentToDelete.id);
      notify('success', `Student ${studentToDelete.full_name} (${studentToDelete.roll_number}) deleted.`);
      setDeleteModalOpen(false);
      setStudentToDelete(null);
      fetchStudents(pagination.page);
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (students.length === 0) {
      notify('info', 'No records to export.');
      return;
    }

    const headers = [
      'Roll Number',
      'Full Name',
      "Father's Name",
      "Mother's Name",
      'DOB',
      'Gender',
      'Mobile',
      'Email',
      'Course',
      'Branch',
      'Year/Sem',
      'Hostel',
      'Room No',
      'Admission Date',
      'Status',
      'Emergency Contact',
      'Emergency Phone',
    ];

    const rows = students.map((s) => [
      `"${s.roll_number}"`,
      `"${s.full_name}"`,
      `"${s.father_name}"`,
      `"${s.mother_name}"`,
      `"${s.date_of_birth}"`,
      `"${s.gender}"`,
      `"${s.mobile_number}"`,
      `"${s.email}"`,
      `"${s.course}"`,
      `"${s.branch}"`,
      `"${s.year_semester}"`,
      `"${s.hostel_name || s.hostel_id}"`,
      `"${s.room_number}"`,
      `"${s.admission_date}"`,
      `"${s.status}"`,
      `"${s.emergency_contact_name}"`,
      `"${s.emergency_contact_number}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VNIT_Hostel_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify('success', 'Student records exported to CSV successfully!');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Student Records Directory
          </h2>
          <p className="text-xs text-slate-500">
            Total {pagination.total} registered student{pagination.total === 1 ? '' : 's'} across VNIT hostels
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-2"
            title="Download CSV Spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => onNavigate('add-student')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Container */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Roll Number (e.g. BT22CSE018), Student Name, Email, Room, or Phone..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* Hostel Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Hostel Block
            </label>
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Hostels (1–5)</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.code} - {h.name.split('(')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Branch / Department
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Departments</option>
              {BRANCH_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Year / Semester Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Year / Semester
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Semesters</option>
              {SEMESTER_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Resident Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Resident</option>
              <option value="Inactive">Inactive / Vacated</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Order By
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="id-desc">Latest Registered</option>
              <option value="roll_number-asc">Roll Number (A–Z)</option>
              <option value="full_name-asc">Student Name (A–Z)</option>
              <option value="admission_date-desc">Admission Date (Newest)</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Showing filtered query results</span>
            <button
              onClick={resetFilters}
              className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Table Data View */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Querying database records...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-xs">
            <p className="font-semibold mb-2">{error}</p>
            <button
              onClick={() => fetchStudents(pagination.page)}
              className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No student records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching records for your search criteria. Try modifying your filters or enroll a new student.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Hostel & Room</th>
                  <th className="py-3 px-4">Branch & Semester</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Roll Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {student.roll_number}
                    </td>

                    {/* Student Name & Parents */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{student.full_name}</div>
                      <div className="text-[11px] text-slate-500">
                        F: {student.father_name} · M: {student.mother_name}
                      </div>
                    </td>

                    {/* Hostel & Room */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {student.hostel_name || `Hostel ${student.hostel_id}`}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Room <span className="font-semibold text-slate-700">{student.room_number}</span>
                      </div>
                    </td>

                    {/* Branch & Year */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-800">{student.branch}</div>
                      <div className="text-[11px] text-slate-500">
                        {student.course} · {student.year_semester}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-800">{student.mobile_number}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                        {student.email}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          student.status === 'Active' ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            student.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {student.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onSelectStudent(student.id)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Full Profile Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditStudent(student.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Student Record"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(student)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && students.length > 0 && (
          <div className="px-5 py-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing{' '}
              <span className="font-semibold text-slate-900">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-900">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-semibold text-slate-900">{pagination.total}</span> records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-mono font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Confirm Student Deletion"
        message={`Are you sure you want to permanently delete the institutional record for ${studentToDelete?.full_name} (${studentToDelete?.roll_number})? This action will remove room allocation and cannot be undone.`}
        confirmText="Yes, Delete Record"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setStudentToDelete(null);
        }}
      />
    </div>
  );
};
