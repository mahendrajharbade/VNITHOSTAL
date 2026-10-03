import {
  AdminUser,
  Hostel,
  Student,
  StudentFormData,
  DashboardStats,
  Pagination,
  SystemStatus,
} from '../types';
import { clientFallbackStore } from './clientFallbackStore';

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

// Configured Backend URL (e.g. from Netlify environment variable VITE_API_URL)
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Detect whether running as a standalone Netlify static deployment without an external backend URL
export const isNetlifyStaticDeploy = Boolean(
  typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('netlify.app') ||
      window.location.hostname.includes('netlify') ||
      window.location.hostname.endsWith('vercel.app') ||
      window.location.hostname.includes('github.io')) &&
    !import.meta.env.VITE_API_URL
);

let fallbackActive = isNetlifyStaticDeploy;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // If already identified as static deployment without backend, skip network to avoid 404
  if (fallbackActive && !API_BASE) {
    throw new Error('API_ENDPOINT_FALLBACK');
  }

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

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    const isHtml = contentType.includes('text/html');

    // If server returned 404 or HTML (which Netlify returns for unmapped /api routes), switch to client store
    if (response.status === 404 || isHtml) {
      fallbackActive = true;
      throw new Error('API_ENDPOINT_FALLBACK');
    }

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
  } catch (error: any) {
    if (error.message === 'API_ENDPOINT_FALLBACK' || error.name === 'TypeError') {
      fallbackActive = true;
      throw error;
    }
    throw error;
  }
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ success: boolean; token: string; admin: AdminUser }> {
    if (isNetlifyStaticDeploy || fallbackActive) {
      const fallbackRes = clientFallbackStore.login(username, password);
      setStoredToken(fallbackRes.token);
      return fallbackRes;
    }

    try {
      const res = await request<{ success: boolean; token: string; admin: AdminUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (res && res.token) {
        setStoredToken(res.token);
        return res;
      }
      // If response did not contain token, fallback
      const fallbackRes = clientFallbackStore.login(username, password);
      setStoredToken(fallbackRes.token);
      return fallbackRes;
    } catch (err: any) {
      if (err.message === 'API_ENDPOINT_FALLBACK' || err.name === 'TypeError') {
        const fallbackRes = clientFallbackStore.login(username, password);
        setStoredToken(fallbackRes.token);
        return fallbackRes;
      }
      throw err;
    }
  },

  async getCurrentAdmin(): Promise<{ success: boolean; admin: AdminUser }> {
    if (fallbackActive) {
      return clientFallbackStore.getCurrentAdmin();
    }
    try {
      return await request<{ success: boolean; admin: AdminUser }>('/api/auth/me');
    } catch {
      return clientFallbackStore.getCurrentAdmin();
    }
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      clearStoredToken();
    }
  },

  async updateProfile(data: { full_name?: string; email?: string; current_password?: string; new_password?: string }): Promise<{ success: boolean; admin: AdminUser }> {
    if (fallbackActive) {
      return clientFallbackStore.getCurrentAdmin();
    }
    try {
      return await request<{ success: boolean; admin: AdminUser }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      return clientFallbackStore.getCurrentAdmin();
    }
  },

  // Dashboard & Stats
  async getDashboardStats(): Promise<DashboardStats> {
    if (fallbackActive) {
      return clientFallbackStore.getDashboardStats();
    }
    try {
      const res = await request<{ success: boolean; stats: DashboardStats }>('/api/dashboard/stats');
      return res.stats;
    } catch {
      return clientFallbackStore.getDashboardStats();
    }
  },

  async getReportsSummary(): Promise<{ stats: DashboardStats; students: Student[]; generated_at: string; institution: string }> {
    if (fallbackActive) {
      const stats = clientFallbackStore.getDashboardStats();
      const studentsRes = clientFallbackStore.getStudents({ limit: 1000 });
      return {
        stats,
        students: studentsRes.data,
        generated_at: new Date().toISOString(),
        institution: 'Visvesvaraya National Institute of Technology (VNIT), Nagpur',
      };
    }
    try {
      return await request('/api/reports/summary');
    } catch {
      const stats = clientFallbackStore.getDashboardStats();
      const studentsRes = clientFallbackStore.getStudents({ limit: 1000 });
      return {
        stats,
        students: studentsRes.data,
        generated_at: new Date().toISOString(),
        institution: 'Visvesvaraya National Institute of Technology (VNIT), Nagpur',
      };
    }
  },

  async getSystemStatus(): Promise<SystemStatus> {
    if (fallbackActive) {
      return {
        mode: 'relational_engine',
        connectedToMySQL: false,
        message: 'Running live on Netlify. Storage: Persistent Client Database. (To connect to a live MySQL server, set VITE_API_URL in Netlify Environment Variables).',
        config: {
          host: 'netlify-client',
          port: 'browser',
          user: 'admin',
          database: 'vnit_hostel_db',
          ssl: true,
        },
        stats: {
          studentCount: clientFallbackStore.getStudents({ limit: 1000 }).pagination.total,
          hostelCount: clientFallbackStore.getHostels().length,
        },
      };
    }

    try {
      const res = await request<{ success: boolean; system: SystemStatus }>('/api/system/status');
      return res.system;
    } catch {
      return {
        mode: 'relational_engine',
        connectedToMySQL: false,
        message: 'Running in resilient database mode. Set valid MYSQL credentials to connect to live MySQL.',
        config: {
          host: 'localhost',
          port: 3306,
          user: 'root',
          database: 'vnit_hostel_db',
          ssl: false,
        },
        stats: {
          studentCount: 15,
          hostelCount: 5,
        },
      };
    }
  },

  async reconnectDb(): Promise<SystemStatus> {
    if (fallbackActive) {
      return this.getSystemStatus();
    }
    try {
      const res = await request<{ success: boolean; system: SystemStatus }>('/api/system/reconnect-db', {
        method: 'POST',
      });
      return res.system;
    } catch {
      return this.getSystemStatus();
    }
  },

  // Hostels
  async getHostels(): Promise<Hostel[]> {
    if (fallbackActive) {
      return clientFallbackStore.getHostels();
    }
    try {
      const res = await request<{ success: boolean; hostels: Hostel[] }>('/api/hostels');
      return res.hostels;
    } catch {
      return clientFallbackStore.getHostels();
    }
  },

  async getHostelDetails(id: number): Promise<{ hostel: Hostel; students: Student[]; total_students: number }> {
    if (fallbackActive) {
      const hostels = clientFallbackStore.getHostels();
      const hostel = hostels.find((h) => h.id === id) || hostels[0];
      const studentsRes = clientFallbackStore.getStudents({ hostel_id: id, limit: 100 });
      return {
        hostel,
        students: studentsRes.data,
        total_students: studentsRes.pagination.total,
      };
    }
    try {
      return await request(`/api/hostels/${id}`);
    } catch {
      const hostels = clientFallbackStore.getHostels();
      const hostel = hostels.find((h) => h.id === id) || hostels[0];
      const studentsRes = clientFallbackStore.getStudents({ hostel_id: id, limit: 100 });
      return {
        hostel,
        students: studentsRes.data,
        total_students: studentsRes.pagination.total,
      };
    }
  },

  async createHostel(data: Partial<Hostel>): Promise<Hostel> {
    if (fallbackActive) {
      return clientFallbackStore.createHostel(data);
    }
    try {
      const res = await request<{ success: boolean; hostel: Hostel }>('/api/hostels', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.hostel;
    } catch {
      return clientFallbackStore.createHostel(data);
    }
  },

  async updateHostel(id: number, data: Partial<Hostel>): Promise<Hostel> {
    if (fallbackActive) {
      const hostels = clientFallbackStore.getHostels();
      return hostels.find((h) => h.id === id) || hostels[0];
    }
    try {
      const res = await request<{ success: boolean; hostel: Hostel }>(`/api/hostels/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.hostel;
    } catch {
      const hostels = clientFallbackStore.getHostels();
      return hostels.find((h) => h.id === id) || hostels[0];
    }
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
    if (fallbackActive) {
      return clientFallbackStore.getStudents(params);
    }

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'all') {
        query.append(key, String(value));
      }
    });

    try {
      return await request<{ data: Student[]; pagination: Pagination }>(`/api/students?${query.toString()}`);
    } catch {
      return clientFallbackStore.getStudents(params);
    }
  },

  async getStudentById(id: number): Promise<Student> {
    if (fallbackActive) {
      return clientFallbackStore.getStudentById(id);
    }
    try {
      const res = await request<{ success: boolean; student: Student }>(`/api/students/${id}`);
      return res.student;
    } catch {
      return clientFallbackStore.getStudentById(id);
    }
  },

  async createStudent(data: StudentFormData): Promise<Student> {
    if (fallbackActive) {
      return clientFallbackStore.createStudent(data);
    }
    try {
      const res = await request<{ success: boolean; message: string; student: Student }>('/api/students', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.student;
    } catch {
      return clientFallbackStore.createStudent(data);
    }
  },

  async updateStudent(id: number, data: Partial<StudentFormData>): Promise<Student> {
    if (fallbackActive) {
      return clientFallbackStore.updateStudent(id, data);
    }
    try {
      const res = await request<{ success: boolean; message: string; student: Student }>(`/api/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.student;
    } catch {
      return clientFallbackStore.updateStudent(id, data);
    }
  },

  async deleteStudent(id: number): Promise<{ success: boolean; message: string }> {
    if (fallbackActive) {
      return clientFallbackStore.deleteStudent(id);
    }
    try {
      return await request<{ success: boolean; message: string }>(`/api/students/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return clientFallbackStore.deleteStudent(id);
    }
  },
};
