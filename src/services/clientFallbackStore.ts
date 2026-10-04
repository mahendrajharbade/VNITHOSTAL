import { AdminUser, Hostel, Student, StudentFormData, DashboardStats, Pagination } from '../types';

const STORAGE_KEY_STUDENTS = 'vnit_hostel_students_v1';
const STORAGE_KEY_HOSTELS = 'vnit_hostel_hostels_v1';

const DEFAULT_ADMIN: AdminUser = {
  id: 1,
  username: 'admin',
  email: 'admin@vnit.ac.in',
  full_name: 'Dr. Rajesh K. Sharma',
  role: 'Chief Warden & Admin',
  last_login: new Date().toISOString(),
};

const DEFAULT_HOSTELS: Hostel[] = [
  {
    id: 1,
    code: 'H-1',
    name: 'Hostel 1 (Mega Boys Hostel - Block A)',
    type: 'Boys',
    total_capacity: 450,
    warden_name: 'Prof. Arvind Deshmukh',
    warden_contact: '+91 98221 44521',
    warden_email: 'warden.h1@vnit.ac.in',
    location_description: 'Near South Campus Gate, Opposite Sports Complex',
    is_active: 1,
    student_count: 3,
  },
  {
    id: 2,
    code: 'H-2',
    name: 'Hostel 2 (Bhabha Bhavan)',
    type: 'Boys',
    total_capacity: 350,
    warden_name: 'Dr. Sanjay Patel',
    warden_contact: '+91 98221 44522',
    warden_email: 'warden.h2@vnit.ac.in',
    location_description: 'East Wing, Adjacent to Central Library',
    is_active: 1,
    student_count: 1,
  },
  {
    id: 3,
    code: 'H-3',
    name: 'Hostel 3 (Ramanujan Bhavan)',
    type: 'Boys',
    total_capacity: 300,
    warden_name: 'Dr. Manish Kulkarni',
    warden_contact: '+91 98221 44523',
    warden_email: 'warden.h3@vnit.ac.in',
    location_description: 'Central Quadrangle, Near Student Mess 2',
    is_active: 1,
    student_count: 2,
  },
  {
    id: 4,
    code: 'H-4',
    name: 'Hostel 4 (Kalpana Chawla Girls Hostel)',
    type: 'Girls',
    total_capacity: 400,
    warden_name: 'Dr. Pratibha Rao',
    warden_contact: '+91 98221 44524',
    warden_email: 'warden.h4@vnit.ac.in',
    location_description: 'North Campus, Secure Perimeter with Dedicated Gym',
    is_active: 1,
    student_count: 4,
  },
  {
    id: 5,
    code: 'H-5',
    name: 'Hostel 5 (Visvesvaraya PG & Research Block)',
    type: 'Co-ed',
    total_capacity: 250,
    warden_name: 'Prof. S. R. Nene',
    warden_contact: '+91 98221 44525',
    warden_email: 'warden.h5@vnit.ac.in',
    location_description: 'West Zone, Near Research Park and Innovation Centre',
    is_active: 1,
    student_count: 3,
  },
];

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 1,
    roll_number: 'BT22CSE018',
    full_name: 'Aarav Narendra Verma',
    father_name: 'Narendra Verma',
    mother_name: 'Sunita Verma',
    date_of_birth: '2004-05-14',
    gender: 'Male',
    mobile_number: '+91 98765 43210',
    email: 'aarav.verma@students.vnit.ac.in',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    year_semester: '3rd Year / Sem 6',
    hostel_id: 1,
    hostel_name: 'Hostel 1 (Mega Boys Hostel - Block A)',
    hostel_code: 'H-1',
    room_number: 'A-204',
    admission_date: '2022-08-10',
    address: 'Flat 402, Shivalik Residency, Shivaji Nagar, Pune, Maharashtra - 411005',
    emergency_contact_name: 'Narendra Verma (Father)',
    emergency_contact_number: '+91 98765 00001',
    status: 'Active',
    additional_remarks: 'Hostel Tech Committee Member; Mess Representative',
  },
  {
    id: 2,
    roll_number: 'BT22ECE042',
    full_name: 'Ananya Priya Nair',
    father_name: 'M. K. Nair',
    mother_name: 'Radhika Nair',
    date_of_birth: '2004-09-22',
    gender: 'Female',
    mobile_number: '+91 94231 78901',
    email: 'ananya.nair@students.vnit.ac.in',
    course: 'B.Tech',
    branch: 'Electronics & Communication Engineering',
    year_semester: '3rd Year / Sem 6',
    hostel_id: 4,
    hostel_name: 'Hostel 4 (Kalpana Chawla Girls Hostel)',
    hostel_code: 'H-4',
    room_number: 'KC-112',
    admission_date: '2022-08-11',
    address: '12, Rose Villa, MG Road, Ernakulam, Kochi, Kerala - 682016',
    emergency_contact_name: 'M. K. Nair (Father)',
    emergency_contact_number: '+91 94231 00002',
    status: 'Active',
    additional_remarks: 'Robotics Club Lead, Allotted single room on merit',
  },
  {
    id: 3,
    roll_number: 'BT23MEC009',
    full_name: 'Rohan Dilip Joshi',
    father_name: 'Dilip Joshi',
    mother_name: 'Manjusha Joshi',
    date_of_birth: '2005-02-18',
    gender: 'Male',
    mobile_number: '+91 91234 56780',
    email: 'rohan.joshi@students.vnit.ac.in',
    course: 'B.Tech',
    branch: 'Mechanical Engineering',
    year_semester: '2nd Year / Sem 4',
    hostel_id: 2,
    hostel_name: 'Hostel 2 (Bhabha Bhavan)',
    hostel_code: 'H-2',
    room_number: 'BB-301',
    admission_date: '2023-08-05',
    address: '78/B Saraswati Colony, Dombivli East, Thane, Maharashtra - 421201',
    emergency_contact_name: 'Dilip Joshi (Father)',
    emergency_contact_number: '+91 91234 00003',
    status: 'Active',
    additional_remarks: 'College Cricket Team Captain',
  },
  {
    id: 4,
    roll_number: 'BT23EEE055',
    full_name: 'Sneha Rameshwar Patil',
    father_name: 'Rameshwar Patil',
    mother_name: 'Kavita Patil',
    date_of_birth: '2005-11-03',
    gender: 'Female',
    mobile_number: '+91 95543 21987',
    email: 'sneha.patil@students.vnit.ac.in',
    course: 'B.Tech',
    branch: 'Electrical & Electronics Engineering',
    year_semester: '2nd Year / Sem 4',
    hostel_id: 4,
    hostel_name: 'Hostel 4 (Kalpana Chawla Girls Hostel)',
    hostel_code: 'H-4',
    room_number: 'KC-218',
    admission_date: '2023-08-06',
    address: 'Plot No. 14, Samarth Colony, Aurangabad, Maharashtra - 431001',
    emergency_contact_name: 'Rameshwar Patil (Father)',
    emergency_contact_number: '+91 95543 00004',
    status: 'Active',
    additional_remarks: 'Hostel Cultural Secretary',
  },
  {
    id: 5,
    roll_number: 'BT21CIV031',
    full_name: 'Kunal Vikram Rathore',
    father_name: 'Vikram Rathore',
    mother_name: 'Geeta Rathore',
    date_of_birth: '2003-07-29',
    gender: 'Male',
    mobile_number: '+91 97654 32189',
    email: 'kunal.rathore@students.vnit.ac.in',
    course: 'B.Tech',
    branch: 'Civil Engineering',
    year_semester: '4th Year / Sem 8',
    hostel_id: 3,
    hostel_name: 'Hostel 3 (Ramanujan Bhavan)',
    hostel_code: 'H-3',
    room_number: 'RB-108',
    admission_date: '2021-08-20',
    address: 'B-12 Malviya Nagar, Jaipur, Rajasthan - 302017',
    emergency_contact_name: 'Vikram Rathore (Father)',
    emergency_contact_number: '+91 97654 00005',
    status: 'Active',
    additional_remarks: 'Final year project coordinator; Placement placed',
  },
  {
    id: 6,
    roll_number: 'MT24CSE007',
    full_name: 'Devendra S. Baghel',
    father_name: 'Shivpal Baghel',
    mother_name: 'Kamla Baghel',
    date_of_birth: '2001-03-12',
    gender: 'Male',
    mobile_number: '+91 93214 56789',
    email: 'devendra.baghel@students.vnit.ac.in',
    course: 'M.Tech',
    branch: 'Computer Science & Engineering',
    year_semester: '1st Year / Sem 2',
    hostel_id: 5,
    hostel_name: 'Hostel 5 (Visvesvaraya PG & Research Block)',
    hostel_code: 'H-5',
    room_number: 'VP-205',
    admission_date: '2024-07-28',
    address: 'H.No. 441, Vijay Nagar, Indore, Madhya Pradesh - 452010',
    emergency_contact_name: 'Shivpal Baghel (Father)',
    emergency_contact_number: '+91 93214 00006',
    status: 'Active',
    additional_remarks: 'Teaching Assistant for CS101 Lab',
  },
  {
    id: 7,
    roll_number: 'BT24CHE015',
    full_name: 'Tanvi Anup Deshpande',
    father_name: 'Anup Deshpande',
    mother_name: 'Swati Deshpande',
    date_of_birth: '2006-04-19',
    gender: 'Female',
    mobile_number: '+91 98811 22334',
    email: 'tanvi.deshpande@students.vnit.ac.in',
    course: 'B.Tech',
    branch: 'Chemical Engineering',
    year_semester: '1st Year / Sem 2',
    hostel_id: 4,
    hostel_name: 'Hostel 4 (Kalpana Chawla Girls Hostel)',
    hostel_code: 'H-4',
    room_number: 'KC-005',
    admission_date: '2024-08-12',
    address: '204, Sneha Apartment, Dharampeth, Nagpur, Maharashtra - 440010',
    emergency_contact_name: 'Anup Deshpande (Father)',
    emergency_contact_number: '+91 98811 00007',
    status: 'Active',
    additional_remarks: 'First year fresher; Local guardian registered',
  },
  {
    id: 8,
    roll_number: 'BT22MET028',
    full_name: 'Aditya Mohan Iyer',
    father_name: 'Mohan Iyer',
    mother_name: 'Meenakshi Iyer',
    date_of_birth: '2004-12-08',
    gender: 'Male',
    mobile_number: '+91 97123 45678',
    email: 'aditya.iyer@students.vnit.ac.in',
    course: 'B.Tech',
    branch: 'Metallurgical & Materials Engineering',
    year_semester: '3rd Year / Sem 6',
    hostel_id: 1,
    hostel_name: 'Hostel 1 (Mega Boys Hostel - Block A)',
    hostel_code: 'H-1',
    room_number: 'A-315',
    admission_date: '2022-08-10',
    address: '501, Gokul Dham, Borivali West, Mumbai, Maharashtra - 400092',
    emergency_contact_name: 'Mohan Iyer (Father)',
    emergency_contact_number: '+91 97123 00008',
    status: 'Active',
    additional_remarks: 'NSS Volunteer & Blood Donation Camp Coordinator',
  },
  {
    id: 9,
    roll_number: 'PH23PHY002',
    full_name: 'Drishya Menon',
    father_name: 'K. P. Menon',
    mother_name: 'Shobha Menon',
    date_of_birth: '1999-08-15',
    gender: 'Female',
    mobile_number: '+91 98456 78912',
    email: 'drishya.menon@students.vnit.ac.in',
    course: 'Ph.D',
    branch: 'Applied Physics & Materials',
    year_semester: '2nd Year / Sem 4',
    hostel_id: 5,
    hostel_name: 'Hostel 5 (Visvesvaraya PG & Research Block)',
    hostel_code: 'H-5',
    room_number: 'VP-312',
    admission_date: '2023-01-15',
    address: 'Grace Villa, Kowdiar, Thiruvananthapuram, Kerala - 695003',
    emergency_contact_name: 'K. P. Menon (Father)',
    emergency_contact_number: '+91 98456 00009',
    status: 'Active',
    additional_remarks: 'DST INSPIRE Senior Research Fellow',
  },
  {
    id: 10,
    roll_number: 'BT21MEC047',
    full_name: 'Harshavardhan Raju',
    father_name: 'Venkat Raju',
    mother_name: 'Lakshmi Raju',
    date_of_birth: '2003-01-30',
    gender: 'Male',
    mobile_number: '+91 99887 76655',
    email: 'harsha.raju@students.vnit.ac.in',
    course: 'B.Tech',
    branch: 'Mechanical Engineering',
    year_semester: '4th Year / Sem 8',
    hostel_id: 2,
    hostel_name: 'Hostel 2 (Bhabha Bhavan)',
    hostel_code: 'H-2',
    room_number: 'BB-410',
    admission_date: '2021-08-20',
    address: 'Plot 88, Jubilee Hills Road No. 36, Hyderabad, Telangana - 500033',
    emergency_contact_name: 'Venkat Raju (Father)',
    emergency_contact_number: '+91 99887 00010',
    status: 'Inactive',
    additional_remarks: 'Internship semester at DRDO Bengaluru; Room temporarily vacated',
  },
  {
    id: 11,
    roll_number: 'BT23CSE089',
    full_name: 'Pooja Girish Kulkarni',
    father_name: 'Girish Kulkarni',
    mother_name: 'Archana Kulkarni',
    date_of_birth: '2005-06-25',
    gender: 'Female',
    mobile_number: '+91 94220 12345',
    email: 'pooja.kulkarni@students.vnit.ac.in',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    year_semester: '2nd Year / Sem 4',
    hostel_id: 4,
    hostel_name: 'Hostel 4 (Kalpana Chawla Girls Hostel)',
    hostel_code: 'H-4',
    room_number: 'KC-304',
    admission_date: '2023-08-05',
    address: 'Block 7, Shanti Heights, Kothrud, Pune, Maharashtra - 411038',
    emergency_contact_name: 'Girish Kulkarni (Father)',
    emergency_contact_number: '+91 94220 00011',
    status: 'Active',
    additional_remarks: 'ACM Student Chapter Secretary',
  },
  {
    id: 12,
    roll_number: 'BT22MIN012',
    full_name: 'Siddharth Manoj Pandey',
    father_name: 'Manoj Pandey',
    mother_name: 'Rekha Pandey',
    date_of_birth: '2004-03-17',
    gender: 'Male',
    mobile_number: '+91 91345 67890',
    email: 'siddharth.pandey@students.vnit.ac.in',
    course: 'B.Tech',
    branch: 'Mining Engineering',
    year_semester: '3rd Year / Sem 6',
    hostel_id: 3,
    hostel_name: 'Hostel 3 (Ramanujan Bhavan)',
    hostel_code: 'H-3',
    room_number: 'RB-214',
    admission_date: '2022-08-10',
    address: '120, Civil Lines, Bilaspur, Chhattisgarh - 495001',
    emergency_contact_name: 'Manoj Pandey (Father)',
    emergency_contact_number: '+91 91345 00012',
    status: 'Active',
    additional_remarks: 'Mess Committee Treasurer',
  },
  {
    id: 13,
    roll_number: 'BT24ECE061',
    full_name: 'Varun Alok Sen',
    father_name: 'Alok Sen',
    mother_name: 'Rupali Sen',
    date_of_birth: '2006-10-05',
    gender: 'Male',
    mobile_number: '+91 98198 12345',
    email: 'varun.sen@students.vnit.ac.in',
    course: 'B.Tech',
    branch: 'Electronics & Communication Engineering',
    year_semester: '1st Year / Sem 2',
    hostel_id: 1,
    hostel_name: 'Hostel 1 (Mega Boys Hostel - Block A)',
    hostel_code: 'H-1',
    room_number: 'A-110',
    admission_date: '2024-08-12',
    address: 'Flat 302, Lake Town Block B, Kolkata, West Bengal - 700089',
    emergency_contact_name: 'Alok Sen (Father)',
    emergency_contact_number: '+91 98198 00013',
    status: 'Active',
    additional_remarks: 'Freshman representative; Swimming team',
  },
  {
    id: 14,
    roll_number: 'BT21EEE020',
    full_name: 'Nikhil Bharat Gaikwad',
    father_name: 'Bharat Gaikwad',
    mother_name: 'Mangala Gaikwad',
    date_of_birth: '2003-09-09',
    gender: 'Male',
    mobile_number: '+91 93710 44556',
    email: 'nikhil.gaikwad@students.vnit.ac.in',
    course: 'B.Tech',
    branch: 'Electrical & Electronics Engineering',
    year_semester: '4th Year / Sem 8',
    hostel_id: 2,
    hostel_name: 'Hostel 2 (Bhabha Bhavan)',
    hostel_code: 'H-2',
    room_number: 'BB-118',
    admission_date: '2021-08-20',
    address: '45 Anand Nagar, Jail Road, Nashik, Maharashtra - 422101',
    emergency_contact_name: 'Bharat Gaikwad (Father)',
    emergency_contact_number: '+91 93710 00014',
    status: 'Inactive',
    additional_remarks: 'Graduation formalities completed; Pending final deposit clearance',
  },
  {
    id: 15,
    roll_number: 'MS23CHE005',
    full_name: 'Meera Raghavan',
    father_name: 'K. Raghavan',
    mother_name: 'Sita Raghavan',
    date_of_birth: '2002-04-11',
    gender: 'Female',
    mobile_number: '+91 94441 55667',
    email: 'meera.raghavan@students.vnit.ac.in',
    course: 'M.Sc',
    branch: 'Applied Chemistry',
    year_semester: '2nd Year / Sem 4',
    hostel_id: 5,
    hostel_name: 'Hostel 5 (Visvesvaraya PG & Research Block)',
    hostel_code: 'H-5',
    room_number: 'VP-108',
    admission_date: '2023-08-10',
    address: '33, 4th Main Road, Gandhi Nagar, Adyar, Chennai, Tamil Nadu - 600020',
    emergency_contact_name: 'K. Raghavan (Father)',
    emergency_contact_number: '+91 94441 00015',
    status: 'Active',
    additional_remarks: 'Research project on green catalysis; Quiet hours compliant',
  },
];

class ClientFallbackStore {
  private getStoredStudents(): Student[] {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
      return [...DEFAULT_STUDENTS];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_STUDENTS];
    }
  }

  private saveStudents(students: Student[]) {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  }

  private getStoredHostels(): Hostel[] {
    const raw = localStorage.getItem(STORAGE_KEY_HOSTELS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_HOSTELS, JSON.stringify(DEFAULT_HOSTELS));
      return [...DEFAULT_HOSTELS];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_HOSTELS];
    }
  }

  private saveHostels(hostels: Hostel[]) {
    localStorage.setItem(STORAGE_KEY_HOSTELS, JSON.stringify(hostels));
  }

  public login(username: string, pass: string): { success: boolean; token: string; admin: AdminUser } {
    const cleanUser = username.trim().toLowerCase();
    if (
      (cleanUser === 'admin' || cleanUser === 'admin@vnit.ac.in') &&
      (pass === 'Jaymaatapti' || pass === 'Admin@vnit2026')
    ) {
      const token = 'vnit_fallback_jwt_demo_' + Date.now();
      return {
        success: true,
        token,
        admin: { ...DEFAULT_ADMIN },
      };
    }
    throw new Error('Invalid credentials. Please verify your username/email and password.');
  }

  public getCurrentAdmin(): { success: boolean; admin: AdminUser } {
    return { success: true, admin: { ...DEFAULT_ADMIN } };
  }

  public getHostels(): Hostel[] {
    const hostels = this.getStoredHostels();
    const students = this.getStoredStudents();
    return hostels.map((h) => ({
      ...h,
      student_count: students.filter((s) => s.hostel_id === h.id && s.status === 'Active').length,
    }));
  }

  public createHostel(data: Partial<Hostel>): Hostel {
    const hostels = this.getStoredHostels();
    const newHostel: Hostel = {
      id: Date.now(),
      code: (data.code || 'H-NEW').toUpperCase(),
      name: data.name || 'New Hostel',
      type: data.type || 'Boys',
      total_capacity: Number(data.total_capacity) || 300,
      warden_name: data.warden_name || 'Dr. Warden',
      warden_contact: data.warden_contact || '+91 98221 00000',
      warden_email: data.warden_email || 'warden@vnit.ac.in',
      location_description: data.location_description || '',
      is_active: 1,
      student_count: 0,
    };
    hostels.push(newHostel);
    this.saveHostels(hostels);
    return newHostel;
  }

  public getStudents(params: any): { data: Student[]; pagination: Pagination } {
    let students = this.getStoredStudents();
    const hostels = this.getStoredHostels();

    if (params.search) {
      const q = params.search.toLowerCase();
      students = students.filter(
        (s) =>
          s.roll_number.toLowerCase().includes(q) ||
          s.full_name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.mobile_number.includes(q) ||
          s.room_number.toLowerCase().includes(q)
      );
    }
    if (params.hostel_id && params.hostel_id !== 'all') {
      students = students.filter((s) => s.hostel_id === Number(params.hostel_id));
    }
    if (params.branch && params.branch !== 'all') {
      students = students.filter((s) => s.branch === params.branch);
    }
    if (params.year_semester && params.year_semester !== 'all') {
      students = students.filter((s) => s.year_semester === params.year_semester);
    }
    if (params.status && params.status !== 'all') {
      students = students.filter((s) => s.status === params.status);
    }

    const total = students.length;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;

    const populated = students.map((s) => {
      const h = hostels.find((hostel) => hostel.id === s.hostel_id);
      return {
        ...s,
        hostel_name: h?.name || `Hostel ${s.hostel_id}`,
        hostel_code: h?.code || '',
      };
    });

    const paginated = populated.slice(offset, offset + limit);

    return {
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  public getStudentById(id: number): Student {
    const students = this.getStoredStudents();
    const hostels = this.getStoredHostels();
    const found = students.find((s) => s.id === id);
    if (!found) throw new Error(`Student #${id} not found`);
    const h = hostels.find((hostel) => hostel.id === found.hostel_id);
    return {
      ...found,
      hostel_name: h?.name || `Hostel ${found.hostel_id}`,
      hostel_code: h?.code || '',
      warden_name: h?.warden_name,
      warden_contact: h?.warden_contact,
    };
  }

  public createStudent(data: StudentFormData): Student {
    const students = this.getStoredStudents();
    const hostels = this.getStoredHostels();

    const exists = students.some(
      (s) => s.roll_number.toUpperCase() === data.roll_number.trim().toUpperCase()
    );
    if (exists) {
      throw new Error(`Roll Number '${data.roll_number}' is already registered in the system.`);
    }

    const h = hostels.find((hostel) => hostel.id === Number(data.hostel_id));

    const newStudent: Student = {
      ...data,
      id: Date.now(),
      roll_number: data.roll_number.trim().toUpperCase(),
      full_name: data.full_name.trim(),
      father_name: data.father_name.trim(),
      mother_name: data.mother_name.trim(),
      hostel_id: Number(data.hostel_id),
      hostel_name: h?.name,
      hostel_code: h?.code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    students.unshift(newStudent);
    this.saveStudents(students);
    return newStudent;
  }

  public updateStudent(id: number, data: Partial<StudentFormData>): Student {
    const students = this.getStoredStudents();
    const hostels = this.getStoredHostels();
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Student not found');

    const h = data.hostel_id ? hostels.find((hostel) => hostel.id === Number(data.hostel_id)) : undefined;

    students[index] = {
      ...students[index],
      ...data,
      hostel_name: h?.name || students[index].hostel_name,
      hostel_code: h?.code || students[index].hostel_code,
      updated_at: new Date().toISOString(),
    };

    this.saveStudents(students);
    return students[index];
  }

  public deleteStudent(id: number): { success: boolean; message: string } {
    const students = this.getStoredStudents();
    const updated = students.filter((s) => s.id !== id);
    this.saveStudents(updated);
    return { success: true, message: 'Student record deleted successfully.' };
  }

  public getDashboardStats(): DashboardStats {
    const students = this.getStoredStudents();
    const hostels = this.getHostels();

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'Active').length;
    const inactiveStudents = totalStudents - activeStudents;

    const hostelStats = hostels.map((h) => ({
      id: h.id,
      code: h.code,
      name: h.name,
      type: h.type,
      student_count: h.student_count || 0,
      capacity: h.total_capacity,
      occupancy_rate: Math.round(((h.student_count || 0) / h.total_capacity) * 100),
      warden_name: h.warden_name,
    }));

    const branchCounts: Record<string, number> = {};
    for (const s of students) {
      branchCounts[s.branch] = (branchCounts[s.branch] || 0) + 1;
    }
    const branchStats = Object.entries(branchCounts)
      .map(([branch, count]) => ({ branch, count }))
      .sort((a, b) => b.count - a.count);

    const recentStudents = [...students].slice(0, 6);

    return {
      totalStudents,
      totalHostels: hostels.length,
      activeStudents,
      inactiveStudents,
      hostelStats,
      branchStats,
      recentStudents,
    };
  }
}

export const clientFallbackStore = new ClientFallbackStore();
