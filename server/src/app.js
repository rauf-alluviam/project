// Import required modules
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xssClean from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

// ES6 module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Import route files
import authRoutes from "./routes/auth.js"
import documentsRoutes from './routes/documents.js';
import qrcodesRoutes from './routes/qrcodes.js';
import logsRoutes from './routes/logs.js';
import filesRoutes from './routes/files.js';
import usersRoutes from './routes/users.js';

// Import error handling middleware
import errorHandler from './middleware/error.js';

// Create Express app
const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}));

// Security middleware
// app.use(mongoSanitize()); // Sanitize data
app.use(helmet()); // Set security headers
// app.use(xssClean()); // Prevent XSS attacks
// app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate limiting - disabled for development
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100,
    message: {
      error: 'Too many requests from this IP, please try again later.'
    }
  });
  app.use('/api', limiter);
}

// Serve static files in local storage mode
if (process.env.STORAGE_TYPE === 'local') {
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
}

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/qrcodes', qrcodesRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/users', usersRoutes);

// Error handler middleware
app.use(errorHandler);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Server is running',
    storage: process.env.STORAGE_TYPE
  });
});

// Export app for server.js
export default app;
