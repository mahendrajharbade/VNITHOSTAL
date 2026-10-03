import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { AdminUser, Hostel, Student, StudentFilterQuery, PaginatedResult, DashboardStats } from '../types.js';

dotenv.config();

// Admin and Hostel Warden bcrypt hashes
const DEFAULT_ADMIN_PASSWORD_HASH = bcrypt.hashSync('Admin@vnit2026', 10);
const HOSTEL_1_PASSWORD_HASH = bcrypt.hashSync('Hostel1@2026', 10);
const HOSTEL_2_PASSWORD_HASH = bcrypt.hashSync('Hostel2@2026', 10);
const HOSTEL_3_PASSWORD_HASH = bcrypt.hashSync('Hostel3@2026', 10);
const HOSTEL_4_PASSWORD_HASH = bcrypt.hashSync('Hostel4@2026', 10);
const HOSTEL_5_PASSWORD_HASH = bcrypt.hashSync('Hostel5@2026', 10);

// Preconfigured Admin and 5 Hostel Warden accounts
const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@vnit.ac.in',
    password_hash: DEFAULT_ADMIN_PASSWORD_HASH,
    full_name: 'Dr. Rajesh K. Sharma',
    role: 'Chief Warden & Admin',
    hostel_id: null,
    last_login: new Date().toISOString(),
    created_at: new Date('2023-01-01').toISOString(),
  },
  {
    id: 2,
    username: 'warden.h1',
    email: 'warden.h1@vnit.ac.in',
    password_hash: HOSTEL_1_PASSWORD_HASH,
    full_name: 'Prof. Arvind Deshmukh',
    role: 'Hostel 1 Warden (Mega Boys)',
    hostel_id: 1,
    last_login: null,
    created_at: new Date('2023-01-01').toISOString(),
  },
  {
    id: 3,
    username: 'warden.h2',
    email: 'warden.h2@vnit.ac.in',
    password_hash: HOSTEL_2_PASSWORD_HASH,
    full_name: 'Dr. Sanjay Patel',
    role: 'Hostel 2 Warden (Bhabha Bhavan)',
    hostel_id: 2,
    last_login: null,
    created_at: new Date('2023-01-01').toISOString(),
  },
  {
    id: 4,
    username: 'warden.h3',
    email: 'warden.h3@vnit.ac.in',
    password_hash: HOSTEL_3_PASSWORD_HASH,
    full_name: 'Dr. Manish Kulkarni',
    role: 'Hostel 3 Warden (Ramanujan Bhavan)',
    hostel_id: 3,
    last_login: null,
    created_at: new Date('2023-01-01').toISOString(),
  },
  {
    id: 5,
    username: 'warden.h4',
    email: 'warden.h4@vnit.ac.in',
    password_hash: HOSTEL_4_PASSWORD_HASH,
    full_name: 'Dr. Pratibha Rao',
    role: 'Hostel 4 Warden (Kalpana Chawla Girls)',
    hostel_id: 4,
    last_login: null,
    created_at: new Date('2023-01-01').toISOString(),
  },
  {
    id: 6,
    username: 'warden.h5',
    email: 'warden.h5@vnit.ac.in',
    password_hash: HOSTEL_5_PASSWORD_HASH,
    full_name: 'Prof. S. R. Nene',
    role: 'Hostel 5 Warden (PG & Research)',
    hostel_id: 5,
    last_login: null,
    created_at: new Date('2023-01-01').toISOString(),
  },
];

// Initial fallback hostels
const INITIAL_HOSTELS: Hostel[] = [
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
    created_at: new Date('2023-01-01').toISOString(),
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
    created_at: new Date('2023-01-01').toISOString(),
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
    created_at: new Date('2023-01-01').toISOString(),
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
    created_at: new Date('2023-01-01').toISOString(),
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
    created_at: new Date('2023-01-01').toISOString(),
  },
];

// Initial fallback students
const INITIAL_STUDENTS: Student[] = [
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
    created_at: '2022-08-10T10:00:00Z',
    updated_at: '2022-08-10T10:00:00Z',
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
    created_at: '2022-08-11T11:00:00Z',
    updated_at: '2022-08-11T11:00:00Z',
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
    created_at: '2023-08-05T09:30:00Z',
    updated_at: '2023-08-05T09:30:00Z',
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
    created_at: '2023-08-06T14:15:00Z',
    updated_at: '2023-08-06T14:15:00Z',
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
    created_at: '2021-08-20T10:00:00Z',
    updated_at: '2021-08-20T10:00:00Z',
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
    created_at: '2024-07-28T09:00:00Z',
    updated_at: '2024-07-28T09:00:00Z',
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
    created_at: '2024-08-12T11:45:00Z',
    updated_at: '2024-08-12T11:45:00Z',
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
    created_at: '2022-08-10T12:00:00Z',
    updated_at: '2022-08-10T12:00:00Z',
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
    created_at: '2023-01-15T15:20:00Z',
    updated_at: '2023-01-15T15:20:00Z',
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
    created_at: '2021-08-20T14:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
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
    created_at: '2023-08-05T13:00:00Z',
    updated_at: '2023-08-05T13:00:00Z',
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
    created_at: '2022-08-10T16:00:00Z',
    updated_at: '2022-08-10T16:00:00Z',
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
    created_at: '2024-08-12T14:30:00Z',
    updated_at: '2024-08-12T14:30:00Z',
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
    created_at: '2021-08-20T11:00:00Z',
    updated_at: '2024-05-15T09:00:00Z',
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
    created_at: '2023-08-10T10:00:00Z',
    updated_at: '2023-08-10T10:00:00Z',
  },
];

class DatabaseService {
  private pool: Pool | null = null;
  public isConnectedToMySQL = false;
  public connectionStatusMessage = 'Initializing...';
  
  // In-memory fallback relational storage
  private fallbackAdmins: AdminUser[] = [...INITIAL_ADMINS];
  private fallbackHostels: Hostel[] = [...INITIAL_HOSTELS];
  private fallbackStudents: Student[] = [...INITIAL_STUDENTS];
  private nextStudentId = 16;
  private nextHostelId = 6;

  constructor() {
    this.initDatabase();
  }

  public async initDatabase(): Promise<void> {
    const host = process.env.MYSQL_HOST || 'localhost';
    const port = Number(process.env.MYSQL_PORT) || 3306;
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const database = process.env.MYSQL_DATABASE || 'vnit_hostel_db';
    const ssl = process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

    // Only attempt to connect to MySQL if configured with user & host
    try {
      this.pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        ssl,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 3000,
      });

      // Test connection
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();

      this.isConnectedToMySQL = true;
      this.connectionStatusMessage = `Connected to MySQL database [${database}] on ${host}:${port}`;
      console.log(`[Database] ${this.connectionStatusMessage}`);

      // Ensure tables exist in MySQL
      await this.ensureMySQLSchema();
    } catch (error: any) {
      this.isConnectedToMySQL = false;
      this.pool = null;
      this.connectionStatusMessage = `MySQL Server (${host}:${port}) not reachable (${error?.code || error?.message || 'Connection refused'}). Running with built-in relational SQL engine.`;
      console.warn(`[Database] ${this.connectionStatusMessage}`);
      console.info(`[Database] Notice: Set valid MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD in .env to connect to live MySQL instance.`);
    }
  }

  private async ensureMySQLSchema(): Promise<void> {
    if (!this.pool) return;
    try {
      // 1. Admins table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(100) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'Super Admin',
          hostel_id INT NULL,
          last_login DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_admin_email (email),
          INDEX idx_admin_username (username),
          INDEX idx_admin_hostel (hostel_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 2. Hostels table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS hostels (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(20) NOT NULL UNIQUE,
          name VARCHAR(100) NOT NULL,
          type ENUM('Boys', 'Girls', 'Co-ed') NOT NULL DEFAULT 'Boys',
          total_capacity INT NOT NULL DEFAULT 350,
          warden_name VARCHAR(100) NOT NULL,
          warden_contact VARCHAR(20) NOT NULL,
          warden_email VARCHAR(100) NOT NULL,
          location_description TEXT NULL,
          is_active TINYINT(1) NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_hostel_code (code),
          INDEX idx_hostel_type (type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 3. Students table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS students (
          id INT AUTO_INCREMENT PRIMARY KEY,
          roll_number VARCHAR(30) NOT NULL UNIQUE,
          full_name VARCHAR(100) NOT NULL,
          father_name VARCHAR(100) NOT NULL,
          mother_name VARCHAR(100) NOT NULL,
          date_of_birth DATE NOT NULL,
          gender ENUM('Male', 'Female', 'Other') NOT NULL,
          mobile_number VARCHAR(20) NOT NULL,
          email VARCHAR(100) NOT NULL,
          course VARCHAR(50) NOT NULL,
          branch VARCHAR(100) NOT NULL,
          year_semester VARCHAR(50) NOT NULL,
          hostel_id INT NOT NULL,
          room_number VARCHAR(30) NOT NULL,
          admission_date DATE NOT NULL,
          address TEXT NOT NULL,
          emergency_contact_name VARCHAR(100) NOT NULL,
          emergency_contact_number VARCHAR(20) NOT NULL,
          status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
          additional_remarks TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT fk_students_hostel FOREIGN KEY (hostel_id) REFERENCES hostels (id) ON UPDATE CASCADE ON DELETE RESTRICT,
          INDEX idx_student_roll (roll_number),
          INDEX idx_student_name (full_name),
          INDEX idx_student_hostel (hostel_id),
          INDEX idx_student_branch (branch),
          INDEX idx_student_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Check if admin exists
      const [adminRows] = await this.pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM admins');
      if (adminRows[0]?.count === 0) {
        for (const a of INITIAL_ADMINS) {
          await this.pool.query(
            `INSERT INTO admins (id, username, email, password_hash, full_name, role, hostel_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [a.id, a.username, a.email, a.password_hash, a.full_name, a.role, a.hostel_id ?? null]
          );
        }
      }

      // Check if hostels exist
      const [hostelRows] = await this.pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM hostels');
      if (hostelRows[0]?.count === 0) {
        for (const h of INITIAL_HOSTELS) {
          await this.pool.query(
            `INSERT INTO hostels (id, code, name, type, total_capacity, warden_name, warden_contact, warden_email, location_description, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [h.id, h.code, h.name, h.type, h.total_capacity, h.warden_name, h.warden_contact, h.warden_email, h.location_description, 1]
          );
        }
      }

      // Check if students exist
      const [studentRows] = await this.pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM students');
      if (studentRows[0]?.count === 0) {
        for (const s of INITIAL_STUDENTS) {
          await this.pool.query(
            `INSERT INTO students (id, roll_number, full_name, father_name, mother_name, date_of_birth, gender, mobile_number, email, course, branch, year_semester, hostel_id, room_number, admission_date, address, emergency_contact_name, emergency_contact_number, status, additional_remarks)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [s.id, s.roll_number, s.full_name, s.father_name, s.mother_name, s.date_of_birth, s.gender, s.mobile_number, s.email, s.course, s.branch, s.year_semester, s.hostel_id, s.room_number, s.admission_date, s.address, s.emergency_contact_name, s.emergency_contact_number, s.status, s.additional_remarks || '']
          );
        }
      }
      console.log('[Database] MySQL tables verified and seeded.');
    } catch (err) {
      console.error('[Database] Schema verification error on MySQL:', err);
    }
  }

  // --------------------------------------------------------------------------
  // Admin Authentication Operations
  // --------------------------------------------------------------------------
  public async getAdminByIdentifier(identifier: string): Promise<AdminUser | null> {
    if (this.isConnectedToMySQL && this.pool) {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        'SELECT * FROM admins WHERE username = ? OR email = ? LIMIT 1',
        [identifier, identifier]
      );
      return (rows[0] as AdminUser) || null;
    }

    const found = this.fallbackAdmins.find(
      (a) => a.username.toLowerCase() === identifier.toLowerCase() || a.email.toLowerCase() === identifier.toLowerCase()
    );
    return found ? { ...found } : null;
  }

  public async getAdminById(id: number): Promise<AdminUser | null> {
    if (this.isConnectedToMySQL && this.pool) {
      const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM admins WHERE id = ? LIMIT 1', [id]);
      return (rows[0] as AdminUser) || null;
    }
    const found = this.fallbackAdmins.find((a) => a.id === id);
    return found ? { ...found } : null;
  }

  public async updateAdminLastLogin(id: number): Promise<void> {
    const now = new Date().toISOString();
    if (this.isConnectedToMySQL && this.pool) {
      await this.pool.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [id]);
      return;
    }
    const admin = this.fallbackAdmins.find((a) => a.id === id);
    if (admin) admin.last_login = now;
  }

  public async updateAdminProfile(id: number, data: { full_name?: string; email?: string; password_hash?: string }): Promise<AdminUser> {
    if (this.isConnectedToMySQL && this.pool) {
      const updates: string[] = [];
      const values: any[] = [];
      if (data.full_name) {
        updates.push('full_name = ?');
        values.push(data.full_name);
      }
      if (data.email) {
        updates.push('email = ?');
        values.push(data.email);
      }
      if (data.password_hash) {
        updates.push('password_hash = ?');
        values.push(data.password_hash);
      }
      values.push(id);
      await this.pool.query(`UPDATE admins SET ${updates.join(', ')} WHERE id = ?`, values);
      const admin = await this.getAdminById(id);
      if (!admin) throw new Error('Admin not found after update');
      return admin;
    }

    const admin = this.fallbackAdmins.find((a) => a.id === id);
    if (!admin) throw new Error('Admin not found');
    if (data.full_name) admin.full_name = data.full_name;
    if (data.email) admin.email = data.email;
    if (data.password_hash) admin.password_hash = data.password_hash;
    admin.updated_at = new Date().toISOString();
    return { ...admin };
  }

  // --------------------------------------------------------------------------
  // Hostel Operations
  // --------------------------------------------------------------------------
  public async getHostels(): Promise<Hostel[]> {
    if (this.isConnectedToMySQL && this.pool) {
      const query = `
        SELECT h.*, COUNT(s.id) as student_count
        FROM hostels h
        LEFT JOIN students s ON s.hostel_id = h.id AND s.status = 'Active'
        GROUP BY h.id
        ORDER BY h.id ASC
      `;
      const [rows] = await this.pool.query<RowDataPacket[]>(query);
      return rows.map((r) => ({
        ...r,
        student_count: Number(r.student_count || 0),
        is_active: Boolean(r.is_active),
      })) as Hostel[];
    }

    return this.fallbackHostels.map((h) => {
      const activeCount = this.fallbackStudents.filter((s) => s.hostel_id === h.id && s.status === 'Active').length;
      return {
        ...h,
        student_count: activeCount,
      };
    });
  }

  public async getHostelById(id: number): Promise<Hostel | null> {
    if (this.isConnectedToMySQL && this.pool) {
      const query = `
        SELECT h.*, COUNT(s.id) as student_count
        FROM hostels h
        LEFT JOIN students s ON s.hostel_id = h.id AND s.status = 'Active'
        WHERE h.id = ?
        GROUP BY h.id
      `;
      const [rows] = await this.pool.query<RowDataPacket[]>(query, [id]);
      if (!rows.length) return null;
      return {
        ...rows[0],
        student_count: Number(rows[0].student_count || 0),
        is_active: Boolean(rows[0].is_active),
      } as Hostel;
    }

    const h = this.fallbackHostels.find((item) => item.id === id);
    if (!h) return null;
    const activeCount = this.fallbackStudents.filter((s) => s.hostel_id === h.id && s.status === 'Active').length;
    return { ...h, student_count: activeCount };
  }

  public async createHostel(data: Omit<Hostel, 'id' | 'created_at' | 'updated_at' | 'student_count'>): Promise<Hostel> {
    if (this.isConnectedToMySQL && this.pool) {
      const [result] = await this.pool.query<ResultSetHeader>(
        `INSERT INTO hostels (code, name, type, total_capacity, warden_name, warden_contact, warden_email, location_description, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.code, data.name, data.type, data.total_capacity, data.warden_name, data.warden_contact, data.warden_email, data.location_description || '', data.is_active ? 1 : 0]
      );
      const inserted = await this.getHostelById(result.insertId);
      if (!inserted) throw new Error('Hostel creation failed');
      return inserted;
    }

    const exists = this.fallbackHostels.some((h) => h.code.toLowerCase() === data.code.toLowerCase());
    if (exists) {
      throw new Error(`Hostel code '${data.code}' already exists`);
    }

    const newHostel: Hostel = {
      ...data,
      id: this.nextHostelId++,
      student_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.fallbackHostels.push(newHostel);
    return { ...newHostel };
  }

  public async updateHostel(id: number, data: Partial<Hostel>): Promise<Hostel> {
    if (this.isConnectedToMySQL && this.pool) {
      const fields: string[] = [];
      const values: any[] = [];
      if (data.code !== undefined) { fields.push('code = ?'); values.push(data.code); }
      if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
      if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
      if (data.total_capacity !== undefined) { fields.push('total_capacity = ?'); values.push(data.total_capacity); }
      if (data.warden_name !== undefined) { fields.push('warden_name = ?'); values.push(data.warden_name); }
      if (data.warden_contact !== undefined) { fields.push('warden_contact = ?'); values.push(data.warden_contact); }
      if (data.warden_email !== undefined) { fields.push('warden_email = ?'); values.push(data.warden_email); }
      if (data.location_description !== undefined) { fields.push('location_description = ?'); values.push(data.location_description); }
      if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active ? 1 : 0); }
      values.push(id);

      await this.pool.query(`UPDATE hostels SET ${fields.join(', ')} WHERE id = ?`, values);
      const updated = await this.getHostelById(id);
      if (!updated) throw new Error('Hostel not found');
      return updated;
    }

    const index = this.fallbackHostels.findIndex((h) => h.id === id);
    if (index === -1) throw new Error('Hostel not found');
    this.fallbackHostels[index] = {
      ...this.fallbackHostels[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return { ...this.fallbackHostels[index] };
  }

  // --------------------------------------------------------------------------
  // Student Operations
  // --------------------------------------------------------------------------
  public async getStudents(filter: StudentFilterQuery = {}): Promise<PaginatedResult<Student>> {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 10));
    const offset = (page - 1) * limit;

    if (this.isConnectedToMySQL && this.pool) {
      const conditions: string[] = [];
      const params: any[] = [];

      if (filter.search) {
        const searchPattern = `%${filter.search}%`;
        conditions.push(`(s.roll_number LIKE ? OR s.full_name LIKE ? OR s.email LIKE ? OR s.mobile_number LIKE ? OR s.room_number LIKE ?)`);
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }
      if (filter.hostel_id) {
        conditions.push(`s.hostel_id = ?`);
        params.push(Number(filter.hostel_id));
      }
      if (filter.branch) {
        conditions.push(`s.branch = ?`);
        params.push(filter.branch);
      }
      if (filter.year_semester) {
        conditions.push(`s.year_semester = ?`);
        params.push(filter.year_semester);
      }
      if (filter.status) {
        conditions.push(`s.status = ?`);
        params.push(filter.status);
      }
      if (filter.gender) {
        conditions.push(`s.gender = ?`);
        params.push(filter.gender);
      }
      if (filter.course) {
        conditions.push(`s.course = ?`);
        params.push(filter.course);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count query
      const countQuery = `SELECT COUNT(*) as total FROM students s ${whereClause}`;
      const [countRows] = await this.pool.query<RowDataPacket[]>(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Sort
      const validSortColumns: Record<string, string> = {
        roll_number: 's.roll_number',
        full_name: 's.full_name',
        admission_date: 's.admission_date',
        hostel_id: 's.hostel_id',
        branch: 's.branch',
        status: 's.status',
        created_at: 's.created_at',
      };
      const sortCol = validSortColumns[filter.sortBy || 'id'] || 's.id';
      const sortDir = (filter.sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Data query
      const dataQuery = `
        SELECT s.*, h.name as hostel_name, h.code as hostel_code
        FROM students s
        LEFT JOIN hostels h ON s.hostel_id = h.id
        ${whereClause}
        ORDER BY ${sortCol} ${sortDir}
        LIMIT ? OFFSET ?
      `;
      const [rows] = await this.pool.query<RowDataPacket[]>(dataQuery, [...params, limit, offset]);

      return {
        data: rows as Student[],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    }

    // In-memory relational filtering
    let filtered = [...this.fallbackStudents];

    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.roll_number.toLowerCase().includes(q) ||
          s.full_name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.mobile_number.includes(q) ||
          s.room_number.toLowerCase().includes(q)
      );
    }
    if (filter.hostel_id) {
      filtered = filtered.filter((s) => s.hostel_id === Number(filter.hostel_id));
    }
    if (filter.branch) {
      filtered = filtered.filter((s) => s.branch === filter.branch);
    }
    if (filter.year_semester) {
      filtered = filtered.filter((s) => s.year_semester === filter.year_semester);
    }
    if (filter.status) {
      filtered = filtered.filter((s) => s.status === filter.status);
    }
    if (filter.gender) {
      filtered = filtered.filter((s) => s.gender === filter.gender);
    }
    if (filter.course) {
      filtered = filtered.filter((s) => s.course === filter.course);
    }

    // Sorting
    const sortField = (filter.sortBy || 'id') as keyof Student;
    const isAsc = (filter.sortOrder || 'desc').toLowerCase() === 'asc';
    filtered.sort((a, b) => {
      const valA = a[sortField] ?? '';
      const valB = b[sortField] ?? '';
      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    // Attach hostel details
    const populated = paginated.map((s) => {
      const h = this.fallbackHostels.find((item) => item.id === s.hostel_id);
      return {
        ...s,
        hostel_name: h?.name || 'Unknown Hostel',
        hostel_code: h?.code || '',
      };
    });

    return {
      data: populated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  public async getStudentById(id: number): Promise<Student | null> {
    if (this.isConnectedToMySQL && this.pool) {
      const query = `
        SELECT s.*, h.name as hostel_name, h.code as hostel_code, h.warden_name, h.warden_contact
        FROM students s
        LEFT JOIN hostels h ON s.hostel_id = h.id
        WHERE s.id = ?
        LIMIT 1
      `;
      const [rows] = await this.pool.query<RowDataPacket[]>(query, [id]);
      return (rows[0] as Student) || null;
    }

    const student = this.fallbackStudents.find((s) => s.id === id);
    if (!student) return null;
    const h = this.fallbackHostels.find((item) => item.id === student.hostel_id);
    return {
      ...student,
      hostel_name: h?.name || 'Unknown Hostel',
      hostel_code: h?.code || '',
    };
  }

  public async getStudentByRollNumber(rollNumber: string, excludeId?: number): Promise<Student | null> {
    if (this.isConnectedToMySQL && this.pool) {
      let query = 'SELECT * FROM students WHERE UPPER(roll_number) = UPPER(?)';
      const params: any[] = [rollNumber.trim()];
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      query += ' LIMIT 1';
      const [rows] = await this.pool.query<RowDataPacket[]>(query, params);
      return (rows[0] as Student) || null;
    }

    const clean = rollNumber.trim().toUpperCase();
    const found = this.fallbackStudents.find(
      (s) => s.roll_number.trim().toUpperCase() === clean && (!excludeId || s.id !== excludeId)
    );
    return found ? { ...found } : null;
  }

  public async createStudent(data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    // Check duplicate roll number
    const existing = await this.getStudentByRollNumber(data.roll_number);
    if (existing) {
      throw new Error(`Roll Number '${data.roll_number}' is already registered in the system.`);
    }

    // Verify hostel exists
    const hostel = await this.getHostelById(Number(data.hostel_id));
    if (!hostel) {
      throw new Error(`Selected hostel with ID ${data.hostel_id} does not exist.`);
    }

    if (this.isConnectedToMySQL && this.pool) {
      const [result] = await this.pool.query<ResultSetHeader>(
        `INSERT INTO students (
          roll_number, full_name, father_name, mother_name, date_of_birth, gender,
          mobile_number, email, course, branch, year_semester, hostel_id, room_number,
          admission_date, address, emergency_contact_name, emergency_contact_number,
          status, additional_remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.roll_number.trim().toUpperCase(),
          data.full_name.trim(),
          data.father_name.trim(),
          data.mother_name.trim(),
          data.date_of_birth,
          data.gender,
          data.mobile_number.trim(),
          data.email.trim().toLowerCase(),
          data.course.trim(),
          data.branch.trim(),
          data.year_semester.trim(),
          Number(data.hostel_id),
          data.room_number.trim(),
          data.admission_date,
          data.address.trim(),
          data.emergency_contact_name.trim(),
          data.emergency_contact_number.trim(),
          data.status || 'Active',
          data.additional_remarks || '',
        ]
      );
      const created = await this.getStudentById(result.insertId);
      if (!created) throw new Error('Failed to create student record in database');
      return created;
    }

    const newStudent: Student = {
      ...data,
      id: this.nextStudentId++,
      roll_number: data.roll_number.trim().toUpperCase(),
      full_name: data.full_name.trim(),
      father_name: data.father_name.trim(),
      mother_name: data.mother_name.trim(),
      email: data.email.trim().toLowerCase(),
      mobile_number: data.mobile_number.trim(),
      hostel_id: Number(data.hostel_id),
      hostel_name: hostel.name,
      hostel_code: hostel.code,
      status: data.status || 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.fallbackStudents.unshift(newStudent);
    return { ...newStudent };
  }

  public async updateStudent(id: number, data: Partial<Student>): Promise<Student> {
    const existing = await this.getStudentById(id);
    if (!existing) {
      throw new Error(`Student with ID ${id} not found.`);
    }

    // Check duplicate roll number if changed
    if (data.roll_number && data.roll_number.trim().toUpperCase() !== existing.roll_number) {
      const duplicate = await this.getStudentByRollNumber(data.roll_number, id);
      if (duplicate) {
        throw new Error(`Roll Number '${data.roll_number}' is already registered for another student.`);
      }
    }

    if (data.hostel_id) {
      const hostel = await this.getHostelById(Number(data.hostel_id));
      if (!hostel) {
        throw new Error(`Hostel with ID ${data.hostel_id} does not exist.`);
      }
    }

    if (this.isConnectedToMySQL && this.pool) {
      const fields: string[] = [];
      const values: any[] = [];

      const map: Record<string, any> = {
        roll_number: data.roll_number ? data.roll_number.trim().toUpperCase() : undefined,
        full_name: data.full_name?.trim(),
        father_name: data.father_name?.trim(),
        mother_name: data.mother_name?.trim(),
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        mobile_number: data.mobile_number?.trim(),
        email: data.email?.trim().toLowerCase(),
        course: data.course?.trim(),
        branch: data.branch?.trim(),
        year_semester: data.year_semester?.trim(),
        hostel_id: data.hostel_id ? Number(data.hostel_id) : undefined,
        room_number: data.room_number?.trim(),
        admission_date: data.admission_date,
        address: data.address?.trim(),
        emergency_contact_name: data.emergency_contact_name?.trim(),
        emergency_contact_number: data.emergency_contact_number?.trim(),
        status: data.status,
        additional_remarks: data.additional_remarks !== undefined ? data.additional_remarks : undefined,
      };

      for (const [col, val] of Object.entries(map)) {
        if (val !== undefined) {
          fields.push(`${col} = ?`);
          values.push(val);
        }
      }

      if (fields.length > 0) {
        values.push(id);
        await this.pool.query(`UPDATE students SET ${fields.join(', ')} WHERE id = ?`, values);
      }

      const updated = await this.getStudentById(id);
      if (!updated) throw new Error('Student record update failed');
      return updated;
    }

    const index = this.fallbackStudents.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Student not found');

    const updatedStudent: Student = {
      ...this.fallbackStudents[index],
      ...data,
      roll_number: data.roll_number ? data.roll_number.trim().toUpperCase() : this.fallbackStudents[index].roll_number,
      updated_at: new Date().toISOString(),
    };

    if (data.hostel_id) {
      const h = this.fallbackHostels.find((item) => item.id === Number(data.hostel_id));
      updatedStudent.hostel_name = h?.name;
      updatedStudent.hostel_code = h?.code;
    }

    this.fallbackStudents[index] = updatedStudent;
    return { ...updatedStudent };
  }

  public async deleteStudent(id: number): Promise<{ success: boolean; message: string }> {
    const existing = await this.getStudentById(id);
    if (!existing) {
      throw new Error(`Student with ID ${id} not found.`);
    }

    if (this.isConnectedToMySQL && this.pool) {
      await this.pool.query('DELETE FROM students WHERE id = ?', [id]);
      return { success: true, message: `Student record [${existing.roll_number}] deleted successfully.` };
    }

    const initialLen = this.fallbackStudents.length;
    this.fallbackStudents = this.fallbackStudents.filter((s) => s.id !== id);
    if (this.fallbackStudents.length === initialLen) {
      throw new Error(`Failed to delete student with ID ${id}`);
    }
    return { success: true, message: `Student record [${existing.roll_number}] deleted successfully.` };
  }

  // --------------------------------------------------------------------------
  // Dashboard & Statistics
  // --------------------------------------------------------------------------
  public async getDashboardStats(): Promise<DashboardStats> {
    const hostels = await this.getHostels();

    if (this.isConnectedToMySQL && this.pool) {
      const [totalCountRows] = await this.pool.query<RowDataPacket[]>(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive
        FROM students
      `);

      const [branchRows] = await this.pool.query<RowDataPacket[]>(`
        SELECT branch, COUNT(*) as count
        FROM students
        GROUP BY branch
        ORDER BY count DESC
      `);

      const [recentRows] = await this.pool.query<RowDataPacket[]>(`
        SELECT s.*, h.name as hostel_name, h.code as hostel_code
        FROM students s
        LEFT JOIN hostels h ON s.hostel_id = h.id
        ORDER BY s.id DESC
        LIMIT 6
      `);

      const totalStudents = Number(totalCountRows[0]?.total || 0);
      const activeStudents = Number(totalCountRows[0]?.active || 0);
      const inactiveStudents = Number(totalCountRows[0]?.inactive || 0);

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

      return {
        totalStudents,
        totalHostels: hostels.length,
        activeStudents,
        inactiveStudents,
        hostelStats,
        branchStats: branchRows as Array<{ branch: string; count: number }>,
        recentStudents: recentRows as Student[],
      };
    }

    const totalStudents = this.fallbackStudents.length;
    const activeStudents = this.fallbackStudents.filter((s) => s.status === 'Active').length;
    const inactiveStudents = totalStudents - activeStudents;

    // Branch stats
    const branchCounts: Record<string, number> = {};
    for (const s of this.fallbackStudents) {
      branchCounts[s.branch] = (branchCounts[s.branch] || 0) + 1;
    }
    const branchStats = Object.entries(branchCounts)
      .map(([branch, count]) => ({ branch, count }))
      .sort((a, b) => b.count - a.count);

    // Hostel stats
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

    // Recent students (last 6)
    const recentStudents = [...this.fallbackStudents]
      .sort((a, b) => b.id - a.id)
      .slice(0, 6)
      .map((s) => {
        const h = hostels.find((hostel) => hostel.id === s.hostel_id);
        return {
          ...s,
          hostel_name: h?.name,
          hostel_code: h?.code,
        };
      });

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

  public getSystemStatus() {
    return {
      mode: this.isConnectedToMySQL ? 'mysql' : 'relational_engine',
      connectedToMySQL: this.isConnectedToMySQL,
      message: this.connectionStatusMessage,
      config: {
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || '3306',
        user: process.env.MYSQL_USER || 'root',
        database: process.env.MYSQL_DATABASE || 'vnit_hostel_db',
        ssl: process.env.MYSQL_SSL === 'true',
      },
      stats: {
        studentCount: this.fallbackStudents.length,
        hostelCount: this.fallbackHostels.length,
      },
    };
  }
}

export const dbService = new DatabaseService();
