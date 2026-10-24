// src/components/ActivityTimeline.jsx
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

const STEP_LABELS = {
  IMAGE_RECEIVED: 'Image Received',
  IMAGE_ANALYZED: 'Image Analysis',
  WARD_LOOKUP: 'Ward Lookup',
  DEPARTMENT_LOOKUP: 'Department Lookup',
  COMPLAINT_CREATED: 'Complaint Created',
  TICKET_PERSISTED: 'Ticket Saved',
  STATUS_RETRIEVED: 'Status Retrieved',
  ERROR: 'Error',
};

function StepIcon({ status }) {
  if (status === 'success') return <CheckCircle className="w-5 h-5 text-emerald-500" />;
  if (status === 'error') return <XCircle className="w-5 h-5 text-rose-500" />;
  if (status === 'loading') return <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />;
  if (status === 'skipped') return <Clock className="w-5 h-5 text-slate-400" />;
  return <Clock className="w-5 h-5 text-slate-300" />;
}

function stepBg(status) {
  if (status === 'success') return 'bg-emerald-50 border-emerald-200';
  if (status === 'error') return 'bg-rose-50 border-rose-200';
  if (status === 'warning') return 'bg-amber-50 border-amber-200';
  if (status === 'skipped') return 'bg-slate-50 border-slate-200';
  return 'bg-white border-slate-200';
}

export default function ActivityTimeline({ events = [], isLoading = false }) {
  if (!events.length && !isLoading) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="font-display font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        Agent Activity Timeline
      </h3>
      <div className="space-y-2">
        {events.map((event, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${stepBg(event.status)} animate-fade-in`}
          >
            <div className="mt-0.5"><StepIcon status={event.status} /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-800">
                  {STEP_LABELS[event.step] || event.step}
                </span>
                <span className="text-xs text-slate-400 shrink-0">
                  {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : ''}
                </span>
              </div>
              {event.details && (
                <div className="mt-1 text-xs text-slate-600">
                  {event.status === 'success' && event.details.issueType && (
                    <span>Detected: <strong>{event.details.issueType}</strong> ({event.details.severity})</span>
                  )}
                  {event.status === 'success' && event.details.wardId && (
                    <span>Ward: <strong>{event.details.wardName || event.details.wardId}</strong></span>
                  )}
                  {event.status === 'success' && event.details.departmentId && (
                    <span>Dept: <strong>{event.details.departmentName || event.details.departmentId}</strong></span>
                  )}
                  {event.status === 'error' && event.details.error && (
                    <span className="text-rose-600">{event.details.error}</span>
                  )}
                  {event.status === 'skipped' && event.details.note && (
                    <span className="text-slate-500 italic">{event.details.note}</span>
                  )}
                  {event.status === 'warning' && event.details.message && (
                    <span className="text-amber-700">{event.details.message}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50 animate-fade-in">
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            <span className="text-sm text-amber-800 font-medium">Processing…</span>
          </div>
        )}
      </div>
    </div>
  );
}
