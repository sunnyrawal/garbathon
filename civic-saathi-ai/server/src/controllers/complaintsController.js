// src/controllers/complaintsController.js
import { createComplaint } from '../tools/createComplaint.js';
import { getComplaintDetails, getAllComplaints } from '../tools/getComplaintStatus.js';
import { lookupWard } from '../tools/lookupWard.js';
import { lookupDepartment } from '../tools/lookupDepartment.js';
import { sendError, sendSuccess } from '../utils/errorResponse.js';

const VALID_ISSUE_TYPES = ['pothole', 'garbage', 'broken_streetlight', 'waterlogging', 'other'];
const VALID_SEVERITIES = ['low', 'medium', 'high'];

export async function createComplaintHandler(req, res) {
  const { issueType, description, severity, area, wardId, wardName, departmentId, departmentName,
    confidence, recommendedAction, idempotencyKey } = req.body;

  // Validate required fields
  if (!issueType || !VALID_ISSUE_TYPES.includes(issueType)) {
    return sendError(res, 'INVALID_ISSUE_TYPE', `issueType must be one of: ${VALID_ISSUE_TYPES.join(', ')}`, 400);
  }
  if (!description || description.trim().length < 5) {
    return sendError(res, 'INVALID_DESCRIPTION', 'Description must be at least 5 characters.', 400);
  }
  if (!severity || !VALID_SEVERITIES.includes(severity)) {
    return sendError(res, 'INVALID_SEVERITY', `severity must be one of: ${VALID_SEVERITIES.join(', ')}`, 400);
  }
  if (!area || area.trim().length < 2) {
    return sendError(res, 'INVALID_AREA', 'Area/locality is required.', 400);
  }

  // Resolve ward — use provided or lookup
  let ward;
  if (wardId && wardName) {
    ward = { wardId, wardName };
  } else {
    const wardResult = await lookupWard(area);
    if (!wardResult.success) {
      return res.status(404).json({ success: false, error: { code: wardResult.code, message: wardResult.message },
        supportedAreas: wardResult.supportedAreas });
    }
    ward = { wardId: wardResult.wardId, wardName: wardResult.wardName };
  }

  // Resolve department — use provided or lookup
  let department;
  if (departmentId && departmentName) {
    department = { departmentId, departmentName };
  } else {
    const deptResult = await lookupDepartment(issueType);
    if (!deptResult.success) {
      return sendError(res, deptResult.code, deptResult.message, 400);
    }
    department = { departmentId: deptResult.departmentId, departmentName: deptResult.departmentName };
  }

  const result = await createComplaint(
    { issueType, description: description.trim(), severity, area: area.trim(), confidence, recommendedAction },
    ward,
    department,
    idempotencyKey || null,
  );

  if (!result.success) {
    return sendError(res, result.code, result.message, 500);
  }

  return sendSuccess(res, { complaint: result.complaint, duplicate: result.duplicate },
    result.duplicate ? 'Duplicate submission returned existing record.' : 'Complaint created successfully.',
    result.duplicate ? 200 : 201);
}

export async function getComplaintHandler(req, res) {
  const { ticketId } = req.params;
  const result = await getComplaintDetails(ticketId);
  if (!result.success) {
    const status = result.code === 'TICKET_NOT_FOUND' ? 404 : 400;
    return sendError(res, result.code, result.message, status);
  }
  return sendSuccess(res, result.complaint);
}

export async function listComplaintsHandler(req, res) {
  const complaints = await getAllComplaints();
  return sendSuccess(res, { complaints, total: complaints.length });
}
