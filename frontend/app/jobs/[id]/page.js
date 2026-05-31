'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// ── Star Rating Component ──────────────────────────────
// ── Assign Worker Modal ────────────────────────────────
function AssignWorkerModal({ onConfirm, onCancel, loading }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!phone.trim()) e.phone = 'Phone is required';
    else {
      const digits = phone.replace(/\s/g, '');
      if (!/^0[0-9]{9}$/.test(digits)) e.phone = 'Enter a valid Sri Lanka number (e.g. 071 234 5678)';
    }
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const digits = phone.replace(/\s/g, '');
    onConfirm({ name: name.trim(), phone: '+94' + digits.replace(/^0/, '') });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(15,23,42,0.45)', backdropFilter:'blur(4px)'}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 fade-up">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">Assign a Worker</h2>
            <p className="text-slate-500 text-xs">Enter the details of the person being assigned</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Worker Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setErrors({...errors, name:''}); }}
              placeholder="e.g. Kamal Perera"
              className={`w-full glass-input px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 ${errors.name ? 'border-rose-300 focus:ring-rose-200/50' : 'border-slate-200/80 focus:ring-amber-400/50'} shadow-sm`}
            />
            {errors.name && <p className="text-rose-500 text-xs font-semibold mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Number <span className="text-rose-500">*</span></label>
            <div className="flex gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border bg-slate-50 text-slate-600 text-sm font-semibold select-none shrink-0 ${errors.phone ? 'border-rose-300' : 'border-slate-200/80'}`}>
                <span>🇱🇰</span><span>+94</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setErrors({...errors, phone:''}); }}
                placeholder="071 234 5678"
                maxLength={12}
                className={`flex-1 glass-input px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 ${errors.phone ? 'border-rose-300 focus:ring-rose-200/50' : 'border-slate-200/80 focus:ring-amber-400/50'} shadow-sm`}
              />
            </div>
            {errors.phone && <p className="text-rose-500 text-xs font-semibold mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl py-2.5 text-sm font-bold hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Detail Page ───────────────────────────────────
export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('workerToken') : null;

  useEffect(() => {
    if (!token) { router.replace(`/login?redirect=/jobs/${id}`); return; }
    const fetchJob = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) { router.replace(`/login?redirect=/jobs/${id}`); return; }
        if (!res.ok) throw new Error('Job not found');
        setJob(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, token]);

  // Called by the status dropdown
  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'In Progress') {
      setPendingStatus(newStatus);
      setShowAssignModal(true);
      return;
    }
    await applyStatusUpdate(newStatus, {});
  };

  const applyStatusUpdate = async (status, extra = {}) => {
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, ...extra }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setJob(await res.json());
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignConfirm = async (assignedWorker) => {
    await applyStatusUpdate('In Progress', { assignedWorker });
    setShowAssignModal(false);
    setPendingStatus(null);
  };

  const handleModalCancel = () => {
    setShowAssignModal(false);
    setPendingStatus(null);
  };

  const handleDeleteFeedback = async () => {
    if (!confirm('Delete this feedback? This cannot be undone.')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}/feedback`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete feedback');
      setJob(await res.json());
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (job?.status === 'In Progress') return;
    if (!confirm('Are you sure you want to delete this job? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete job');
      router.push('/');
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-600 mb-3" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Loading request details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center bg-red-50 border border-red-200 text-red-600 rounded-2xl p-8 max-w-xl mx-auto shadow-sm">
        <h3 className="font-bold mb-1">Failed to find job</h3>
        <p className="text-sm text-red-500 mb-4">{error}</p>
        <button onClick={() => router.push('/')} className="px-5 py-2.5 bg-red-600 text-white font-semibold text-xs rounded-xl hover:bg-red-700 transition">
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Modals */}
      {showAssignModal && (
        <AssignWorkerModal
          loading={updating}
          onConfirm={handleAssignConfirm}
          onCancel={handleModalCancel}
        />
      )}

      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <button
          onClick={() => router.push('/')}
          className="text-violet-600 text-sm font-semibold hover:text-violet-800 mb-6 flex items-center gap-1.5 group cursor-pointer transition"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
          <span>Back to listings</span>
        </button>

        {/* Main Detail Card */}
        <div className="bg-white/65 backdrop-blur-md rounded-2xl border border-slate-200/60 p-6 md:p-8 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5 pb-5 border-b border-slate-200/50">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-snug">{job.title}</h1>
              <p className="text-xs text-slate-400 mt-1">Job ID: {job._id}</p>
            </div>
            <span className={`self-start text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap shadow-sm ${
              job.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              job.status === 'In Progress' ? 'bg-amber-50 text-amber-600 border-amber-200' :
              'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {job.status}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Project Description</h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed bg-white/40 border border-slate-100 p-4 rounded-xl whitespace-pre-line shadow-xs">
              {job.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Job Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              { label: 'Category', value: job.category, icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> },
              { label: 'Location / Area', value: job.location || '—', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
              { label: 'Contact Person', value: job.contactName || '—', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
              { label: 'Email Address', value: job.contactEmail || '—', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
              { label: 'Contact Number', value: job.contactPhone || '—', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
              { label: 'Date Posted', value: new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white/45 border border-slate-200/50 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
                <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-slate-700 font-bold text-sm leading-tight">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Assigned Worker Card — shown when In Progress or Closed */}
          {job.assignedWorker?.name && (
            <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 md:p-5 mb-6">
              <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-3">Assigned Worker</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">{job.assignedWorker.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{job.assignedWorker.name}</p>
                  <p className="text-slate-500 text-xs">{job.assignedWorker.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Card — shown when Closed and feedback exists, with delete */}
          {job.feedback?.rating && (
            <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-4 md:p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Customer Feedback</h3>
                <button
                  onClick={handleDeleteFeedback}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                  </svg>
                  Delete
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-xl ${s <= job.feedback.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                ))}
                <span className="text-slate-600 text-sm font-semibold ml-1">
                  {['','Poor','Fair','Good','Very Good','Excellent'][job.feedback.rating]}
                </span>
              </div>
              {job.feedback.comment && (
                <p className="text-slate-600 text-sm leading-relaxed bg-white/60 rounded-xl p-3 border border-emerald-100">
                  &quot;{job.feedback.comment}&quot;
                </p>
              )}
              {job.feedback.submittedAt && (
                <p className="text-slate-400 text-xs mt-2">
                  Submitted {new Date(job.feedback.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          )}

          {/* Status Update */}
          <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 md:p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Update Status</label>
              <p className="text-slate-500 text-xs leading-relaxed">
                Let tradespeople know the current progress of this work.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={job.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="glass-input px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 bg-white font-semibold text-slate-700 cursor-pointer disabled:opacity-50"
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Closed</option>
              </select>
              {updating && <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-600 border-t-transparent" />}
            </div>
          </div>

          {/* Delete — disabled when In Progress */}
          <div className="pt-4 border-t border-slate-200/40">
            {job.status === 'In Progress' ? (
              <div className="w-full bg-slate-100 text-slate-400 border border-slate-200 rounded-xl py-3 text-sm font-bold text-center flex items-center justify-center gap-2 select-none">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Cannot delete — job is In Progress
              </div>
            ) : (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full bg-rose-50 hover:bg-rose-100/70 text-rose-600 border border-rose-200/80 rounded-xl py-3 text-sm font-bold active:scale-[0.99] transition cursor-pointer"
              >
                {deleting ? 'Deleting request...' : (
                  <span className="inline-flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Delete this request
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}