// src/tools/createComplaint.js
// Tool 4: createComplaint — validates and persists the complaint record
import { readJsonFile, writeJsonFile, complaintsFilePath } from '../utils/storage.js';
import { generateTicketId, generateInternalId } from '../utils/ticketId.js';

// In-memory idempotency store (keyed by idempotencyKey)
const recentSubmissions = new Map();
const IDEMPOTENCY_WINDOW_MS = 60_000; // 1 minute

function cleanupIdempotency() {
  const now = Date.now();
  for (const [key, entry] of recentSubmissions.entries()) {
    if (now - entry.createdAt > IDEMPOTENCY_WINDOW_MS) {
      recentSubmissions.delete(key);
    }
  }
}

export async function createComplaint(issueDetails, ward, department, idempotencyKey = null) {
  cleanupIdempotency();

  // Idempotency check
  if (idempotencyKey && recentSubmissions.has(idempotencyKey)) {
    const existing = recentSubmissions.get(idempotencyKey);
    return { success: true, complaint: existing.complaint, duplicate: true };
  }

  // Validate inputs
  const requiredFields = ['issueType', 'description', 'severity', 'area'];
  for (const field of requiredFields) {
    if (!issueDetails[field]) {
      return {
        success: false,
        code: 'INVALID_COMPLAINT_DATA',
        message: `Missing required field: ${field}`,
      };
    }
  }

  if (!ward || !ward.wardId || !ward.wardName) {
    return { success: false, code: 'INVALID_WARD', message: 'Ward information is required.' };
  }

  if (!department || !department.departmentId || !department.departmentName) {
    return { success: false, code: 'INVALID_DEPARTMENT', message: 'Department information is required.' };
  }

  const now = new Date().toISOString();
  const complaint = {
    id: generateInternalId(),
    ticketId: generateTicketId(),
    issueType: issueDetails.issueType,
    description: issueDetails.description,
    severity: issueDetails.severity || 'medium',
    confidence: issueDetails.confidence || null,
    recommendedAction: issueDetails.recommendedAction || null,
    area: issueDetails.area,
    wardId: ward.wardId,
    wardName: ward.wardName,
    departmentId: department.departmentId,
    departmentName: department.departmentName,
    status: 'Submitted (Demo)',
    createdAt: now,
    updatedAt: now,
    statusHistory: [{ status: 'Submitted (Demo)', timestamp: now }],
    isDemo: true,
    isSample: false,
  };

  // Persist
  try {
    const data = await readJsonFile(complaintsFilePath()) || { complaints: [] };
    if (!Array.isArray(data.complaints)) data.complaints = [];
    data.complaints.push(complaint);
    await writeJsonFile(complaintsFilePath(), data);
  } catch (err) {
    console.error('[createComplaint] Storage error:', err.message);
    return { success: false, code: 'STORAGE_ERROR', message: 'Failed to save complaint. Please try again.' };
  }

  // Store in idempotency map
  if (idempotencyKey) {
    recentSubmissions.set(idempotencyKey, { complaint, createdAt: Date.now() });
  }

  return { success: true, complaint, duplicate: false };
}
