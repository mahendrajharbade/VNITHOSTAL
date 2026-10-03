import { Router, Response } from 'express';
import { dbService } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stats = await dbService.getDashboardStats();
    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('[Dashboard Stats Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard statistics.' });
  }
});

// GET /api/reports/summary
router.get('/reports/summary', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stats = await dbService.getDashboardStats();
    const students = await dbService.getStudents({ limit: 1000, sortBy: 'roll_number', sortOrder: 'asc' });

    res.json({
      success: true,
      generated_at: new Date().toISOString(),
      institution: 'Visvesvaraya National Institute of Technology (VNIT), Nagpur',
      stats,
      students: students.data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to compile report data.' });
  }
});

// GET /api/system/status
router.get('/system/status', (req: AuthenticatedRequest, res: Response): void => {
  res.json({
    success: true,
    system: dbService.getSystemStatus(),
  });
});

// POST /api/system/reconnect-db
router.post('/system/reconnect-db', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await dbService.initDatabase();
    res.json({
      success: true,
      system: dbService.getSystemStatus(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
