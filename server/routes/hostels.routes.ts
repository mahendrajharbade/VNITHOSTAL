import { Router, Response } from 'express';
import { dbService } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/hostels - Get all hostels with capacity and student stats
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const hostels = await dbService.getHostels();
    res.json({
      success: true,
      hostels,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch hostels list.' });
  }
});

// GET /api/hostels/:id - Get specific hostel with enrolled students
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const hostel = await dbService.getHostelById(id);
    if (!hostel) {
      res.status(404).json({ success: false, message: `Hostel with ID ${id} not found.` });
      return;
    }

    // Fetch students assigned to this hostel
    const studentsResult = await dbService.getStudents({
      hostel_id: id,
      limit: 100,
      sortBy: 'room_number',
      sortOrder: 'asc',
    });

    res.json({
      success: true,
      hostel,
      students: studentsResult.data,
      total_students: studentsResult.pagination.total,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch hostel details.' });
  }
});

// POST /api/hostels - Add a new hostel
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { code, name, type, total_capacity, warden_name, warden_contact, warden_email, location_description } = req.body;

    if (!code || !name || !type || !total_capacity || !warden_name || !warden_contact || !warden_email) {
      res.status(400).json({
        success: false,
        message: 'All core hostel fields (Code, Name, Type, Capacity, Warden Name, Contact, Email) are required.',
      });
      return;
    }

    const newHostel = await dbService.createHostel({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      type,
      total_capacity: Number(total_capacity),
      warden_name: warden_name.trim(),
      warden_contact: warden_contact.trim(),
      warden_email: warden_email.trim(),
      location_description: location_description?.trim() || '',
      is_active: 1,
    });

    res.status(201).json({
      success: true,
      message: `Hostel ${newHostel.name} (${newHostel.code}) added successfully.`,
      hostel: newHostel,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to add hostel.' });
  }
});

// PUT /api/hostels/:id - Update hostel details
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const updated = await dbService.updateHostel(id, req.body);
    res.json({
      success: true,
      message: `Hostel ${updated.name} updated successfully.`,
      hostel: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update hostel.' });
  }
});

export default router;
