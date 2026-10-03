import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Building,
  GraduationCap,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface HostelPortalOption {
  id: string;
  hostelId: number | null;
  tabLabel: string;
  title: string;
  subtitle: string;
  type: string;
  username: string;
  defaultPass: string;
  warden: string;
}

const HOSTEL_PORTALS: HostelPortalOption[] = [
  {
    id: 'all',
    hostelId: null,
    tabLabel: 'Chief Admin (All Hostels)',
    title: 'Central Administration Portal',
    subtitle: 'Full jurisdiction across all 5 VNIT residential blocks',
    type: 'Campus-wide Super Admin',
    username: 'admin',
    defaultPass: 'Admin@vnit2026',
    warden: 'Dr. Rajesh K. Sharma (Chief Warden)',
  },
  {
    id: 'h1',
    hostelId: 1,
    tabLabel: 'Hostel 1 (Mega Boys)',
    title: 'Hostel 1 - Mega Boys Hostel Block A',
    subtitle: 'South Campus, 450 Bed Capacity',
    type: 'Boys Hostel Administration',
    username: 'warden.h1',
    defaultPass: 'Hostel1@2026',
    warden: 'Prof. Arvind Deshmukh',
  },
  {
    id: 'h2',
    hostelId: 2,
    tabLabel: 'Hostel 2 (Bhabha)',
    title: 'Hostel 2 - Bhabha Bhavan',
    subtitle: 'East Wing, 350 Bed Capacity',
    type: 'Boys Hostel Administration',
    username: 'warden.h2',
    defaultPass: 'Hostel2@2026',
    warden: 'Dr. Sanjay Patel',
  },
  {
    id: 'h3',
    hostelId: 3,
    tabLabel: 'Hostel 3 (Ramanujan)',
    title: 'Hostel 3 - Ramanujan Bhavan',
    subtitle: 'Central Quadrangle, 300 Bed Capacity',
    type: 'Boys Hostel Administration',
    username: 'warden.h3',
    defaultPass: 'Hostel3@2026',
    warden: 'Dr. Manish Kulkarni',
  },
  {
    id: 'h4',
    hostelId: 4,
    tabLabel: 'Hostel 4 (Girls)',
    title: 'Hostel 4 - Kalpana Chawla Girls Hostel',
    subtitle: 'North Campus, 400 Bed Capacity',
    type: 'Girls Hostel Administration',
    username: 'warden.h4',
    defaultPass: 'Hostel4@2026',
    warden: 'Dr. Pratibha Rao',
  },
  {
    id: 'h5',
    hostelId: 5,
    tabLabel: 'Hostel 5 (PG/Research)',
    title: 'Hostel 5 - Visvesvaraya PG & Research Block',
    subtitle: 'West Zone Innovation Block, 250 Bed Capacity',
    type: 'Co-ed PG/Ph.D Administration',
    username: 'warden.h5',
    defaultPass: 'Hostel5@2026',
    warden: 'Prof. S. R. Nene',
  },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [selectedPortal, setSelectedPortal] = useState<HostelPortalOption>(HOSTEL_PORTALS[0]);
  const [username, setUsername] = useState(HOSTEL_PORTALS[0].username);
  const [password, setPassword] = useState(HOSTEL_PORTALS[0].defaultPass);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectPortal = (portal: HostelPortalOption) => {
    setSelectedPortal(portal);
    setUsername(portal.username);
    setPassword(portal.defaultPass);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username/email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center px-4 py-8 lg:py-12 overflow-hidden bg-slate-950 font-sans">
      {/* Background College Campus Image with Institutional Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/vnit_college_campus_1791039388075.jpg"
          alt="VNIT Nagpur College Campus Background"
          className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-[1.08] saturate-[1.1]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/60" />
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Emblem & Institution Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/90 text-white shadow-xl shadow-indigo-600/30 backdrop-blur-md border border-white/20">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            VNIT NAGPUR
          </h1>
          <p className="text-xs uppercase tracking-widest text-indigo-300 font-bold">
            Visvesvaraya National Institute of Technology
          </p>
          <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/15 text-xs text-slate-200 font-medium">
            Hostel Student Record Management System
          </div>
        </div>

        {/* 5 Hostels + Chief Admin Selector Tabs */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1.5 flex items-center justify-between">
            <span>Select Hostel Login Portal:</span>
            <span className="text-indigo-400 font-medium">5 Hostels + Central Admin</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {HOSTEL_PORTALS.map((portal) => {
              const isSelected = selectedPortal.id === portal.id;
              return (
                <button
                  key={portal.id}
                  type="button"
                  onClick={() => handleSelectPortal(portal)}
                  className={`px-3 py-2 rounded-xl text-left transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/40 ring-1 ring-white/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-transparent hover:border-white/10'
                  }`}
                >
                  <span className="font-bold truncate text-[11px]">{portal.tabLabel}</span>
                  <span className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {portal.warden.split('(')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900/85 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Active Portal Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/10">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                {selectedPortal.type}
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {selectedPortal.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{selectedPortal.subtitle}</p>
            </div>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shrink-0">
              <Building className="w-5 h-5" />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <span className="font-bold">Login Failed:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter login username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-white/15 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Authorized Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-950/70 border border-white/15 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {selectedPortal.tabLabel.split('(')[0]}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Test Credentials for Selected Portal */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              Credentials for {selectedPortal.tabLabel.split('(')[0]}:
            </span>
            <span className="font-mono text-slate-200 font-semibold bg-white/5 px-2 py-1 rounded border border-white/10">
              {selectedPortal.username} / {selectedPortal.defaultPass}
            </span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-based access control with bcrypt hashing & JWT verification</span>
        </div>
      </div>
    </div>
  );
};
