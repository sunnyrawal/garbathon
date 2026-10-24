// src/pages/LandingPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, FileText, MapPin, Building2,
  Ticket, Zap, Shield, AlertTriangle, TrendingUp
} from 'lucide-react';
import { listComplaints } from '../services/api.js';
import { formatIssueType, ISSUE_ICONS, getStatusClass } from '../utils/helpers.js';

const CATEGORIES = [
  { type: 'pothole', label: 'Pothole', desc: 'Road damage & craters', color: 'from-orange-500 to-red-500', icon: '🕳️' },
  { type: 'garbage', label: 'Garbage', desc: 'Waste & dumping', color: 'from-green-500 to-emerald-600', icon: '🗑️' },
  { type: 'broken_streetlight', label: 'Streetlight', desc: 'Electrical & lighting', color: 'from-yellow-400 to-amber-500', icon: '💡' },
  { type: 'waterlogging', label: 'Waterlogging', desc: 'Drainage & flooding', color: 'from-blue-500 to-cyan-600', icon: '🌊' },
];

const HOW_IT_WORKS = [
  { icon: FileText, step: '01', title: 'Upload Photo', desc: 'Take a photo of the civic issue and upload it.' },
  { icon: Zap, step: '02', title: 'AI Analyzes', desc: 'Gemini AI identifies the issue, ward & department.' },
  { icon: Ticket, step: '03', title: 'Get Ticket ID', desc: 'A complaint is filed and you receive a tracking ID.' },
  { icon: MapPin, step: '04', title: 'Track Status', desc: 'Check your complaint status anytime with the ID.' },
];

export default function LandingPage() {
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    listComplaints()
      .then(({ data }) => {
        const all = data?.complaints || [];
        const resolved = all.filter((c) => c.status === 'Resolved').length;
        setStats({ total: all.length, resolved, pending: all.length - resolved });
        setRecentComplaints(all.slice(-3).reverse());
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
          {/* Demo badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-8 animate-fade-in">
            <AlertTriangle className="w-3.5 h-3.5" />
            DEMO SYSTEM — Not connected to any real municipality
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-6xl text-white leading-tight mb-6 animate-fade-in-up">
            Report a problem.
            <br />
            <span className="gradient-text">Let AI handle the routing.</span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up">
            Citizens shouldn't need to know which department handles potholes vs waterlogging.
            CivicSaathi AI identifies the issue, finds your ward, and files the complaint — automatically.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <Link
              to="/report"
              id="btn-report-issue"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-amber-500/30 hover:scale-105 transition-all duration-200"
            >
              Report an Issue <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/track"
              id="btn-track-complaint"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200"
            >
              <MapPin className="w-4 h-4" /> Track a Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* Issue Categories */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display font-bold text-2xl text-slate-800 text-center mb-3">
          What can you report?
        </h2>
        <p className="text-slate-500 text-center mb-10">
          Upload a photo and the AI does the rest.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.type}
              to={`/report?type=${cat.type}`}
              className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center"
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <p className="font-semibold text-slate-800 text-sm">{cat.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      {stats.total > 0 && (
        <section className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-3 gap-6 text-center">
            <StatCard value={stats.total} label="Complaints Filed" color="text-amber-400" />
            <StatCard value={stats.resolved} label="Resolved" color="text-emerald-400" />
            <StatCard value={stats.pending} label="Pending" color="text-blue-400" />
          </div>
          <p className="text-center text-slate-500 text-xs mt-4">
            * Stats derived from local demo records only.
          </p>
        </section>
      )}

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display font-bold text-2xl text-slate-800 text-center mb-3">
          How CivicSaathi AI works
        </h2>
        <p className="text-slate-500 text-center mb-10">
          A real agent that executes tools — not just a chatbot.
        </p>
        <div className="grid sm:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative text-center group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center group-hover:border-amber-400 transition-colors">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-xs font-bold text-amber-500 tracking-widest">STEP {step.step}</span>
                <h3 className="font-display font-semibold text-slate-800 mt-1">{step.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent complaints */}
      {recentComplaints.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="font-display font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Recent Demo Complaints
          </h2>
          <div className="space-y-3">
            {recentComplaints.map((c) => (
              <Link
                key={c.ticketId}
                to={`/track?id=${c.ticketId}`}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-amber-300 hover:shadow-sm transition-all"
              >
                <span className="text-xl">{ISSUE_ICONS[c.issueType] || '❓'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{formatIssueType(c.issueType)}</p>
                  <p className="text-xs text-slate-500 truncate">{c.area} · {c.wardName}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${getStatusClass(c.status)}`}>
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/track" className="text-amber-600 text-sm font-medium hover:underline">
              Track a complaint →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div>
      <p className={`font-display font-bold text-4xl ${color}`}>{value}</p>
      <p className="text-slate-400 text-sm mt-1">{label}</p>
    </div>
  );
}
