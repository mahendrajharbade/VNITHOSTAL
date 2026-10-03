# VNIT College Hostel Student Record Management System

A secure, responsive, full-stack web application designed for Visvesvaraya National Institute of Technology (VNIT) Nagpur to manage student hostel records, block allocations, room registries, and institutional administrative reporting.

---

## 1. Project Architecture

The application strictly implements a secure three-tier architecture:

```
┌─────────────────────────┐
│     React Frontend      │  (Tailwind CSS, Plus Jakarta Sans, Lucide Icons, SPA)
└────────────┬────────────┘
             │ HTTP REST (JSON + JWT Bearer Auth)
             ▼
┌─────────────────────────┐
│   Node Express Backend  │  (bcryptjs, jsonwebtoken, CORS, SQL Query Sanitization)
└────────────┬────────────┘
             │ Parameterized Prepared SQL Queries (mysql2/promise)
             ▼
┌─────────────────────────┐
│     MySQL 8.0 Database  │  (Foreign keys, Unique constraints, UTF8mb4, Indexes)
└─────────────────────────┘
```

> **Security Note:** The React frontend never connects directly to MySQL. All queries are securely executed by the Node.js Express backend using prepared statements to prevent SQL injection.

---

## 2. Relational Database Schema (MySQL 8.0+)

The relational structure resides in `database/schema.sql`.

### Tables Overview

1. **`admins`**: Stores authorized administrators.
   - `id INT AUTO_INCREMENT PRIMARY KEY`
   - `username VARCHAR(50) UNIQUE NOT NULL`
   - `email VARCHAR(100) UNIQUE NOT NULL`
   - `password_hash VARCHAR(255) NOT NULL` (Hashed with bcrypt, salt rounds 10)
   - `full_name VARCHAR(100) NOT NULL`
   - `role VARCHAR(30) NOT NULL DEFAULT 'Super Admin'`
   - `last_login DATETIME NULL`
   - `created_at`, `updated_at TIMESTAMP`

2. **`hostels`**: Stores VNIT hostel blocks (expandable for new hostels).
   - `id INT AUTO_INCREMENT PRIMARY KEY`
   - `code VARCHAR(20) UNIQUE NOT NULL` (e.g. `H-1`, `H-2`, `H-3`, `H-4`, `H-5`)
   - `name VARCHAR(100) NOT NULL`
   - `type ENUM('Boys', 'Girls', 'Co-ed') NOT NULL`
   - `total_capacity INT NOT NULL DEFAULT 350`
   - `warden_name VARCHAR(100) NOT NULL`
   - `warden_contact VARCHAR(20) NOT NULL`
   - `warden_email VARCHAR(100) NOT NULL`
   - `location_description TEXT`
   - `is_active TINYINT(1) DEFAULT 1`

3. **`students`**: Complete student hostel registration.
   - `id INT AUTO_INCREMENT PRIMARY KEY`
   - `roll_number VARCHAR(30) UNIQUE NOT NULL` (e.g. `BT22CSE018`)
   - `full_name VARCHAR(100) NOT NULL`
   - `father_name VARCHAR(100) NOT NULL`
   - `mother_name VARCHAR(100) NOT NULL`
   - `date_of_birth DATE NOT NULL`
   - `gender ENUM('Male', 'Female', 'Other') NOT NULL`
   - `mobile_number VARCHAR(20) NOT NULL`
   - `email VARCHAR(100) NOT NULL`
   - `course VARCHAR(50) NOT NULL` (`B.Tech`, `M.Tech`, `M.Sc`, `Ph.D`)
   - `branch VARCHAR(100) NOT NULL` (CSE, ECE, ME, Civil, EE, etc.)
   - `year_semester VARCHAR(50) NOT NULL`
   - `hostel_id INT NOT NULL` (Foreign Key referencing `hostels(id)` ON DELETE RESTRICT)
   - `room_number VARCHAR(30) NOT NULL`
   - `admission_date DATE NOT NULL`
   - `address TEXT NOT NULL`
   - `emergency_contact_name VARCHAR(100) NOT NULL`
   - `emergency_contact_number VARCHAR(20) NOT NULL`
   - `status ENUM('Active', 'Inactive') DEFAULT 'Active'`
   - `additional_remarks TEXT`
   - `created_at`, `updated_at TIMESTAMP`

---

## 3. Sample Data & Default Credentials

Sample seed data is provided in `database/seed.sql`.

### Default Admin Account
- **Username:** `admin` (or `admin@vnit.ac.in`)
- **Default Password:** `Admin@vnit2026`
- **Full Name:** Dr. Rajesh K. Sharma (Chief Warden)

> ⚠️ **CRITICAL SECURITY REQUIREMENT**: Change this default password immediately after setting up the application via the **Admin Profile** page or direct database update before deploying to production.

### Initial 5 VNIT Hostels
1. **Hostel 1 (H-1):** Mega Boys Hostel - Block A (Capacity: 450)
2. **Hostel 2 (H-2):** Bhabha Bhavan (Capacity: 350)
3. **Hostel 3 (H-3):** Ramanujan Bhavan (Capacity: 300)
4. **Hostel 4 (H-4):** Kalpana Chawla Girls Hostel (Capacity: 400)
5. **Hostel 5 (H-5):** Visvesvaraya PG & Research Block (Capacity: 250)

---

## 4. Local Development in VS Code

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) 8.0+ (or XAMPP / MariaDB / Docker)
- [Visual Studio Code](https://code.visualstudio.com/)

### Step 1: Open Project in VS Code
```bash
git clone <your-repository-url>
cd vnit-hostel-system
code .
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Setup MySQL Database
In your MySQL terminal, MySQL Workbench, or phpMyAdmin:
```sql
CREATE DATABASE IF NOT EXISTS vnit_hostel_db CHARACTER SET utf8mb4;
```
Then execute:
1. `database/schema.sql`
2. `database/seed.sql`

*(Alternatively, if MySQL credentials are provided, the backend will automatically initialize tables on startup!)*

### Step 4: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your MySQL credentials:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=super_secret_vnit_hostel_admin_jwt_key_2026
JWT_EXPIRES_IN=24h

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=vnit_hostel_db
MYSQL_SSL=false
```

### Step 5: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Resilient Engine Note:** If you launch the app before starting your MySQL server, the app automatically runs on a built-in relational SQL fallback engine pre-loaded with VNIT sample records. You can check connection status or trigger reconnection anytime via the database status icon in the top navigation bar!

---

## 5. Production Deployment Guide

### A. Cloud MySQL Database (e.g. Railway or Aiven)
1. Create a MySQL database instance on [Railway](https://railway.app), [Aiven](https://aiven.io), or [Amazon RDS](https://aws.amazon.com/rds/).
2. Run `database/schema.sql` and `database/seed.sql` on the cloud instance.
3. Note your Cloud Connection URL / Host, Port, User, Password, and Database Name.

### B. Backend Deployment (Render / Railway)
1. Connect your GitHub repository to Render or Railway.
2. Build Command: `npm run build`
3. Start Command: `node server.ts`
4. Configure Environment Variables in the hosting dashboard:
   - `PORT=3000`
   - `NODE_ENV=production`
   - `JWT_SECRET=<strong-random-secret>`
   - `MYSQL_HOST=<your-cloud-mysql-host>`
   - `MYSQL_PORT=<your-cloud-mysql-port>`
   - `MYSQL_USER=<your-cloud-mysql-user>`
   - `MYSQL_PASSWORD=<your-cloud-mysql-password>`
   - `MYSQL_DATABASE=vnit_hostel_db`
   - `MYSQL_SSL=true`

### C. Frontend Deployment on Netlify

This project includes pre-configured **`netlify.toml`** and **`public/_redirects`** files specifically tailored for Netlify.

#### Method 1: Deploy via Netlify Dashboard (Git-based)
1. Push your project to GitHub, GitLab, or Bitbucket.
2. Log in to [Netlify](https://app.netlify.com/) and click **"Add new site" > "Import an existing project"**.
3. Select your repository.
4. Netlify will automatically detect the settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **"Environment variables"** and add:
   - `VITE_API_URL` = `https://your-backend-service.onrender.com` (Your deployed Node.js backend URL)
6. Click **"Deploy site"**. Your VNIT Hostel System will be live at `https://your-site-name.netlify.app`.

#### Method 2: Deploy via Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Build the production bundle:
   ```bash
   npm run build
   ```
3. Deploy directly to Netlify:
   ```bash
   netlify deploy --prod --dir=dist
   ```

#### Netlify Configuration Files Included:
- **`netlify.toml`**: Configures the build pipeline, sets Node 20 runtime, adds HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`), and provides SPA redirect routing.
- **`public/_redirects`**: Automatically copied to `dist/_redirects` during `vite build` to guarantee client-side SPA routing (`/* -> /index.html 200`) without 404 errors on page reload.
- **`src/services/api.ts`**: Automatically uses `VITE_API_URL` in production while defaulting to local `/api` during development.


---

## 6. Key Features & Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate Admin with username & password | No |
| `GET` | `/api/auth/me` | Fetch authenticated admin details | Yes (JWT) |
| `POST` | `/api/auth/logout` | Sign out admin session | No |
| `PUT` | `/api/auth/profile` | Update profile or change master password | Yes (JWT) |
| `GET` | `/api/dashboard/stats` | Summary statistics & hostel occupancy | Yes (JWT) |
| `GET` | `/api/students` | Filterable, paginated student records query | Yes (JWT) |
| `GET` | `/api/students/:id` | Detailed individual student profile dossier | Yes (JWT) |
| `POST` | `/api/students` | Create student record (with duplicate checks) | Yes (JWT) |
| `PUT` | `/api/students/:id` | Update student details & room allocation | Yes (JWT) |
| `DELETE` | `/api/students/:id` | Remove student record with confirmation | Yes (JWT) |
| `GET` | `/api/hostels` | Roster of all 5 hostels + capacities | Yes (JWT) |
| `POST` | `/api/hostels` | Add a new hostel block | Yes (JWT) |
| `GET` | `/api/reports/summary` | Consolidated institutional reports | Yes (JWT) |
| `GET` | `/api/system/status` | Database connection health check | No |

---

## 7. License
Developed for Visvesvaraya National Institute of Technology (VNIT), Nagpur. All rights reserved.
