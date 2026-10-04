import React, { useState, useEffect } from 'react';
import { Student, ActivePage } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  Mail,
  Phone,
  Building,
  Calendar,
  MapPin,
  User,
  Shield,
  GraduationCap,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface StudentProfilePageProps {
  studentId: number | string;
  onNavigate: (page: ActivePage) => void;
  onEditStudent: (studentId: number | string) => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  studentId,
  onNavigate,
  onEditStudent,
}) => {
  const { notify } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await api.getStudentById(studentId);
        setStudent(data);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve student record');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  const handleDelete = async () => {
    if (!student) return;
    setIsDeleting(true);
    try {
      await api.deleteStudent(student.id);
      notify('success', `Student record for ${student.full_name} (${student.roll_number}) deleted.`);
      onNavigate('student-records');
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="h-10 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs">
          <p className="font-semibold">{error || 'Student record not found'}</p>
        </div>
        <button
          onClick={() => onNavigate('student-records')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
        >
          Back to Student Records
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <button
          type="button"
          onClick={() => onNavigate('student-records')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Records</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            title="Print Official Record Card"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>

          <button
            onClick={() => onEditStudent(student.id)}
            className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Record</span>
          </button>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Student Card Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Student Avatar / Initials */}
            <div className="w-20 h-20 rounded-2xl bg-indigo-700 text-white font-mono font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
              {student.full_name
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                  {student.roll_number}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    student.status === 'Active' ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      student.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  {student.status} Resident
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {student.full_name}
              </h2>

              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>{student.course}</span>
                <span aria-hidden="true">·</span>
                <span>{student.branch}</span>
                <span aria-hidden="true">·</span>
                <span>{student.year_semester}</span>
              </p>
            </div>
          </div>

          {/* Quick Hostel Room Badge */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left sm:text-right shrink-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Allotted Accommodation
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {student.hostel_name || `Hostel ${student.hostel_id}`}
            </div>
            <div className="text-xs text-indigo-600 font-mono font-semibold mt-0.5">
              Room #{student.room_number}
            </div>
          </div>
        </div>

        {/* Quick Contact Line */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-mono truncate">{student.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-mono">{student.mobile_number}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Admitted: {student.admission_date}</span>
          </div>
        </div>
      </div>

      {/* Grid of 4 Detail Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Academic & Institution Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Academic Registration</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Roll Number:</span>
              <span className="font-mono font-semibold text-slate-900">{student.roll_number}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Course / Degree:</span>
              <span className="font-semibold text-slate-900">{student.course}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Department / Branch:</span>
              <span className="font-semibold text-slate-900 text-right">{student.branch}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Current Standing:</span>
              <span className="font-semibold text-slate-900">{student.year_semester}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Institute:</span>
              <span className="font-semibold text-slate-900">VNIT Nagpur (Deemed NIT)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Hostel Allotment & Warden */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Hostel Allocation</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Hostel Name:</span>
              <span className="font-semibold text-slate-900">{student.hostel_name || `Hostel ${student.hostel_id}`}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Room Number:</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {student.room_number}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Admission Date:</span>
              <span className="font-mono font-medium text-slate-900">{student.admission_date}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Resident Status:</span>
              <span className="font-semibold text-slate-900">{student.status}</span>
            </div>
            {student.warden_name && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Hostel Warden:</span>
                <span className="font-medium text-slate-900">{student.warden_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Personal & Family Information */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Personal & Family Details</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Father's Name:</span>
              <span className="font-semibold text-slate-900">{student.father_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Mother's Name:</span>
              <span className="font-semibold text-slate-900">{student.mother_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Date of Birth:</span>
              <span className="font-mono font-medium text-slate-900">{student.date_of_birth}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Gender:</span>
              <span className="font-semibold text-slate-900">{student.gender}</span>
            </div>
            <div className="py-1">
              <span className="text-slate-500 block mb-1">Permanent Residential Address:</span>
              <span className="font-normal text-slate-800 leading-relaxed block bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {student.address}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Emergency Contacts & Remarks */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Emergency & Disciplinary Record</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <div className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
                Emergency Primary Contact
              </div>
              <div className="text-sm font-bold text-slate-900">
                {student.emergency_contact_name}
              </div>
              <div className="font-mono text-xs font-semibold text-amber-800 flex items-center gap-1.5 pt-0.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{student.emergency_contact_number}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-slate-500 block mb-1">Additional Remarks / Special Notes:</span>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-700 min-h-[60px] leading-relaxed">
                {student.additional_remarks || 'No special remarks recorded for this resident.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Confirm Student Record Deletion"
        message={`Are you sure you want to permanently delete the institutional hostel record for ${student.full_name} (${student.roll_number})? All room allotment data will be cleared.`}
        confirmText="Yes, Delete Record"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
