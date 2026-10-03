import express, { Express } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import studentsRoutes from './routes/students.routes.js';
import hostelsRoutes from './routes/hostels.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

export function createExpressApp(): Express {
  const app = express();

  // CORS middleware - allows requests from all origins (including any Netlify domain)
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Health Check
  app.get(['/api/health', '/health'], (req, res) => {
    res.json({
      status: 'healthy',
      service: 'VNIT Hostel Management System API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Routes with both /api prefix and without prefix
  // This ensures requests work whether rewritten via Netlify /:splat or routed directly
  app.use('/api/auth', authRoutes);
  app.use('/auth', authRoutes);

  app.use('/api/students', studentsRoutes);
  app.use('/students', studentsRoutes);

  app.use('/api/hostels', hostelsRoutes);
  app.use('/hostels', hostelsRoutes);

  app.use('/api/dashboard', dashboardRoutes);
  app.use('/dashboard', dashboardRoutes);

  app.use('/api', dashboardRoutes);
  app.use('/', dashboardRoutes);

  return app;
}
