import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './server/routes/auth.routes.js';
import studentsRoutes from './server/routes/students.routes.js';
import hostelsRoutes from './server/routes/hostels.routes.js';
import dashboardRoutes from './server/routes/dashboard.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware
  app.use(cors({
    origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger for API calls
  app.use('/api', (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
      }
    });
    next();
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentsRoutes);
  app.use('/api/hostels', hostelsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api', dashboardRoutes); // mounts /api/reports and /api/system

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'VNIT Hostel Management System API',
      timestamp: new Date().toISOString(),
    });
  });

  // Frontend integration (Dev Vite Middleware vs Prod static files)
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`  VNIT College Hostel Student Record Management System `);
    console.log(`  Running on http://0.0.0.0:${PORT}                   `);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error] Failed to start server:', err);
  process.exit(1);
});
