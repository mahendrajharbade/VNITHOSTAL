import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbService } from '../db/database.js';
import { generateToken, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Username/Email and Password are required.',
      });
      return;
    }

    const admin = await dbService.getAdminByIdentifier(String(username).trim());

    if (!admin) {
      // Intentionally generic message for security
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your username/email and password.',
      });
      return;
    }

    // Verify bcrypt hash
    const isPasswordValid = await bcrypt.compare(String(password), admin.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your username/email and password.',
      });
      return;
    }

    // Update last login
    await dbService.updateAdminLastLogin(admin.id);

    // Generate JWT
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      hostel_id: admin.hostel_id,
    });

    let hostel_name: string | undefined = undefined;
    if (admin.hostel_id) {
      const hostel = await dbService.getHostelById(admin.hostel_id);
      hostel_name = hostel?.name;
    }

    res.json({
      success: true,
      message: 'Login successful. Welcome back to VNIT Hostel Management.',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        hostel_id: admin.hostel_id ?? null,
        hostel_name,
        last_login: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Auth Error]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server authentication error. Please try again later.',
    });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const admin = await dbService.getAdminById(req.admin!.id);
    if (!admin) {
      res.status(404).json({ success: false, message: 'Admin record not found.' });
      return;
    }

    let hostel_name: string | undefined = undefined;
    if (admin.hostel_id) {
      const hostel = await dbService.getHostelById(admin.hostel_id);
      hostel_name = hostel?.name;
    }

    res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        hostel_id: admin.hostel_id ?? null,
        hostel_name,
        last_login: admin.last_login,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Admin successfully logged out.',
  });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { full_name, email, current_password, new_password } = req.body;
    const admin = await dbService.getAdminById(req.admin!.id);

    if (!admin) {
      res.status(404).json({ success: false, message: 'Admin not found.' });
      return;
    }

    const updates: { full_name?: string; email?: string; password_hash?: string } = {};

    if (full_name) updates.full_name = full_name.trim();
    if (email) updates.email = email.trim().toLowerCase();

    // If changing password, verify current password first
    if (new_password) {
      if (!current_password) {
        res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password.',
        });
        return;
      }

      const isCurrentMatch = await bcrypt.compare(current_password, admin.password_hash);
      if (!isCurrentMatch) {
        res.status(400).json({
          success: false,
          message: 'Current password provided is incorrect.',
        });
        return;
      }

      if (new_password.length < 8) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long.',
        });
        return;
      }

      updates.password_hash = await bcrypt.hash(new_password, 10);
    }

    const updated = await dbService.updateAdminProfile(admin.id, updates);

    res.json({
      success: true,
      message: 'Admin profile updated successfully.',
      admin: {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        full_name: updated.full_name,
        role: updated.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Profile update failed.' });
  }
});

export default router;
