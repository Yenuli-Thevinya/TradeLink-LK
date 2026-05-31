'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Plumbing', 'Electrical', 'Painting', 'Joinery', 'Other'];

// Defined outside the parent to prevent remount on every keystroke
function Field({ label, name, type = 'text', placeholder, required, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full glass-input px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 ${
          error
            ? 'border-rose-300 focus:ring-rose-200/50'
            : 'border-slate-200/80 focus:ring-violet-400/50'
        } shadow-sm`}
      />
      {error && <p className="text-rose-500 text-xs font-semibold mt-1">{error}</p>}
    </div>
  );
}

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', category: 'Plumbing',
    location: '', contactName: '', contactEmail: '', contactPhone: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (form.contactEmail && !/^\S+@\S+\.\S+$/.test(form.contactEmail)) {
      e.contactEmail = 'Enter a valid email address';
    }
    if (form.contactPhone) {
      // Sri Lanka mobile: 07X XXXXXXX (9 digits after country code, starts with 0)
      const digits = form.contactPhone.replace(/\s/g, '');
      if (!/^0[0-9]{9}$/.test(digits)) {
        e.contactPhone = 'Enter a valid Sri Lanka number (e.g. 071 234 5678)';
      }
    }
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      // Prepend +94 and strip the leading 0 before sending
      const payload = {
        ...form,
        contactPhone: form.contactPhone
          ? '+94' + form.contactPhone.replace(/\s/g, '').replace(/^0/, '')
          : '',
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create job');
      }

      router.push('/');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Link */}
      <button
        onClick={() => router.push('/')}
        className="text-violet-600 text-sm font-semibold hover:text-violet-800 mb-6 flex items-center gap-1.5 group cursor-pointer transition"
      >
        <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
        <span>Back to listings</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1.5 bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
          Post a Service Request
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Describe what you need fixed or done. Interested tradespeople will be able to view details and contact you.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white/65 backdrop-blur-md rounded-2xl border border-slate-200/60 p-6 md:p-8 space-y-5 shadow-sm">
        <Field
          label="Job Title" name="title" placeholder="e.g. Fix leaking kitchen tap"
          required value={form.title} onChange={handleChange} error={errors.title}
        />

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the details of the job, what needs to be fixed, and any requirements..."
            rows={4}
            className={`w-full glass-input px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 resize-none ${
              errors.description
                ? 'border-rose-300 focus:ring-rose-200/50'
                : 'border-slate-200/80 focus:ring-violet-400/50'
            } shadow-sm`}
          />
          {errors.description && <p className="text-rose-500 text-xs font-semibold mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 bg-white shadow-sm cursor-pointer"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Field
            label="Location / Area" name="location" placeholder="e.g. Colombo 03"
            value={form.location} onChange={handleChange} error={errors.location}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Contact Name" name="contactName" placeholder="Your name"
            value={form.contactName} onChange={handleChange} error={errors.contactName}
          />
          <Field
            label="Email Address" name="contactEmail" type="email" placeholder="name@domain.com"
            value={form.contactEmail} onChange={handleChange} error={errors.contactEmail}
          />
        </div>

        {/* Sri Lanka Phone Number */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Number</label>
          <div className="flex gap-2">
            {/* Fixed +94 prefix */}
            <div className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border bg-slate-50 text-slate-600 text-sm font-semibold select-none shrink-0 ${
              errors.contactPhone ? 'border-rose-300' : 'border-slate-200/80'
            }`}>
              <span className="text-base leading-none">🇱🇰</span>
              <span>+94</span>
            </div>
            <div className="flex-1">
              <input
                type="tel"
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleChange}
                placeholder="071 234 5678"
                maxLength={12}
                className={`w-full glass-input px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 ${
                  errors.contactPhone
                    ? 'border-rose-300 focus:ring-rose-200/50'
                    : 'border-slate-200/80 focus:ring-violet-400/50'
                } shadow-sm`}
              />
            </div>
          </div>
          {errors.contactPhone
            ? <p className="text-rose-500 text-xs font-semibold mt-1">{errors.contactPhone}</p>
            : <p className="text-slate-400 text-xs mt-1">Enter your local number starting with 0 (e.g. 071 234 5678)</p>
          }
        </div>

        {serverError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        <div className="flex gap-4 pt-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50 active:scale-[0.98] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl py-2.5 text-sm font-bold hover:opacity-95 hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50 active:scale-[0.98] transition cursor-pointer"
          >
            {submitting ? 'Posting...' : 'Post Request'}
          </button>
        </div>
      </form>
    </div>
  );
}