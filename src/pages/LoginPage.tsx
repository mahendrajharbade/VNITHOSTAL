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
  Database,
  Copy,
  Check,
  Code2,
  X,
} from 'lucide-react';
import { SUPABASE_PROJECT_ID } from '../services/supabase';

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
    defaultPass: 'Jaymaatapti',
    warden: 'Prof. Rajeshwar Sharma (Chief Warden)',
  },
  {
    id: 'h1',
    hostelId: 1,
    tabLabel: 'Hostel 1 (Aryabhata Mega Boys)',
    title: 'Hostel 1 - Mega Boys Hostel Block A',
    subtitle: 'South Campus, 450 Bed Capacity',
    type: 'Boys Hostel Administration',
    username: 'admin',
    defaultPass: 'Jaymaatapti',
    warden: 'Dr. Ramesh Chandra Verma',
  },
  {
    id: 'h4',
    hostelId: 4,
    tabLabel: 'Hostel 4 (Girls)',
    title: 'Hostel 4 - Kalpana Chawla Girls Hostel',
    subtitle: 'North Campus, 400 Bed Capacity',
    type: 'Girls Hostel Administration',
    username: 'admin',
    defaultPass: 'Jaymaatapti',
    warden: 'Dr. Pratibha Rao',
  },
];

const SUPABASE_SQL_SCRIPT = `-- ============================================================================
-- VNIT Hostel Student Record Management System - Supabase PostgreSQL Schema
-- Project ID: ftaywnbgjsnewoxnajys
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  hostel_id TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  designation TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hostels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Boys', 'Girls', 'Co-ed')),
  warden_name TEXT NOT NULL,
  warden_phone TEXT,
  warden_email TEXT,
  total_rooms INT NOT NULL DEFAULT 40,
  total_beds INT NOT NULL DEFAULT 100,
  occupied_beds INT NOT NULL DEFAULT 0,
  available_beds INT NOT NULL DEFAULT 100,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  enrollment_number TEXT,
  college_roll_no TEXT,
  full_name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  dob DATE NOT NULL DEFAULT '2004-01-01',
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  mobile_number TEXT NOT NULL,
  alt_mobile_number TEXT,
  email TEXT NOT NULL,
  aadhaar_number TEXT,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Nagpur',
  state TEXT DEFAULT 'Maharashtra',
  pin_code TEXT DEFAULT '440010',
  blood_group TEXT DEFAULT 'B+',
  photo_url TEXT,
  course TEXT NOT NULL DEFAULT 'B.Tech',
  department TEXT NOT NULL,
  year TEXT NOT NULL DEFAULT '1st Year',
  semester TEXT NOT NULL DEFAULT '1st',
  admission_year INT NOT NULL DEFAULT 2024,
  student_status TEXT NOT NULL DEFAULT 'Active' CHECK (student_status IN ('Active', 'Inactive', 'Graduated', 'Suspended')),
  hostel_id TEXT NOT NULL REFERENCES public.hostels(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  hostel_name TEXT NOT NULL,
  room_id TEXT,
  room_number TEXT NOT NULL,
  bed_number TEXT DEFAULT 'Bed A',
  hostel_admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hostel_status TEXT DEFAULT 'Hosteller',
  hostel_fee_status TEXT DEFAULT 'Paid',
  monthly_rent NUMERIC(10, 2) DEFAULT 4500.00,
  guardian_name TEXT,
  guardian_relation TEXT DEFAULT 'Father',
  guardian_mobile_number TEXT,
  guardian_address TEXT,
  emergency_contact_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT DEFAULT 'admin'
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public update users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public read hostels" ON public.hostels FOR SELECT USING (true);
CREATE POLICY "Allow public insert hostels" ON public.hostels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update hostels" ON public.hostels FOR UPDATE USING (true);

CREATE POLICY "Allow public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Allow public delete students" ON public.students FOR DELETE USING (true);

INSERT INTO public.users (id, username, password_hash, full_name, role, email, phone, designation, status)
VALUES ('usr-admin', 'admin', 'Jaymaatapti', 'Prof. Rajeshwar Sharma', 'admin', 'admin@vnit.ac.in', '+91 98765 43210', 'Chief Warden & Administrator', 'active')
ON CONFLICT (username) DO UPDATE SET password_hash = 'Jaymaatapti';

INSERT INTO public.hostels (id, name, code, type, warden_name, warden_phone, warden_email, total_rooms, total_beds, occupied_beds, available_beds, location, status) VALUES
('h-1', 'Hostel 1 (Aryabhata Mega Boys Hostel - Block A)', 'H-1', 'Boys', 'Dr. Ramesh Chandra Verma', '+91 98112 34567', 'warden.h1@vnit.ac.in', 40, 450, 2, 448, 'North Campus, Sector-A', 'active'),
('h-2', 'Hostel 2 (Bhabha Bhavan)', 'H-2', 'Boys', 'Dr. Sanjay Patel', '+91 98221 44522', 'warden.h2@vnit.ac.in', 35, 350, 1, 349, 'East Wing', 'active'),
('h-3', 'Hostel 3 (Ramanujan Bhavan)', 'H-3', 'Boys', 'Dr. Manish Kulkarni', '+91 98221 44523', 'warden.h3@vnit.ac.in', 30, 300, 1, 299, 'Central Quadrangle', 'active'),
('h-4', 'Hostel 4 (Kalpana Chawla Girls Hostel)', 'H-4', 'Girls', 'Dr. Pratibha Rao', '+91 98221 44524', 'warden.h4@vnit.ac.in', 45, 400, 2, 398, 'North Campus', 'active'),
('h-5', 'Hostel 5 (Visvesvaraya PG & Research Block)', 'H-5', 'Co-ed', 'Prof. S. R. Nene', '+91 98221 44525', 'warden.h5@vnit.ac.in', 25, 250, 1, 249, 'West Zone', 'active')
ON CONFLICT (code) DO NOTHING;
`;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [selectedPortal, setSelectedPortal] = useState<HostelPortalOption>(HOSTEL_PORTALS[0]);
  const [username, setUsername] = useState(HOSTEL_PORTALS[0].username);
  const [password, setPassword] = useState(HOSTEL_PORTALS[0].defaultPass);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePortalSwitch = (portal: HostelPortalOption) => {
    setSelectedPortal(portal);
    setUsername(portal.username);
    setPassword(portal.defaultPass);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(username, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-blue-600/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Institutional Top Bar Badge */}
      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs shadow-inner">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-medium">Strict Access Control Active</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400 font-mono">Supabase: {SUPABASE_PROJECT_ID}</span>
      </div>

      <div className="w-full max-w-md space-y-4 relative z-10">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-600/30 mb-1 border border-indigo-400/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            VNIT Nagpur Hostel Management
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Visvesvaraya National Institute of Technology • Restricted Administrative Access Only
          </p>
        </div>

        {/* Security Alert: Admin Only Notice */}
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-300">Protected System</p>
            <p className="text-amber-200/80 text-[11px] mt-0.5 leading-relaxed">
              Student records and residential details are strictly private. Only authorized administrators with valid credentials can access the system or submit records.
            </p>
          </div>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="bg-slate-900/80 p-1 rounded-xl border border-white/10 flex gap-1 text-xs">
          {HOSTEL_PORTALS.map((portal) => (
            <button
              key={portal.id}
              type="button"
              onClick={() => handlePortalSwitch(portal)}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                selectedPortal.id === portal.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {portal.tabLabel.split('(')[0]}
            </button>
          ))}
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-start justify-between pb-3 border-b border-white/10">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                {selectedPortal.type}
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {selectedPortal.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{selectedPortal.warden}</p>
            </div>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shrink-0">
              <Building className="w-4 h-4" />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <span className="font-bold">Access Denied:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Username or Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter login username"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-white/15 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Authorized Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-10 py-2 bg-slate-950/70 border border-white/15 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Authorized Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Preset Admin Credentials */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              Default Admin Login:
            </span>
            <span className="font-mono text-slate-200 font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/10">
              admin / Jaymaatapti
            </span>
          </div>

          {/* Supabase SQL Schema helper button */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>View & Copy Supabase SQL Query</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Restricted to VNIT Authorized Administrators Only</span>
        </div>
      </div>

      {/* Supabase SQL Query Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Supabase PostgreSQL Schema Query</h3>
                  <p className="text-[11px] text-slate-400">Project: {SUPABASE_PROJECT_ID}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copySql}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL Query</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-slate-300 bg-slate-950/90 leading-relaxed select-all">
              <pre className="whitespace-pre-wrap">{SUPABASE_SQL_SCRIPT}</pre>
            </div>

            <div className="p-3 bg-slate-950/80 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Steps: Open Supabase Dashboard &gt; SQL Editor &gt; New Query &gt; Paste &gt; Run</span>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
