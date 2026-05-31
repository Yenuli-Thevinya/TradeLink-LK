'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const categoryStyles = {
  Plumbing:   { bg: 'bg-blue-50 text-blue-700 border-blue-200/50',    accent: 'border-l-blue-500' },
  Electrical: { bg: 'bg-amber-50 text-amber-700 border-amber-200/50', accent: 'border-l-amber-500' },
  Painting:   { bg: 'bg-teal-50 text-teal-700 border-teal-200/50',    accent: 'border-l-teal-500' },
  Joinery:    { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200/50',     accent: 'border-l-cyan-500' },
  Other:      { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/50', accent: 'border-l-emerald-500' },
};

const categoryIcons = {
  Plumbing:   (cls) => (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>),
  Electrical: (cls) => (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>),
  Painting:   (cls) => (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>),
  Joinery:    (cls) => (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>),
  Other:      (cls) => (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/></svg>),
};

const starLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

function InlineFeedback({ jobId, onSubmitted, initialFeedback, onCancel }) {
  const [rating, setRating] = useState(initialFeedback?.rating || 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(initialFeedback?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.stopPropagation();
    if (!rating) { setError('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      const url = initialFeedback
        ? `${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}/feedback`;
      const method = initialFeedback ? 'PATCH' : 'POST';
      const body = initialFeedback
        ? JSON.stringify({ feedback: { rating, comment } })
        : JSON.stringify({ rating, comment });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save feedback');
      }
      const updated = await res.json();
      onSubmitted(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="mt-3 bg-emerald-50 border border-emerald-200/70 rounded-xl p-3"
      onClick={e => e.stopPropagation()}
    >
      <p className="text-xs font-bold text-emerald-700 mb-2">
        {initialFeedback ? 'Edit feedback' : 'How was the work?'}
      </p>

      {/* Stars */}
      <div className="flex gap-1 mb-2">
        {[1,2,3,4,5].map(s => (
          <button
            key={s}
            type="button"
            onClick={e => { e.stopPropagation(); setRating(s); setError(''); }}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className="text-xl transition-transform hover:scale-110 cursor-pointer"
          >
            <span className={(hovered || rating) >= s ? 'text-amber-400' : 'text-slate-200'}>★</span>
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs font-semibold text-amber-600 self-center ml-1">{starLabels[rating]}</span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        onClick={e => e.stopPropagation()}
        placeholder="Leave a comment (optional)..."
        rows={2}
        className="w-full text-xs px-3 py-2 rounded-lg border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 resize-none mb-2"
      />

      {error && <p className="text-rose-500 text-xs font-semibold mb-2">{error}</p>}

      <div className="flex gap-2">
        {initialFeedback && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCancel(); }}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-1.5 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`${initialFeedback ? 'flex-1' : 'w-full'} bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition cursor-pointer`}
        >
          {submitting ? 'Submitting...' : initialFeedback ? 'Update' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
}

export default function JobCard({ job: initialJob }) {
  const router = useRouter();
  const [job, setJob] = useState(initialJob);
  const [isEditing, setIsEditing] = useState(false);
  const catStyle = categoryStyles[job.category] || categoryStyles.Other;

  const handleDeleteFeedback = async (e) => {
    e.stopPropagation();
    if (!confirm('Delete this feedback? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('workerToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${job._id}/feedback`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete feedback');
      }
      const updated = await res.json();
      setJob(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleClick = () => {
    const token = localStorage.getItem('workerToken');
    if (!token) {
      router.push(`/login?redirect=/jobs/${job._id}`);
    } else {
      router.push(`/jobs/${job._id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`glass-card rounded-2xl border-l-[5px] ${catStyle.accent} p-5 cursor-pointer relative overflow-hidden group`}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Title + status */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <h2 className="font-bold text-slate-800 text-base md:text-lg leading-snug group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
          {job.title}
        </h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap shadow-sm ${
          job.status === 'Open'        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          job.status === 'In Progress' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                         'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {job.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">{job.description}</p>

      {/* Applier name */}
      {job.contactName && (
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
            <span className="text-white text-[9px] font-bold uppercase leading-none">
              {job.contactName.charAt(0)}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">{job.contactName}</span>
        </div>
      )}

      {/* Assigned worker — shown when In Progress */}
      {job.status === 'In Progress' && job.assignedWorker?.name && (
        <div className="flex items-center gap-2 mb-3 bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <span className="text-white text-[9px] font-bold leading-none">
              {job.assignedWorker.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-amber-800 leading-tight truncate">{job.assignedWorker.name}</p>
            <p className="text-[10px] text-amber-600 leading-tight">{job.assignedWorker.phone}</p>
          </div>
          <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full whitespace-nowrap">Assigned</span>
        </div>
      )}

      {/* Closed with feedback — show stars or edit form */}
      {job.status === 'Closed' && job.feedback?.rating && (
        isEditing ? (
          <InlineFeedback
            jobId={job._id}
            initialFeedback={job.feedback}
            onSubmitted={(updated) => {
              setJob(updated);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="flex items-center justify-between mb-3 bg-emerald-50 border border-emerald-200/60 rounded-xl px-3 py-2" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex gap-0.5 shrink-0">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-sm ${s <= job.feedback.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                ))}
              </div>
              <span className="text-xs font-semibold text-emerald-700 shrink-0">{starLabels[job.feedback.rating]}</span>
              {job.feedback.comment && (
                <span className="text-[10px] text-slate-500 truncate ml-1">&quot;{job.feedback.comment}&quot;</span>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2 border-l border-emerald-200/60 pl-2 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteFeedback}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-700 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )
      )}

      {/* Closed without feedback — show inline feedback form */}
      {job.status === 'Closed' && !job.feedback?.rating && (
        <InlineFeedback
          jobId={job._id}
          onSubmitted={(updated) => setJob(updated)}
        />
      )}

      {/* Footer: category + location + date */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 mt-3 border-t border-slate-100/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {job.category && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border ${catStyle.bg}`}>
              {categoryIcons[job.category] ? categoryIcons[job.category]("w-3.5 h-3.5") : categoryIcons.Other("w-3.5 h-3.5")}
              <span>{job.category}</span>
            </span>
          )}
          {job.location && (
            <span className="inline-flex items-center gap-0.5 text-slate-500">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{job.location}</span>
            </span>
          )}
        </div>
        <span className="text-slate-400 font-medium">
          {new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}