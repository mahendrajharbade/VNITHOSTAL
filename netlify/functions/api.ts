import serverless from 'serverless-http';
import { createExpressApp } from '../../server/app.js';

const app = createExpressApp();

// Netlify serverless function entrypoint
export const handler = serverless(app);
