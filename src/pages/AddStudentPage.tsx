import React, { useState, useEffect } from 'react';
import { Hostel, Student, StudentFormData, ActivePage } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  UserPlus,
  Save,
  ArrowLeft,
  AlertCircle,
  Building,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  Home,
  User,
  ShieldAlert,
} from 'lucide-react';

interface AddStudentPageProps {
  onNavigate: (page: ActivePage) => void;
  editStudentId?: number | null;
  onStudentSaved?: (studentId: number) => void;
}

const VNIT_BRANCHES = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Metallurgical & Materials Engineering',
  'Mining Engineering',
  'Architecture & Planning',
  'Applied Physics & Materials',
  'Applied Chemistry',
  'Mathematics & Computing',
];

const VNIT_COURSES = ['B.Tech', 'B.Arch', 'M.Tech', 'M.Plan', 'M.Sc', 'Ph.D'];

const VNIT_YEAR_SEMESTERS = [
  '1st Year / Sem 1',
  '1st Year / Sem 2',
  '2nd Year / Sem 3',
  '2nd Year / Sem 4',
  '3rd Year / Sem 5',
  '3rd Year / Sem 6',
  '4th Year / Sem 7',
  '4th Year / Sem 8',
  '5th Year / Sem 9 (Arch)',
  '5th Year / Sem 10 (Arch)',
];

export const AddStudentPage: React.FC<AddStudentPageProps> = ({
  onNavigate,
  editStudentId,
  onStudentSaved,
}) => {
  const { notify } = useAuth();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStudent, setIsFetchingStudent] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const [formData, setFormData] = useState<StudentFormData>({
    roll_number: '',
    full_name: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '2005-01-01',
    gender: 'Male',
    mobile_number: '+91 ',
    email: '',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    year_semester: '1st Year / Sem 1',
    hostel_id: 1,
    room_number: '',
    admission_date: new Date().toISOString().split('T')[0],
    address: '',
    emergency_contact_name: '',
    emergency_contact_number: '+91 ',
    status: 'Active',
    additional_remarks: '',
  });

  // Fetch hostels
  useEffect(() => {
    const loadHostels = async () => {
      try {
        const data = await api.getHostels();
        setHostels(data);
        if (data.length > 0 && !editStudentId) {
          setFormData((prev) => ({ ...prev, hostel_id: data[0].id }));
        }
      } catch (err) {
        console.error('Failed to load hostels', err);
      }
    };
    loadHostels();
  }, [editStudentId]);

  // Load existing student if in edit mode
  useEffect(() => {
    if (!editStudentId) return;

    const loadStudent = async () => {
      setIsFetchingStudent(true);
      try {
        const student = await api.getStudentById(editStudentId);
        setFormData({
          roll_number: student.roll_number,
          full_name: student.full_name,
          father_name: student.father_name,
          mother_name: student.mother_name,
          date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
          gender: student.gender,
          mobile_number: student.mobile_number,
          email: student.email,
          course: student.course,
          branch: student.branch,
          year_semester: student.year_semester,
          hostel_id: student.hostel_id,
          room_number: student.room_number,
          admission_date: student.admission_date ? student.admission_date.split('T')[0] : '',
          address: student.address,
          emergency_contact_name: student.emergency_contact_name,
          emergency_contact_number: student.emergency_contact_number,
          status: student.status,
          additional_remarks: student.additional_remarks || '',
        });
      } catch (err: any) {
        setGeneralError(err.message || 'Failed to load student details for editing');
      } finally {
        setIsFetchingStudent(false);
      }
    };

    loadStudent();
  }, [editStudentId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hostel_id' ? Number(value) : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.roll_number.trim()) {
      errors.roll_number = 'Roll Number / Student ID is required';
    } else if (formData.roll_number.trim().length < 4) {
      errors.roll_number = 'Roll Number is too short (e.g. BT22CSE001)';
    }

    if (!formData.full_name.trim()) errors.full_name = "Full Name is required";
    if (!formData.father_name.trim()) errors.father_name = "Father's Name is required";
    if (!formData.mother_name.trim()) errors.mother_name = "Mother's Name is required";
    if (!formData.date_of_birth) errors.date_of_birth = "Date of Birth is required";
    if (!formData.mobile_number.trim() || formData.mobile_number.trim() === '+91') {
      errors.mobile_number = "Mobile Number is required";
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = "Valid Email Address is required";
    }
    if (!formData.room_number.trim()) errors.room_number = "Allotted Room Number is required";
    if (!formData.admission_date) errors.admission_date = "Admission Date is required";
    if (!formData.address.trim()) errors.address = "Residential Address is required";
    if (!formData.emergency_contact_name.trim()) errors.emergency_contact_name = "Emergency Contact Person is required";
    if (!formData.emergency_contact_number.trim() || formData.emergency_contact_number.trim() === '+91') {
      errors.emergency_contact_number = "Emergency Contact Phone is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) {
      setGeneralError('Please fill in all mandatory fields with valid values.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);

    try {
      if (editStudentId) {
        const updated = await api.updateStudent(editStudentId, formData);
        notify('success', `Student record ${updated.roll_number} updated successfully!`);
        if (onStudentSaved) {
          onStudentSaved(updated.id);
        } else {
          onNavigate('student-records');
        }
      } else {
        const created = await api.createStudent(formData);
        notify('success', `Student ${created.full_name} (${created.roll_number}) enrolled successfully!`);
        if (onStudentSaved) {
          onStudentSaved(created.id);
        } else {
          onNavigate('student-records');
        }
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to save student record');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingStudent) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <div className="h-10 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('student-records')}
              className="text-slate-500 hover:text-slate-800 p-1 rounded-md"
              title="Back to Student Records"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {editStudentId ? 'Edit Student Record' : 'Register New Hostel Student'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 ml-7">
            {editStudentId
              ? `Updating academic, room allocation, and guardian record for ID #${editStudentId}`
              : 'Add complete institutional record for VNIT hostel allotment'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('student-records')}
          className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
        >
          Cancel & Back
        </button>
      </div>

      {generalError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Registration Alert:</span> {generalError}
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Academic & Identification */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Academic & Identification Information
              </h3>
            </div>
            <span className="text-xs text-slate-500">* All fields required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Student ID / Roll Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Roll Number / Student ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="roll_number"
                value={formData.roll_number}
                onChange={handleChange}
                placeholder="e.g. BT24CSE042"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono uppercase transition-all ${
                  formErrors.roll_number
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {formErrors.roll_number && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{formErrors.roll_number}</p>
              )}
            </div>

            {/* Course / Program */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Course / Program <span className="text-rose-500">*</span>
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                {VNIT_COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch / Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Branch / Department <span className="text-rose-500">*</span>
              </label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                {VNIT_BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Year / Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Year / Semester <span className="text-rose-500">*</span>
              </label>
              <select
                name="year_semester"
                value={formData.year_semester}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                {VNIT_YEAR_SEMESTERS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Resident Status <span className="text-rose-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="Active">Active (Current Hostel Resident)</option>
                <option value="Inactive">Inactive (Vacated / Graduated / Leave)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-900">Personal & Family Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Rahul Ramesh Sharma"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                  formErrors.full_name
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {formErrors.full_name && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{formErrors.full_name}</p>
              )}
            </div>

            {/* Father's Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Father's Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Sharma"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                  formErrors.father_name
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {formErrors.father_name && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{formErrors.father_name}</p>
              )}
            </div>

            {/* Mother's Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mother's Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
                placeholder="e.g. Sunita Sharma"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                  formErrors.mother_name
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {formErrors.mother_name && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{formErrors.mother_name}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date of Birth <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                  formErrors.mobile_number
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {formErrors.mobile_number && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{formErrors.mobile_number}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Student Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. rahul.sharma@students.vnit.ac.in"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                  formErrors.email
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{formErrors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Hostel Allocation */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900">VNIT Hostel & Room Allotment</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Hostel Selection */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Allotted VNIT Hostel <span className="text-rose-500">*</span>
              </label>
              <select
                name="hostel_id"
                value={formData.hostel_id}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                {hostels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.code} · {h.name} ({h.type} · Capacity: {h.total_capacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Room Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Room Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                placeholder="e.g. A-204 or BB-312"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono transition-all ${
                  formErrors.room_number
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {formErrors.room_number && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{formErrors.room_number}</p>
              )}
            </div>

            {/* Admission Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hostel Admission Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="admission_date"
                value={formData.admission_date}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Address & Emergency Contacts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
              4
            </span>
            <h3 className="text-sm font-bold text-slate-900">Address & Emergency Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Permanent Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Permanent Residential Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Full street address, city, state, pin code"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                  formErrors.address
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {formErrors.address && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{formErrors.address}</p>
              )}
            </div>

            {/* Emergency Contact Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Emergency Contact Person <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Sharma (Father)"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                  formErrors.emergency_contact_name
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {formErrors.emergency_contact_name && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{formErrors.emergency_contact_name}</p>
              )}
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Emergency Contact Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="emergency_contact_number"
                value={formData.emergency_contact_number}
                onChange={handleChange}
                placeholder="+91 98765 00000"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                  formErrors.emergency_contact_number
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {formErrors.emergency_contact_number && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{formErrors.emergency_contact_number}</p>
              )}
            </div>

            {/* Additional Remarks */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Additional Remarks / Special Notes (Optional)
              </label>
              <textarea
                name="additional_remarks"
                rows={2}
                value={formData.additional_remarks}
                onChange={handleChange}
                placeholder="e.g. Mess representative, medical conditions, sports team, single room special allotment, etc."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => onNavigate('student-records')}
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Record...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{editStudentId ? 'Update Record' : 'Save & Enroll Student'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
