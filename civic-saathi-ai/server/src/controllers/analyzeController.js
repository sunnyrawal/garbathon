// src/controllers/analyzeController.js
import { analyzeIssueImage } from '../tools/analyzeIssue.js';
import { lookupWard } from '../tools/lookupWard.js';
import { lookupDepartment } from '../tools/lookupDepartment.js';
import { sendError, sendSuccess } from '../utils/errorResponse.js';
import { config } from '../config/env.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function analyzeHandler(req, res) {
  const timelineEvents = [];

  try {
    // Step 1: Validate image
    if (!req.file) {
      return sendError(res, 'MISSING_IMAGE', 'An image file is required.', 400);
    }

    const mime = req.file.mimetype;
    if (!ALLOWED_MIME_TYPES.includes(mime)) {
      return sendError(res, 'UNSUPPORTED_IMAGE_TYPE',
        `Unsupported file type: ${mime}. Please upload JPEG, PNG, or WebP.`, 415);
    }

    const maxBytes = config.maxImageSizeMB * 1024 * 1024;
    if (req.file.size > maxBytes) {
      return sendError(res, 'IMAGE_TOO_LARGE',
        `Image exceeds ${config.maxImageSizeMB}MB limit.`, 413);
    }

    timelineEvents.push({ step: 'IMAGE_RECEIVED', status: 'success', timestamp: new Date().toISOString(),
      details: { size: req.file.size, mimeType: mime } });

    // Step 2: Analyze image
    let analysis;
    try {
      analysis = await analyzeIssueImage(req.file.buffer, mime);
      timelineEvents.push({ step: 'IMAGE_ANALYZED', status: 'success', timestamp: new Date().toISOString(),
        details: { issueType: analysis.issueType, severity: analysis.severity, isDemo: analysis.isDemo } });
    } catch (err) {
      timelineEvents.push({ step: 'IMAGE_ANALYZED', status: 'error', timestamp: new Date().toISOString(),
        details: { error: err.message || 'Analysis failed' } });
      return sendError(res, err.code || 'AI_ERROR', err.message || 'Image analysis failed.', err.status || 503);
    }

    // Step 3: Lookup ward if area provided
    let wardResult = null;
    if (req.body.area) {
      wardResult = await lookupWard(req.body.area);
      timelineEvents.push({ step: 'WARD_LOOKUP', status: wardResult.success ? 'success' : 'warning',
        timestamp: new Date().toISOString(), details: wardResult });
    } else {
      timelineEvents.push({ step: 'WARD_LOOKUP', status: 'skipped', timestamp: new Date().toISOString(),
        details: { note: 'No area provided' } });
    }

    // Step 4: Lookup department
    const deptResult = await lookupDepartment(analysis.issueType);
    timelineEvents.push({ step: 'DEPARTMENT_LOOKUP', status: deptResult.success ? 'success' : 'warning',
      timestamp: new Date().toISOString(), details: deptResult });

    return sendSuccess(res, {
      analysis,
      ward: wardResult,
      department: deptResult,
      timeline: timelineEvents,
    });
  } catch (err) {
    console.error('[analyzeHandler] Unexpected error:', err);
    timelineEvents.push({ step: 'ERROR', status: 'error', timestamp: new Date().toISOString(),
      details: { error: 'Unexpected server error' } });
    return sendError(res, 'INTERNAL_ERROR', 'An unexpected error occurred.', 500);
  }
}
