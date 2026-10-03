import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User,
  Shield,
  KeyRound,
  Lock,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Database,
  Save,
  Clock,
  Server,
  RefreshCw,
} from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const { admin, refreshAdmin, notify, systemStatus, refreshSystemStatus } = useAuth();

  const [fullName, setFullName] = useState(admin?.full_name || '');
  const [email, setEmail] = useState(admin?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword) {
      if (!currentPassword) {
        setErrorMsg('Please enter your current password to set a new password.');
        return;
      }
      if (newPassword.length < 8) {
        setErrorMsg('New password must be at least 8 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation password do not match.');
        return;
      }
    }

    setIsUpdating(true);

    try {
      await api.updateProfile({
        full_name: fullName.trim(),
        email: email.trim(),
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
      });

      await refreshAdmin();
      setSuccessMsg('Administrator profile and security credentials updated successfully!');
      notify('success', 'Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update admin profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const isMySQL = systemStatus?.connectedToMySQL;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Administrator Profile & System Security
        </h2>
        <p className="text-xs text-slate-500">
          Manage administrative account, change master password, and review MySQL connection
        </p>
      </div>

      {/* Production Warning Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-950">Security Notice for Production Deployment:</span>
          <p className="mt-1 leading-relaxed">
            The default development password <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold text-amber-950">Admin@vnit2026</code> must be replaced with a strong, high-entropy administrative password before deploying the VNIT Hostel Record Management System to production.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <span className="font-bold">Error:</span> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-indigo-700 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
            {admin?.full_name ? admin.full_name.charAt(0) : 'A'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{admin?.full_name}</h3>
            <p className="text-xs text-slate-500 font-mono">{admin?.email}</p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
              <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {admin?.role || 'Chief Warden & Admin'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Last Login: {admin?.last_login ? new Date(admin.last_login).toLocaleString() : 'Active now'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Administrator Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Change Password
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Leave blank if you do not wish to update your administrator password.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Profile & Security</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Database & Infrastructure Inspector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Database Engine & Environment</h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isMySQL ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'
          }`}>
            {isMySQL ? 'MySQL Live' : 'Relational Engine'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-500">Database Driver:</span>
            <div className="font-mono font-bold text-slate-900">mysql2 (Node MySQL 8.0 Client)</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-500">Schema File:</span>
            <div className="font-mono font-bold text-slate-900">database/schema.sql</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-500">Host / Endpoint:</span>
            <div className="font-mono text-slate-900">{systemStatus?.config.host}:{systemStatus?.config.port}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-500">Database Name:</span>
            <div className="font-mono text-slate-900">{systemStatus?.config.database}</div>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {systemStatus?.message}
        </p>
      </div>
    </div>
  );
};
