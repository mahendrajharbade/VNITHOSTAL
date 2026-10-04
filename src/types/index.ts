export interface AdminUser {
  id: number | string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  hostel_id?: number | string | null;
  hostel_name?: string;
  last_login?: string | null;
}

export interface Hostel {
  id: number | string;
  code: string;
  name: string;
  type: 'Boys' | 'Girls' | 'Co-ed';
  total_capacity: number;
  warden_name: string;
  warden_contact: string;
  warden_email: string;
  location_description?: string;
  is_active: boolean | number;
  student_count?: number;
  created_at?: string;
}

export interface Student {
  id: number | string;
  roll_number: string;
  full_name: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile_number: string;
  email: string;
  course: string;
  branch: string;
  year_semester: string;
  hostel_id: number | string;
  hostel_name?: string;
  hostel_code?: string;
  room_number: string;
  admission_date: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  status: 'Active' | 'Inactive';
  additional_remarks?: string;
  warden_name?: string;
  warden_contact?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentFormData {
  roll_number: string;
  full_name: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile_number: string;
  email: string;
  course: string;
  branch: string;
  year_semester: string;
  hostel_id: number | string;
  room_number: string;
  admission_date: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  status: 'Active' | 'Inactive';
  additional_remarks?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalHostels: number;
  activeStudents: number;
  inactiveStudents: number;
  hostelStats: Array<{
    id: number | string;
    code: string;
    name: string;
    type: string;
    student_count: number;
    capacity: number;
    occupancy_rate: number;
    warden_name: string;
  }>;
  branchStats: Array<{
    branch: string;
    count: number;
  }>;
  recentStudents: Student[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SystemStatus {
  mode: 'mysql' | 'relational_engine' | 'supabase_cloud';
  connectedToMySQL: boolean;
  message: string;
  config: {
    host: string;
    port: string | number;
    user: string;
    database: string;
    ssl: boolean;
  };
  stats: {
    studentCount: number;
    hostelCount: number;
  };
}

export type ActivePage =
  | 'dashboard'
  | 'add-student'
  | 'student-records'
  | 'student-profile'
  | 'search-student'
  | 'hostels'
  | 'reports'
  | 'admin-profile';
