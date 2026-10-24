// src/tools/getComplaintStatus.js
// Tool 5 & 6: getComplaintStatus and getComplaintDetails
import { readJsonFile, complaintsFilePath } from '../utils/storage.js';
import { isValidTicketId } from '../utils/ticketId.js';

export async function getComplaintStatus(ticketId) {
  if (!ticketId || typeof ticketId !== 'string') {
    return { success: false, code: 'INVALID_ID', message: 'A valid tracking ID is required.' };
  }

  const cleanId = ticketId.trim().toUpperCase();

  if (!isValidTicketId(cleanId)) {
    return {
      success: false,
      code: 'INVALID_ID_FORMAT',
      message: 'Invalid tracking ID format. IDs should start with CS-DEMO-.',
    };
  }

  const data = await readJsonFile(complaintsFilePath());
  if (!data || !Array.isArray(data.complaints)) {
    return { success: false, code: 'STORAGE_UNAVAILABLE', message: 'Complaint records are temporarily unavailable.' };
  }

  const complaint = data.complaints.find((c) => c.ticketId === cleanId);
  if (!complaint) {
    return {
      success: false,
      code: 'TICKET_NOT_FOUND',
      message: `No complaint found with tracking ID "${cleanId}". Please verify the ID and try again.`,
    };
  }

  return {
    success: true,
    ticketId: complaint.ticketId,
    status: complaint.status,
    issueType: complaint.issueType,
    area: complaint.area,
    wardName: complaint.wardName,
    departmentName: complaint.departmentName,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
  };
}

export async function getComplaintDetails(ticketId) {
  if (!ticketId || typeof ticketId !== 'string') {
    return { success: false, code: 'INVALID_ID', message: 'A valid tracking ID is required.' };
  }

  const cleanId = ticketId.trim().toUpperCase();

  if (!isValidTicketId(cleanId)) {
    return {
      success: false,
      code: 'INVALID_ID_FORMAT',
      message: 'Invalid tracking ID format. IDs should start with CS-DEMO-.',
    };
  }

  const data = await readJsonFile(complaintsFilePath());
  if (!data || !Array.isArray(data.complaints)) {
    return { success: false, code: 'STORAGE_UNAVAILABLE', message: 'Complaint records are temporarily unavailable.' };
  }

  const complaint = data.complaints.find((c) => c.ticketId === cleanId);
  if (!complaint) {
    return {
      success: false,
      code: 'TICKET_NOT_FOUND',
      message: `No complaint found with tracking ID "${cleanId}".`,
    };
  }

  return { success: true, complaint };
}

export async function getAllComplaints() {
  const data = await readJsonFile(complaintsFilePath());
  if (!data || !Array.isArray(data.complaints)) return [];
  return data.complaints;
}
