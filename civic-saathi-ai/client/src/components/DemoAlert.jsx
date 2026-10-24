// src/components/DemoAlert.jsx
import { AlertTriangle } from 'lucide-react';

export default function DemoAlert({ className = '' }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl ${className}`}>
      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
      <p className="text-sm text-amber-800">
        <strong>Demo Mode:</strong> This is a simulated civic complaint system. Complaints are{' '}
        <strong>not submitted</strong> to any real municipal authority.
      </p>
    </div>
  );
}
