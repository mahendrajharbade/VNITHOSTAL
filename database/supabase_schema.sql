-- ============================================================================
-- VNIT Hostel Student Record Management System - Supabase PostgreSQL Schema
-- Project ID: ftaywnbgjsnewoxnajys
-- ============================================================================
-- Instructions:
-- 1. Open Supabase Dashboard: https://supabase.com/dashboard/project/ftaywnbgjsnewoxnajys
-- 2. In the left sidebar, click "SQL Editor"
-- 3. Click "New Query", paste this entire script, and click "RUN" (or Ctrl+Enter)
-- ============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. USERS & ADMINS TABLE (For Admin-Only Protected Authentication)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 2. HOSTELS TABLE
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 3. STUDENTS TABLE (Full Student Dossier & Record Storage)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures data can be accessed and modified via Supabase client with anon key
-- ----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Allow anon read/write with application authentication
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public update users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public read hostels" ON public.hostels FOR SELECT USING (true);
CREATE POLICY "Allow public insert hostels" ON public.hostels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update hostels" ON public.hostels FOR UPDATE USING (true);

CREATE POLICY "Allow public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Allow public delete students" ON public.students FOR DELETE USING (true);

-- ----------------------------------------------------------------------------
-- 5. SEED INITIAL DATA: ADMIN USER
-- Default Credentials: Username: admin | Password: Jaymaatapti
-- ----------------------------------------------------------------------------
INSERT INTO public.users (
  id, username, password_hash, full_name, role, email, phone, designation, status
) VALUES (
  'usr-admin',
  'admin',
  'Jaymaatapti',
  'Prof. Rajeshwar Sharma',
  'admin',
  'admin@vnit.ac.in',
  '+91 98765 43210',
  'Chief Warden & Administrator',
  'active'
) ON CONFLICT (username) DO UPDATE SET password_hash = 'Jaymaatapti';

-- ----------------------------------------------------------------------------
-- 6. SEED INITIAL DATA: 5 VNIT HOSTELS
-- ----------------------------------------------------------------------------
INSERT INTO public.hostels (
  id, name, code, type, warden_name, warden_phone, warden_email, total_rooms, total_beds, occupied_beds, available_beds, location, status
) VALUES
(
  'h-1',
  'Hostel 1 (Aryabhata Mega Boys Hostel - Block A)',
  'H-1',
  'Boys',
  'Dr. Ramesh Chandra Verma',
  '+91 98112 34567',
  'warden.h1@vnit.ac.in',
  40, 450, 2, 448,
  'North Campus, Sector-A, Near Sports Ground',
  'active'
),
(
  'h-2',
  'Hostel 2 (Bhabha Bhavan)',
  'H-2',
  'Boys',
  'Dr. Sanjay Patel',
  '+91 98221 44522',
  'warden.h2@vnit.ac.in',
  35, 350, 1, 349,
  'East Wing, Adjacent to Central Library',
  'active'
),
(
  'h-3',
  'Hostel 3 (Ramanujan Bhavan)',
  'H-3',
  'Boys',
  'Dr. Manish Kulkarni',
  '+91 98221 44523',
  'warden.h3@vnit.ac.in',
  30, 300, 1, 299,
  'Central Quadrangle, Near Student Mess 2',
  'active'
),
(
  'h-4',
  'Hostel 4 (Kalpana Chawla Girls Hostel)',
  'H-4',
  'Girls',
  'Dr. Pratibha Rao',
  '+91 98221 44524',
  'warden.h4@vnit.ac.in',
  45, 400, 2, 398,
  'North Campus, Secure Perimeter with Dedicated Gym',
  'active'
),
(
  'h-5',
  'Hostel 5 (Visvesvaraya PG & Research Block)',
  'H-5',
  'Co-ed',
  'Prof. S. R. Nene',
  '+91 98221 44525',
  'warden.h5@vnit.ac.in',
  25, 250, 1, 249,
  'West Zone, Near Research Park and Innovation Centre',
  'active'
) ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. SEED INITIAL DATA: SAMPLE STUDENT RECORDS
-- ----------------------------------------------------------------------------
INSERT INTO public.students (
  id, student_id, enrollment_number, college_roll_no, full_name, father_name, mother_name, dob, gender,
  mobile_number, email, aadhaar_number, address, city, state, pin_code, blood_group,
  course, department, year, semester, admission_year, student_status, hostel_id, hostel_name,
  room_number, bed_number, hostel_admission_date, emergency_contact_number, guardian_name, guardian_address
) VALUES
(
  'std-1',
  'BT22CSE018',
  'EN22CS018',
  'BT22CSE018',
  'Aarav Narendra Verma',
  'Narendra Verma',
  'Sunita Verma',
  '2004-05-14',
  'Male',
  '+91 98765 43210',
  'aarav.verma@students.vnit.ac.in',
  '1234-5678-9012',
  'Flat 402, Shivalik Residency, Shivaji Nagar',
  'Pune',
  'Maharashtra',
  '411005',
  'B+',
  'B.Tech',
  'Computer Science & Engineering',
  '3rd Year',
  '6th',
  2022,
  'Active',
  'h-1',
  'Hostel 1 (Aryabhata Mega Boys Hostel - Block A)',
  'A-204',
  'Bed A',
  '2022-08-10',
  '+91 98765 00001',
  'Narendra Verma',
  'Flat 402, Shivalik Residency, Shivaji Nagar, Pune'
),
(
  'std-2',
  'BT22ECE042',
  'EN22EC042',
  'BT22ECE042',
  'Ananya Priya Nair',
  'M. K. Nair',
  'Radhika Nair',
  '2004-09-22',
  'Female',
  '+91 94231 78901',
  'ananya.nair@students.vnit.ac.in',
  '2345-6789-0123',
  '12, Rose Villa, MG Road, Ernakulam',
  'Kochi',
  'Kerala',
  '682016',
  'O+',
  'B.Tech',
  'Electronics & Communication Engineering',
  '3rd Year',
  '6th',
  2022,
  'Active',
  'h-4',
  'Hostel 4 (Kalpana Chawla Girls Hostel)',
  'KC-112',
  'Bed A',
  '2022-08-11',
  '+91 94231 00002',
  'M. K. Nair',
  '12, Rose Villa, MG Road, Ernakulam, Kochi'
),
(
  'std-3',
  'BT23MEC009',
  'EN23ME009',
  'BT23MEC009',
  'Rohan Dilip Joshi',
  'Dilip Joshi',
  'Manjusha Joshi',
  '2005-02-18',
  'Male',
  '+91 91234 56780',
  'rohan.joshi@students.vnit.ac.in',
  '3456-7890-1234',
  '78/B Saraswati Colony, Dombivli East',
  'Thane',
  'Maharashtra',
  '421201',
  'A+',
  'B.Tech',
  'Mechanical Engineering',
  '2nd Year',
  '4th',
  2023,
  'Active',
  'h-2',
  'Hostel 2 (Bhabha Bhavan)',
  'BB-301',
  'Bed B',
  '2023-08-05',
  '+91 91234 00003',
  'Dilip Joshi',
  '78/B Saraswati Colony, Dombivli East, Thane'
) ON CONFLICT (student_id) DO NOTHING;
