// src/components/ComplaintCard.jsx
import { formatDate, formatIssueType, getStatusClass, getSeverityClass, ISSUE_ICONS } from '../utils/helpers.js';
import { MapPin, Building2, Calendar, Hash } from 'lucide-react';

export default function ComplaintCard({ complaint, compact = false }) {
  if (!complaint) return null;

  const statusClass = getStatusClass(complaint.status);
  const severityClass = getSeverityClass(complaint.severity);
  const icon = ISSUE_ICONS[complaint.issueType] || '❓';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-5 py-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-white font-display font-semibold">
              {formatIssueType(complaint.issueType)}
            </p>
            <p className="text-slate-400 text-xs font-mono">{complaint.ticketId}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
            {complaint.status}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${severityClass}`}>
            {complaint.severity?.toUpperCase()} severity
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {complaint.description && (
          <p className="text-sm text-slate-700 leading-relaxed">{complaint.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <InfoRow icon={MapPin} label="Area" value={complaint.area} />
          <InfoRow icon={Hash} label="Ward" value={complaint.wardName} />
          <InfoRow icon={Building2} label="Department" value={complaint.departmentName} />
          <InfoRow icon={Calendar} label="Filed" value={formatDate(complaint.createdAt)} />
        </div>

        {!compact && complaint.statusHistory && complaint.statusHistory.length > 1 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2">STATUS HISTORY</p>
            <div className="space-y-1.5">
              {complaint.statusHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${getStatusClass(h.status)}`}>
                    {h.status}
                  </span>
                  <span className="text-slate-400">{formatDate(h.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {complaint.isDemo && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            ⚠️ Demo complaint only — not submitted to any real municipal authority.
          </p>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}
