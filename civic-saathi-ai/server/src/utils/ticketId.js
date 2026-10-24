// src/utils/ticketId.js
// Generates unique, human-readable ticket IDs
import { v4 as uuidv4 } from 'uuid';

const TICKET_PREFIX = 'CS-DEMO';

export function generateTicketId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
  return `${TICKET_PREFIX}-${timestamp}${random}`;
}

export function generateInternalId() {
  return uuidv4();
}

export function isValidTicketId(id) {
  if (typeof id !== 'string') return false;
  return /^CS-DEMO-[A-Z0-9]{10,20}$/.test(id) || /^CS-DEMO-SAMPLE\d+$/.test(id);
}
