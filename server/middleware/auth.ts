import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { dbService } from '../db/database.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'vnit_hostel_admin_jwt_secret_key_change_in_production_2026';

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: number;
    username: string;
    email: string;
    role: string;
    hostel_id?: number | null;
  };
}

export function generateToken(payload: { id: number; username: string; email: string; role: string; hostel_id?: number | null }): string {
  const secret: jwt.Secret = JWT_SECRET;
  return jwt.sign(payload, secret, {
    expiresIn: '24h',
  });
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access denied: Authentication token required. Please sign in as Administrator.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      email: string;
      role: string;
      hostel_id?: number | null;
    };

    // Verify admin still exists in database
    const admin = await dbService.getAdminById(decoded.id);
    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid session: Administrator account no longer exists.',
      });
      return;
    }

    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      hostel_id: admin.hostel_id ?? null,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again to continue.',
      });
      return;
    }

    res.status(403).json({
      success: false,
      message: 'Authentication failed: Invalid or malformed token.',
    });
  }
}
