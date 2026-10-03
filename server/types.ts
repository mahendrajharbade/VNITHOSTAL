export interface AdminUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  hostel_id?: number | null;
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Hostel {
  id: number;
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
  updated_at?: string;
}

export interface Student {
  id: number;
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
  hostel_id: number;
  hostel_name?: string;
  hostel_code?: string;
  room_number: string;
  admission_date: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  status: 'Active' | 'Inactive';
  additional_remarks?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  hostel_id?: number | string;
  branch?: string;
  year_semester?: string;
  status?: string;
  gender?: string;
  course?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalStudents: number;
  totalHostels: number;
  activeStudents: number;
  inactiveStudents: number;
  hostelStats: Array<{
    id: number;
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
