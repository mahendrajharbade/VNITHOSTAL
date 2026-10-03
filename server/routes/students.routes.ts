import { Router, Response } from 'express';
import { dbService } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Validation helper
function validateStudentInput(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.roll_number || !String(data.roll_number).trim()) {
    errors.push('Student Roll Number / ID is required.');
  }
  if (!data.full_name || !String(data.full_name).trim()) {
    errors.push('Student Full Name is required.');
  }
  if (!data.father_name || !String(data.father_name).trim()) {
    errors.push("Father's Name is required.");
  }
  if (!data.mother_name || !String(data.mother_name).trim()) {
    errors.push("Mother's Name is required.");
  }
  if (!data.date_of_birth) {
    errors.push('Date of Birth is required.');
  }
  if (!data.gender || !['Male', 'Female', 'Other'].includes(data.gender)) {
    errors.push('Gender must be Male, Female, or Other.');
  }
  if (!data.mobile_number || !String(data.mobile_number).trim()) {
    errors.push('Student Mobile Number is required.');
  }
  if (!data.email || !String(data.email).includes('@')) {
    errors.push('A valid Email address is required.');
  }
  if (!data.course || !String(data.course).trim()) {
    errors.push('Course / Program is required.');
  }
  if (!data.branch || !String(data.branch).trim()) {
    errors.push('Branch / Department is required.');
  }
  if (!data.year_semester || !String(data.year_semester).trim()) {
    errors.push('Year / Semester is required.');
  }
  if (!data.hostel_id || isNaN(Number(data.hostel_id))) {
    errors.push('Please select a valid VNIT Hostel.');
  }
  if (!data.room_number || !String(data.room_number).trim()) {
    errors.push('Allotted Room Number is required.');
  }
  if (!data.admission_date) {
    errors.push('Hostel Admission Date is required.');
  }
  if (!data.address || !String(data.address).trim()) {
    errors.push('Permanent Residential Address is required.');
  }
  if (!data.emergency_contact_name || !String(data.emergency_contact_name).trim()) {
    errors.push('Emergency Contact Name is required.');
  }
  if (!data.emergency_contact_number || !String(data.emergency_contact_number).trim()) {
    errors.push('Emergency Contact Number is required.');
  }

  return { valid: errors.length === 0, errors };
}

// GET /api/students - List & search with pagination
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      hostel_id,
      branch,
      year_semester,
      status,
      gender,
      course,
      sortBy = 'id',
      sortOrder = 'desc',
    } = req.query;

    const result = await dbService.getStudents({
      page: Number(page),
      limit: Number(limit),
      search: search ? String(search).trim() : undefined,
      hostel_id: hostel_id ? Number(hostel_id) : undefined,
      branch: branch ? String(branch) : undefined,
      year_semester: year_semester ? String(year_semester) : undefined,
      status: status ? String(status) : undefined,
      gender: gender ? String(gender) : undefined,
      course: course ? String(course) : undefined,
      sortBy: String(sortBy),
      sortOrder: (String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[Get Students Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve student records.' });
  }
});

// GET /api/students/:id - Individual student profile
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid Student ID parameter.' });
      return;
    }

    const student = await dbService.getStudentById(id);
    if (!student) {
      res.status(404).json({ success: false, message: `Student with ID ${id} not found.` });
      return;
    }

    res.json({
      success: true,
      student,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch student details.' });
  }
});

// POST /api/students - Add new student record
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validation = validateStudentInput(req.body);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: validation.errors[0],
        errors: validation.errors,
      });
      return;
    }

    // Check duplicate roll number
    const existing = await dbService.getStudentByRollNumber(req.body.roll_number);
    if (existing) {
      res.status(409).json({
        success: false,
        message: `Student ID / Roll Number '${req.body.roll_number}' already exists in the system.`,
      });
      return;
    }

    const newStudent = await dbService.createStudent({
      roll_number: req.body.roll_number,
      full_name: req.body.full_name,
      father_name: req.body.father_name,
      mother_name: req.body.mother_name,
      date_of_birth: req.body.date_of_birth,
      gender: req.body.gender,
      mobile_number: req.body.mobile_number,
      email: req.body.email,
      course: req.body.course,
      branch: req.body.branch,
      year_semester: req.body.year_semester,
      hostel_id: Number(req.body.hostel_id),
      room_number: req.body.room_number,
      admission_date: req.body.admission_date,
      address: req.body.address,
      emergency_contact_name: req.body.emergency_contact_name,
      emergency_contact_number: req.body.emergency_contact_number,
      status: req.body.status || 'Active',
      additional_remarks: req.body.additional_remarks || '',
    });

    res.status(201).json({
      success: true,
      message: `Student record for ${newStudent.full_name} (${newStudent.roll_number}) created successfully.`,
      student: newStudent,
    });
  } catch (error: any) {
    console.error('[Create Student Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save student record.',
    });
  }
});

// PUT /api/students/:id - Update student record
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid Student ID.' });
      return;
    }

    const validation = validateStudentInput(req.body);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: validation.errors[0],
        errors: validation.errors,
      });
      return;
    }

    const updated = await dbService.updateStudent(id, {
      roll_number: req.body.roll_number,
      full_name: req.body.full_name,
      father_name: req.body.father_name,
      mother_name: req.body.mother_name,
      date_of_birth: req.body.date_of_birth,
      gender: req.body.gender,
      mobile_number: req.body.mobile_number,
      email: req.body.email,
      course: req.body.course,
      branch: req.body.branch,
      year_semester: req.body.year_semester,
      hostel_id: Number(req.body.hostel_id),
      room_number: req.body.room_number,
      admission_date: req.body.admission_date,
      address: req.body.address,
      emergency_contact_name: req.body.emergency_contact_name,
      emergency_contact_number: req.body.emergency_contact_number,
      status: req.body.status,
      additional_remarks: req.body.additional_remarks,
    });

    res.json({
      success: true,
      message: `Student record (${updated.roll_number}) updated successfully.`,
      student: updated,
    });
  } catch (error: any) {
    console.error('[Update Student Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update student record.',
    });
  }
});

// DELETE /api/students/:id - Delete student record
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid Student ID.' });
      return;
    }

    const result = await dbService.deleteStudent(id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to delete student record.',
    });
  }
});

export default router;
