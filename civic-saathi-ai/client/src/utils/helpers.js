// src/utils/helpers.js
export const ISSUE_LABELS = {
  pothole: 'Pothole',
  garbage: 'Garbage',
  broken_streetlight: 'Broken Streetlight',
  waterlogging: 'Waterlogging',
  other: 'Other',
};

export const ISSUE_ICONS = {
  pothole: '🕳️',
  garbage: '🗑️',
  broken_streetlight: '💡',
  waterlogging: '🌊',
  other: '❓',
};

export const SEVERITY_COLORS = {
  low: 'severity-low',
  medium: 'severity-medium',
  high: 'severity-high',
};

export const STATUS_COLORS = {
  'Submitted (Demo)': 'status-submitted',
  'Assigned': 'status-assigned',
  'In Progress': 'status-progress',
  'Resolved': 'status-resolved',
  'Closed': 'status-closed',
};

export function formatDate(isoString) {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatIssueType(type) {
  return ISSUE_LABELS[type] || type?.replace(/_/g, ' ') || 'Unknown';
}

export function getStatusClass(status) {
  if (!status) return 'status-submitted';
  const s = status.toLowerCase();
  if (s.includes('submitted')) return 'status-submitted';
  if (s.includes('assigned')) return 'status-assigned';
  if (s.includes('progress')) return 'status-progress';
  if (s.includes('resolved')) return 'status-resolved';
  if (s.includes('closed')) return 'status-closed';
  return 'status-submitted';
}

export function getSeverityClass(severity) {
  return SEVERITY_COLORS[severity] || 'severity-medium';
}

export function truncate(str, n = 100) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}
