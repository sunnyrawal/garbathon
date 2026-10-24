// src/pages/TrackPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { getComplaint } from '../services/api.js';
import ComplaintCard from '../components/ComplaintCard.jsx';
import DemoAlert from '../components/DemoAlert.jsx';

export default function TrackPage() {
  const [searchParams] = useSearchParams();
  const [ticketId, setTicketId] = useState(searchParams.get('id') || '');
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Auto-search if ID provided via URL
  useEffect(() => {
    const urlId = searchParams.get('id');
    if (urlId) {
      setTicketId(urlId);
      handleSearch(urlId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (id = ticketId) => {
    const trimmed = id?.trim().toUpperCase();
    if (!trimmed) { toast.error('Please enter a tracking ID.'); return; }

    setIsLoading(true);
    setError(null);
    setComplaint(null);
    setSearched(true);

    try {
      const res = await getComplaint(trimmed);
      setComplaint(res.data);
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'TICKET_NOT_FOUND') {
        setError(`No complaint found for "${trimmed}". Please verify the tracking ID.`);
      } else if (code === 'INVALID_ID_FORMAT') {
        setError('Invalid tracking ID format. IDs start with CS-DEMO-.');
      } else {
        setError(err.userMessage || 'Could not retrieve complaint. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <DemoAlert className="mb-6" />

      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-slate-800">Track a Complaint</h1>
        <p className="text-slate-500 text-sm mt-1">Enter your tracking ID to see the current status.</p>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
        <label htmlFor="ticket-id" className="block text-sm font-semibold text-slate-700 mb-2">
          Complaint Tracking ID
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              id="ticket-id"
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="CS-DEMO-..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          <button
            id="btn-search"
            onClick={() => handleSearch()}
            disabled={isLoading || !ticketId.trim()}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl disabled:opacity-50 hover:shadow-lg hover:shadow-amber-500/20 transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">Example: CS-DEMO-SAMPLE01</p>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          <span>Looking up complaint…</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-800">Complaint Not Found</p>
            <p className="text-sm text-rose-700 mt-0.5">{error}</p>
            <p className="text-xs text-rose-500 mt-2">
              Tip: Try CS-DEMO-SAMPLE01, CS-DEMO-SAMPLE02, or CS-DEMO-SAMPLE03 for demo complaints.
            </p>
          </div>
        </div>
      )}

      {complaint && !isLoading && (
        <div className="animate-fade-in-up space-y-4">
          <ComplaintCard complaint={complaint} />
          <div className="flex gap-3">
            <Link
              to={`/assistant?ticket=${complaint.ticketId}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm"
            >
              <MessageSquare className="w-4 h-4" /> Ask AI About This
            </Link>
          </div>
        </div>
      )}

      {!isLoading && !complaint && !error && searched && (
        <div className="text-center py-10 text-slate-400">
          <p>No results yet.</p>
        </div>
      )}
    </div>
  );
}
