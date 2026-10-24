// src/controllers/departmentsController.js
import { lookupDepartment } from '../tools/lookupDepartment.js';
import { sendError, sendSuccess } from '../utils/errorResponse.js';

const SUPPORTED = ['pothole', 'garbage', 'broken_streetlight', 'waterlogging', 'other'];

export async function departmentLookupHandler(req, res) {
  const issueType = req.query.issueType;
  if (!issueType) {
    return sendSuccess(res, { supportedTypes: SUPPORTED, message: 'Provide ?issueType= to look up a department.' });
  }

  const result = await lookupDepartment(issueType);
  if (!result.success) {
    return sendError(res, result.code, result.message, 404);
  }

  return sendSuccess(res, result);
}
