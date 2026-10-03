-- ============================================================================
-- VNIT College Hostel Student Record Management System
-- Database Schema (MySQL 8.0+)
-- ============================================================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS vnit_hostel_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vnit_hostel_db;

-- ----------------------------------------------------------------------------
-- Table: admins
-- Stores authenticated administrators with bcrypt hashed passwords
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Table: hostels
-- Stores VNIT hostels (extensible for future hostels)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Table: students
-- Complete institutional hostel student record repository
-- ----------------------------------------------------------------------------
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
  
  -- Foreign Key Constraint to Hostels
  CONSTRAINT fk_students_hostel
    FOREIGN KEY (hostel_id)
    REFERENCES hostels (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
    
  -- Indexes for fast searching and filtering
  INDEX idx_student_roll (roll_number),
  INDEX idx_student_name (full_name),
  INDEX idx_student_hostel (hostel_id),
  INDEX idx_student_branch (branch),
  INDEX idx_student_status (status),
  INDEX idx_student_room (hostel_id, room_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
