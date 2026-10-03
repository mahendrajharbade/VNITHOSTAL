import React, { useState, useEffect } from 'react';
import { Hostel, ActivePage } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building,
  Plus,
  Users,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  X,
  BedDouble,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

interface HostelsPageProps {
  onNavigate: (page: ActivePage) => void;
  onFilterByHostel: (hostelId: number) => void;
}

export const HostelsPage: React.FC<HostelsPageProps> = ({
  onNavigate,
  onFilterByHostel,
}) => {
  const { notify } = useAuth();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Boys' as 'Boys' | 'Girls' | 'Co-ed',
    total_capacity: 300,
    warden_name: '',
    warden_contact: '+91 ',
    warden_email: '',
    location_description: '',
  });

  const loadHostels = async () => {
    setIsLoading(true);
    try {
      const data = await api.getHostels();
      setHostels(data);
    } catch (err: any) {
      notify('error', err.message || 'Failed to load hostels');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHostels();
  }, []);

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (
      !formData.code.trim() ||
      !formData.name.trim() ||
      !formData.warden_name.trim() ||
      !formData.warden_contact.trim() ||
      !formData.warden_email.trim()
    ) {
      setModalError('Please complete all required hostel information fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createHostel(formData);
      notify('success', `Hostel ${formData.name} added successfully!`);
      setIsAddModalOpen(false);
      setFormData({
        code: '',
        name: '',
        type: 'Boys',
        total_capacity: 300,
        warden_name: '',
        warden_contact: '+91 ',
        warden_email: '',
        location_description: '',
      });
      loadHostels();
    } catch (err: any) {
      setModalError(err.message || 'Failed to add hostel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            VNIT Hostel Residential Blocks
          </h2>
          <p className="text-xs text-slate-500">
            Administrative management of all campus hostels, student capacity, and warden allocations
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hostel</span>
        </button>
      </div>

      {/* Hostels Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.map((hostel) => {
            const studentCount = hostel.student_count || 0;
            const occupancyPct = Math.min(
              100,
              Math.round((studentCount / hostel.total_capacity) * 100)
            );

            return (
              <div
                key={hostel.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between space-y-5"
              >
                {/* Header & Badges */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {hostel.code}
                    </span>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {hostel.type} Accommodation
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                      {hostel.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{hostel.location_description || 'VNIT Campus Campus Quadrangle'}</span>
                    </p>
                  </div>
                </div>

                {/* Capacity & Occupancy Bar */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                      <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                      Hostel Occupancy
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {studentCount} / {hostel.total_capacity} beds
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        occupancyPct > 90 ? 'bg-rose-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.max(6, occupancyPct)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
                    <span>{hostel.total_capacity - studentCount} available slots</span>
                    <span className="font-semibold text-indigo-700">{occupancyPct}% full</span>
                  </div>
                </div>

                {/* Warden Details */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Hostel Warden
                  </div>
                  <div className="font-semibold text-slate-900">{hostel.warden_name}</div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{hostel.warden_contact}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] truncate">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{hostel.warden_email}</span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => onFilterByHostel(hostel.id)}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>View Enrolled Students ({studentCount})</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Hostel Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Hostel Block</h3>
                  <p className="text-xs text-slate-500">Expand VNIT hostel residential infrastructure</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateHostel} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hostel Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. H-6"
                    className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Accommodation Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Boys">Boys Hostel</option>
                    <option value="Girls">Girls Hostel</option>
                    <option value="Co-ed">Co-ed / PG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hostel Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hostel 6 (Sarabhai Bhavan)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Student Bed Capacity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={formData.total_capacity}
                  onChange={(e) => setFormData({ ...formData, total_capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warden Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.warden_name}
                    onChange={(e) => setFormData({ ...formData, warden_name: e.target.value })}
                    placeholder="e.g. Prof. R. K. Nair"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warden Contact <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.warden_contact}
                    onChange={(e) => setFormData({ ...formData, warden_contact: e.target.value })}
                    placeholder="+91 98221 00000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warden Official Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.warden_email}
                  onChange={(e) => setFormData({ ...formData, warden_email: e.target.value })}
                  placeholder="e.g. warden.h6@vnit.ac.in"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location & Campus Description
                </label>
                <textarea
                  rows={2}
                  value={formData.location_description}
                  onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
                  placeholder="e.g. Near New Academic Block and Student Activity Center"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Save Hostel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
