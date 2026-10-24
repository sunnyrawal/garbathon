// src/routes/index.js
import { Router } from 'express';
import multer from 'multer';
import { config } from '../config/env.js';
import { analyzeHandler } from '../controllers/analyzeController.js';
import { wardLookupHandler } from '../controllers/wardsController.js';
import { departmentLookupHandler } from '../controllers/departmentsController.js';
import {
  createComplaintHandler,
  getComplaintHandler,
  listComplaintsHandler,
} from '../controllers/complaintsController.js';
import { assistantHandler } from '../controllers/assistantController.js';

const router = Router();

// Multer: memory storage, 10MB limit, images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxImageSizeMB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CivicSaathi AI API',
    timestamp: new Date().toISOString(),
    demoMode: config.demoMode || !config.geminiApiKey,
    version: '1.0.0',
  });
});

// Image analysis
router.post('/analyze', upload.single('image'), analyzeHandler);

// Ward lookup
router.get('/wards', wardLookupHandler);

// Department lookup
router.get('/departments', departmentLookupHandler);

// Complaints
router.get('/complaints', listComplaintsHandler);
router.post('/complaints', createComplaintHandler);
router.get('/complaints/:ticketId', getComplaintHandler);

// AI Assistant
router.post('/assistant', assistantHandler);

// Multer error handler
router.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: { code: 'IMAGE_TOO_LARGE', message: `File exceeds ${config.maxImageSizeMB}MB limit.` } });
  }
  if (err.message?.includes('Unsupported file type')) {
    return res.status(415).json({ success: false, error: { code: 'UNSUPPORTED_IMAGE_TYPE', message: err.message } });
  }
  console.error('[Route error]', err);
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
});

export default router;
