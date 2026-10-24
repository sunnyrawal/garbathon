// src/pages/ReportPage.jsx
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, Camera, AlertCircle, CheckCircle2,
  ChevronDown, Loader2, ArrowRight, MapPin, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzeImage, createComplaint } from '../services/api.js';
import ActivityTimeline from '../components/ActivityTimeline.jsx';
import DemoAlert from '../components/DemoAlert.jsx';
import { formatIssueType, ISSUE_ICONS, getSeverityClass } from '../utils/helpers.js';

const ISSUE_TYPES = ['pothole', 'garbage', 'broken_streetlight', 'waterlogging', 'other'];
const SEVERITIES = ['low', 'medium', 'high'];
const SUPPORTED_AREAS = [
  'Central Market', 'Riverfront Extension', 'Green Park',
  'Lakeview Road', 'Sunrise Colony', 'Station Road',
  'Navrangpura', 'Maninagar',
];

const STEPS = ['Upload', 'Analyze', 'Confirm', 'Done'];

export default function ReportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(0); // 0=upload, 1=analyze, 2=confirm, 3=done

  // Upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [area, setArea] = useState('');

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [ward, setWard] = useState(null);
  const [department, setDepartment] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [analysisError, setAnalysisError] = useState(null);

  // Editable fields
  const [editedType, setEditedType] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [editedSeverity, setEditedSeverity] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaint, setComplaint] = useState(null);

  const handleFileDrop = useCallback((file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAnalysis(null);
    setTimeline([]);
    setStep(0);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileDrop(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!imageFile) { toast.error('Please select an image.'); return; }
    if (!area) { toast.error('Please enter an area or locality.'); return; }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setTimeline([]);

    try {
      const res = await analyzeImage(imageFile, area);
      const { analysis: a, ward: w, department: d, timeline: t } = res.data;
      setAnalysis(a);
      setWard(w?.success ? w : null);
      setDepartment(d?.success ? d : null);
      setTimeline(t || []);
      setEditedType(a.issueType);
      setEditedDesc(a.description);
      setEditedSeverity(a.severity);
      setStep(1);
      toast.success('Analysis complete!');
    } catch (err) {
      setAnalysisError(err.userMessage || 'Analysis failed. Please try again.');
      toast.error(err.userMessage || 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const idempotencyKey = `${imageFile?.name}-${Date.now()}`;
      const res = await createComplaint({
        issueType: editedType,
        description: editedDesc,
        severity: editedSeverity,
        area,
        wardId: ward?.wardId,
        wardName: ward?.wardName,
        departmentId: department?.departmentId,
        departmentName: department?.departmentName,
        confidence: analysis?.confidence,
        recommendedAction: analysis?.recommendedAction,
        idempotencyKey,
      });
      setComplaint(res.data.complaint);

      setTimeline((prev) => [
        ...prev,
        { step: 'COMPLAINT_CREATED', status: 'success', timestamp: new Date().toISOString(),
          details: { ticketId: res.data.complaint.ticketId } },
        { step: 'TICKET_PERSISTED', status: 'success', timestamp: new Date().toISOString(), details: {} },
      ]);
      setStep(3);
      toast.success(`Complaint filed! ID: ${res.data.complaint.ticketId}`);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to create complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setAnalysis(null);
    setWard(null);
    setDepartment(null);
    setTimeline([]);
    setArea('');
    setStep(0);
    setComplaint(null);
    setAnalysisError(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <DemoAlert className="mb-6" />

      {/* Progress stepper */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
              i < step ? 'bg-emerald-500 text-white' :
              i === step ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' :
              'bg-slate-200 text-slate-400'
            }`}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <div className="ml-2 hidden sm:block">
              <p className={`text-xs font-semibold ${i <= step ? 'text-slate-800' : 'text-slate-400'}`}>{s}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* STEP 0: Upload */}
      {step === 0 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">Report a Civic Issue</h1>
            <p className="text-slate-500 text-sm mt-1">Upload a photo and let AI handle the rest.</p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
              isDragging ? 'drop-zone-active' :
              imagePreview ? 'border-emerald-300 bg-emerald-50 cursor-default' :
              'border-slate-300 hover:border-amber-400 hover:bg-amber-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              id="image-upload"
              onChange={(e) => handleFileDrop(e.target.files[0])}
            />
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-72 object-contain rounded-2xl"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); resetForm(); }}
                  className="absolute top-3 right-3 bg-rose-500 text-white rounded-full p-1.5 hover:bg-rose-600 transition-colors shadow-lg"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="absolute bottom-3 right-3 bg-white/90 text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-white transition-colors shadow-md flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Replace
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-amber-600" />
                </div>
                <p className="font-semibold text-slate-700">Drag & drop your photo here</p>
                <p className="text-slate-500 text-sm mt-1">or click to browse</p>
                <p className="text-xs text-slate-400 mt-3">JPEG, PNG, WebP · Max 10MB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  <Camera className="w-4 h-4" /> Choose File
                </button>
              </div>
            )}
          </div>

          {/* Area input */}
          <div>
            <label htmlFor="area-input" className="block text-sm font-semibold text-slate-700 mb-2">
              Area / Locality <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="area-input"
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Central Market, Green Park…"
                list="area-suggestions"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
              <datalist id="area-suggestions">
                {SUPPORTED_AREAS.map((a) => <option key={a} value={a} />)}
              </datalist>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Supported: {SUPPORTED_AREAS.slice(0, 4).join(', ')}…
            </p>
          </div>

          {analysisError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {analysisError}
            </div>
          )}

          <button
            id="btn-analyze"
            onClick={handleAnalyze}
            disabled={!imageFile || !area || isAnalyzing}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-amber-500/30 hover:scale-[1.01] transition-all"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing with AI…</>
            ) : (
              <><Zap className="w-4 h-4" /> Analyze with AI</>
            )}
          </button>
          {isAnalyzing && <ActivityTimeline events={timeline} isLoading={true} />}
        </div>
      )}

      {/* STEP 1: Analysis Results */}
      {step === 1 && analysis && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl text-slate-800">Analysis Results</h2>
              <p className="text-slate-500 text-sm">Review and edit if needed before filing.</p>
            </div>
            {analysis.isDemo && (
              <span className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-700 text-xs font-bold rounded-full">
                DEMO ANALYSIS
              </span>
            )}
          </div>

          {/* Image thumbnail */}
          {imagePreview && (
            <img src={imagePreview} alt="Uploaded" className="w-full max-h-48 object-contain rounded-xl border border-slate-200" />
          )}

          {/* Edit form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="issue-type" className="block text-xs font-semibold text-slate-500 uppercase mb-1">Issue Type</label>
                <div className="relative">
                  <select
                    id="issue-type"
                    value={editedType}
                    onChange={(e) => setEditedType(e.target.value)}
                    className="w-full pr-8 pl-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none"
                  >
                    {ISSUE_TYPES.map((t) => (
                      <option key={t} value={t}>{ISSUE_ICONS[t]} {formatIssueType(t)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label htmlFor="severity" className="block text-xs font-semibold text-slate-500 uppercase mb-1">Severity</label>
                <div className="relative">
                  <select
                    id="severity"
                    value={editedSeverity}
                    onChange={(e) => setEditedSeverity(e.target.value)}
                    className="w-full pr-8 pl-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none"
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
              <textarea
                id="description"
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {analysis.confidence && (
              <p className="text-xs text-slate-500">
                AI confidence: <strong>{Math.round(analysis.confidence * 100)}%</strong>
                {' '}(indicative, not scientifically calibrated)
              </p>
            )}

            {analysis.warnings && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {analysis.warnings}
              </div>
            )}
          </div>

          {/* Ward & Dept */}
          {(ward || department) && (
            <div className="grid grid-cols-2 gap-4">
              {ward && (
                <InfoBox icon="🏛️" label="Ward" value={ward.wardName} sub={ward.zone ? `Zone: ${ward.zone}` : null} />
              )}
              {department && (
                <InfoBox icon="🏢" label="Department" value={department.departmentName} sub={department.reason?.slice(0, 60) + '…'} />
              )}
            </div>
          )}

          {!ward && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              ⚠️ Could not match "{area}" to a ward. The complaint will be filed without ward assignment.
            </div>
          )}

          <ActivityTimeline events={timeline} />

          <div className="flex gap-3">
            <button
              onClick={() => setStep(0)}
              className="flex-1 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              ← Back
            </button>
            <button
              id="btn-confirm"
              onClick={() => setStep(2)}
              disabled={!editedType || !editedDesc}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl disabled:opacity-50 hover:shadow-lg transition-all"
            >
              Confirm & File <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Confirmation */}
      {step === 2 && analysis && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-800">Confirm Complaint</h2>
            <p className="text-slate-500 text-sm mt-1">Review all details before filing.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <Row label="Issue Type" value={`${ISSUE_ICONS[editedType] || ''} ${formatIssueType(editedType)}`} />
            <Row label="Severity" value={editedSeverity?.toUpperCase()} />
            <Row label="Description" value={editedDesc} />
            <Row label="Area" value={area} />
            {ward && <Row label="Ward" value={ward.wardName} />}
            {department && <Row label="Department" value={department.departmentName} />}
            <Row label="Status (initial)" value="Submitted (Demo)" />
          </div>

          <DemoAlert />

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              ← Edit
            </button>
            <button
              id="btn-submit"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Filing…</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> File Complaint</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Success */}
      {step === 3 && complaint && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-800">Complaint Filed!</h2>
            <p className="text-slate-500 text-sm mt-2">Your complaint has been recorded in the demo system.</p>
          </div>

          <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-2xl p-6 text-center">
            <p className="text-slate-400 text-xs mb-2 uppercase tracking-widest">Tracking ID</p>
            <p className="font-mono font-bold text-2xl text-amber-400">{complaint.ticketId}</p>
            <p className="text-slate-400 text-xs mt-2">Save this ID to track your complaint</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <Row label="Issue" value={`${ISSUE_ICONS[complaint.issueType]} ${formatIssueType(complaint.issueType)}`} />
            <Row label="Area" value={complaint.area} />
            <Row label="Ward" value={complaint.wardName} />
            <Row label="Department" value={complaint.departmentName} />
            <Row label="Status" value={complaint.status} />
          </div>

          <ActivityTimeline events={timeline} />

          <DemoAlert />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetForm}
              className="flex-1 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Report Another
            </button>
            <button
              onClick={() => navigate(`/track?id=${complaint.ticketId}`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <MapPin className="w-4 h-4" /> Track Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Zap({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function InfoBox({ icon, label, value, sub }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs text-slate-500 font-semibold uppercase mb-1">{icon} {label}</p>
      <p className="font-semibold text-slate-800 text-sm">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{sub}</p>}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}
