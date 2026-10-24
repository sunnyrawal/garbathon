// src/tools/lookupDepartment.js
// Tool 3: lookupDepartment — deterministic issue → department mapping
import { readJsonFile, directoryFilePath } from '../utils/storage.js';

const SUPPORTED_ISSUE_TYPES = ['pothole', 'garbage', 'broken_streetlight', 'waterlogging', 'other'];

export async function lookupDepartment(issueType) {
  if (!issueType || !SUPPORTED_ISSUE_TYPES.includes(issueType)) {
    return {
      success: false,
      code: 'INVALID_ISSUE_TYPE',
      message: `Unsupported issue type: "${issueType}". Must be one of: ${SUPPORTED_ISSUE_TYPES.join(', ')}`,
    };
  }

  const directory = await readJsonFile(directoryFilePath());
  if (!directory || !directory.departments) {
    return {
      success: false,
      code: 'DIRECTORY_UNAVAILABLE',
      message: 'Department directory is currently unavailable.',
    };
  }

  const dept = directory.departments[issueType];
  if (!dept) {
    return {
      success: false,
      code: 'DEPARTMENT_NOT_FOUND',
      message: `No department mapping found for issue type "${issueType}"`,
    };
  }

  return {
    success: true,
    departmentId: dept.id,
    departmentName: dept.name,
    shortName: dept.shortName,
    contact: dept.contact,
    reason: dept.reason,
    mappingSource: 'demo-municipal-directory-v1',
  };
}
