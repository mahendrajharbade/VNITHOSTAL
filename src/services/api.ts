import {
  AdminUser,
  Hostel,
  Student,
  StudentFormData,
  DashboardStats,
  Pagination,
  SystemStatus,
} from '../types';

const TOKEN_KEY = 'vnit_hostel_admin_jwt';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && endpoint !== '/api/auth/login') {
      clearStoredToken();
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    const message = data.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ success: boolean; token: string; admin: AdminUser }> {
    const res = await request<{ success: boolean; token: string; admin: AdminUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async getCurrentAdmin(): Promise<{ success: boolean; admin: AdminUser }> {
    return request<{ success: boolean; admin: AdminUser }>('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      clearStoredToken();
    }
  },

  async updateProfile(data: { full_name?: string; email?: string; current_password?: string; new_password?: string }): Promise<{ success: boolean; admin: AdminUser }> {
    return request<{ success: boolean; admin: AdminUser }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Dashboard & Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await request<{ success: boolean; stats: DashboardStats }>('/api/dashboard/stats');
    return res.stats;
  },

  async getReportsSummary(): Promise<{ stats: DashboardStats; students: Student[]; generated_at: string; institution: string }> {
    return request('/api/reports/summary');
  },

  async getSystemStatus(): Promise<SystemStatus> {
    const res = await request<{ success: boolean; system: SystemStatus }>('/api/system/status');
    return res.system;
  },

  async reconnectDb(): Promise<SystemStatus> {
    const res = await request<{ success: boolean; system: SystemStatus }>('/api/system/reconnect-db', {
      method: 'POST',
    });
    return res.system;
  },

  // Hostels
  async getHostels(): Promise<Hostel[]> {
    const res = await request<{ success: boolean; hostels: Hostel[] }>('/api/hostels');
    return res.hostels;
  },

  async getHostelDetails(id: number): Promise<{ hostel: Hostel; students: Student[]; total_students: number }> {
    return request(`/api/hostels/${id}`);
  },

  async createHostel(data: Partial<Hostel>): Promise<Hostel> {
    const res = await request<{ success: boolean; hostel: Hostel }>('/api/hostels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.hostel;
  },

  async updateHostel(id: number, data: Partial<Hostel>): Promise<Hostel> {
    const res = await request<{ success: boolean; hostel: Hostel }>(`/api/hostels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.hostel;
  },

  // Students
  async getStudents(params: {
    page?: number;
    limit?: number;
    search?: string;
    hostel_id?: number | string;
    branch?: string;
    year_semester?: string;
    status?: string;
    course?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Student[]; pagination: Pagination }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'all') {
        query.append(key, String(value));
      }
    });

    return request<{ data: Student[]; pagination: Pagination }>(`/api/students?${query.toString()}`);
  },

  async getStudentById(id: number): Promise<Student> {
    const res = await request<{ success: boolean; student: Student }>(`/api/students/${id}`);
    return res.student;
  },

  async createStudent(data: StudentFormData): Promise<Student> {
    const res = await request<{ success: boolean; message: string; student: Student }>('/api/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.student;
  },

  async updateStudent(id: number, data: Partial<StudentFormData>): Promise<Student> {
    const res = await request<{ success: boolean; message: string; student: Student }>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.student;
  },

  async deleteStudent(id: number): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/students/${id}`, {
      method: 'DELETE',
    });
  },
};
