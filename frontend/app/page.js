'use client';
import { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Painting', 'Joinery', 'Other'];

const catIcons = {
  All:        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>,
  Plumbing:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>,
  Electrical: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Painting:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3zM3 21v-3l9-9"/></svg>,
  Joinery:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  Other:      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
};

/* Category photo strips shown under filter pills */
const catImages = {
  Plumbing:   'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1200&q=85',
  Electrical: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
  Painting:   'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=85',
  Joinery:    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=85',
  Other:      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=85',
};

/* Hero right panel with real photos */
function HeroPanel() {
  const photos = [
    {
      url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=85',
      label: 'Plumbing', color: '#0d9488',
    },
    {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85',
      label: 'Electrical', color: '#2563eb',
    },
    {
      url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=85',
      label: 'Painting', color: '#059669',
    },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'14px', width:'420px', flexShrink:0 }}>
      {photos.map((p, i) => (
        <div key={i} className="hero-stat-card" style={{
          padding:0, overflow:'hidden', flexDirection:'row', alignItems:'center', gap:0,
          animationDelay: `${i * -1.4}s`,
        }}>
          <img
            src={p.url}
            alt={p.label}
            style={{
              width:140, height:120, objectFit:'cover', flexShrink:0,
              borderRadius:'14px 0 0 14px',
            }}
          />
          <div style={{ padding:'12px 16px' }}>
            <span style={{
              display:'inline-block', fontSize:'0.7rem', fontWeight:700,
              letterSpacing:'0.07em', textTransform:'uppercase',
              color: p.color, marginBottom:4,
            }}>{p.label}</span>
            <p style={{ fontSize:'0.8125rem', color:'#64748b', lineHeight:1.5, margin:0 }}>
              {p.label === 'Plumbing' && 'Leaks, installs & drainage'}
              {p.label === 'Electrical' && 'Wiring, fixtures & safety'}
              {p.label === 'Painting' && 'Interior & exterior finishes'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Banner image shown when a specific category is selected */
function CategoryBanner({ category }) {
  if (category === 'All' || !catImages[category]) return null;
  return (
    <div style={{
      borderRadius:'18px', overflow:'hidden', height:'260px', position:'relative',
      border:'1px solid rgba(15,23,42,0.07)',
      boxShadow:'0 2px 12px rgba(15,23,42,0.06)',
    }}>
      <img
        src={catImages[category]}
        alt={category}
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
      />
      <div style={{
        position:'absolute', inset:0,
        background:'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.10) 60%)',
        display:'flex', alignItems:'center', padding:'0 2rem',
      }}>
        <div>
          <p style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.75)', fontWeight:600,
            textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 6px' }}>Browsing</p>
          <h2 style={{ fontSize:'2rem', fontWeight:900, color:'#fff',
            letterSpacing:'-0.03em', margin:0 }}>{category}</h2>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [jobs, setJobs]         = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true); setError('');
      try {
        const p = new URLSearchParams();
        if (category !== 'All') p.append('category', category);
        if (search.trim()) p.append('search', search.trim());
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs?${p}`);
        if (!res.ok) throw new Error('Failed to fetch jobs');
        setJobs(await res.json());
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    const t = setTimeout(run, 300);
    return () => clearTimeout(t);
  }, [category, search]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'2.5rem' }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="fade-up" style={{
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:'4rem',
        background:'#ffffff', borderRadius:'24px', padding:'3rem 3.5rem',
        border:'1px solid rgba(15,23,42,0.07)',
        boxShadow:'0 2px 16px rgba(15,23,42,0.05)',
        overflow:'hidden', position:'relative',
      }}>
        {/* Decorative background accent */}
        <div style={{
          position:'absolute', top:-80, right:340, width:320, height:320, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)',
          pointerEvents:'none',
        }}/>

        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:'1.75rem', position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:'6px',
              padding:'5px 14px', borderRadius:'999px', fontSize:'0.8125rem',
              fontWeight:600, letterSpacing:'0.04em',
              background:'rgba(13,148,136,0.08)', color:'#0d9488',
              border:'1px solid rgba(13,148,136,0.18)',
            }}>
              <span style={{ width:7,height:7,borderRadius:'50%',background:'#0d9488',display:'inline-block' }}/>
              TradeLink Platform
            </span>
            <span style={{
              padding:'5px 14px', borderRadius:'999px', fontSize:'0.8125rem',
              fontWeight:600, background:'rgba(37,99,235,0.07)',
              color:'#2563eb', border:'1px solid rgba(37,99,235,0.18)',
            }}>Free to use</span>
          </div>

          <div>
            <h1 className="text-gradient" style={{
              fontSize:'clamp(2.4rem, 3.2vw, 3.5rem)', fontWeight:900,
              lineHeight:1.1, letterSpacing:'-0.04em', marginBottom:'1.125rem',
            }}>
              Find Trusted<br/>Tradespeople
            </h1>
            <p style={{ fontSize:'1.125rem', color:'#475569', lineHeight:1.75, maxWidth:'460px', fontWeight:400 }}>
              Browse service requests posted by homeowners across every trade. Connect with work that fits your skills, or post your own request in minutes.
            </p>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
            <a href="/new" style={{
              display:'inline-flex', alignItems:'center', gap:'8px',
              padding:'0.75rem 1.5rem', borderRadius:'12px', fontSize:'0.9375rem',
              fontWeight:700, color:'#fff', cursor:'pointer',
              background:'linear-gradient(110deg,#0d9488,#2563eb)', border:'none',
              textDecoration:'none', boxShadow:'0 4px 14px rgba(13,148,136,0.30)',
            }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              Post a Request
            </a>
            <span style={{ fontSize:'0.875rem', color:'#94a3b8', fontWeight:500 }}>No account needed</span>
          </div>

          {/* Trust strip */}
          <div style={{
            display:'flex', alignItems:'center', gap:'1.5rem',
            padding:'1rem 1.25rem', borderRadius:'14px',
            background:'#f8fafc', border:'1px solid rgba(15,23,42,0.06)',
            width:'fit-content',
          }}>
            {[
              { n:'24+', l:'Open Jobs',     c:'#0d9488' },
              { n:'100+', l:'Tradespeople', c:'#2563eb' },
              { n:'5',   l:'Categories',    c:'#059669' },
            ].map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'baseline', gap:'5px',
                paddingRight: i < 2 ? '1.5rem' : 0,
                borderRight: i < 2 ? '1px solid #e2e8f0' : 'none' }}>
                <span style={{ fontSize:'1.25rem', fontWeight:800, color:s.c }}>{s.n}</span>
                <span style={{ fontSize:'0.8125rem', color:'#94a3b8', fontWeight:500 }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        <HeroPanel />
      </section>

      {/* ── Search + Filter ───────────────────────────────── */}
      <section className="fade-up fade-up-delay-1" style={{
        background:'#ffffff', borderRadius:'20px', padding:'1.5rem 2rem',
        border:'1px solid rgba(15,23,42,0.07)',
        boxShadow:'0 1px 6px rgba(15,23,42,0.04)',
        display:'flex', flexDirection:'column', gap:'1.25rem',
      }}>
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', top:'50%', left:'1rem', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none', display:'flex' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input
            type="text"
            placeholder="Search by title, description, or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="glass-input"
            style={{
              width:'100%', paddingLeft:'2.75rem', paddingRight:'1rem',
              paddingTop:'0.8125rem', paddingBottom:'0.8125rem',
              borderRadius:'12px', fontSize:'0.9375rem', boxSizing:'border-box',
            }}
          />
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
          <span style={{ fontSize:'0.8125rem', fontWeight:600, color:'#94a3b8', marginRight:'4px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Filter</span>
          {CATEGORIES.map(c => {
            const active = category === c;
            return (
              <button key={c} onClick={() => setCategory(c)}
                className={active ? 'pill-active' : ''}
                style={{
                  display:'inline-flex', alignItems:'center', gap:'6px',
                  padding:'0.4375rem 1rem', borderRadius:'10px',
                  fontSize:'0.875rem', fontWeight:600, cursor:'pointer',
                  border: active ? 'none' : '1.5px solid #e2e8f0',
                  background: active ? undefined : '#f8fafc',
                  color: active ? undefined : '#475569',
                  transition:'all 0.18s ease',
                }}
              >
                {catIcons[c]}{c}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Category banner image ────────────────────────── */}
      {category !== 'All' && (
        <div className="fade-up">
          <CategoryBanner category={category} />
        </div>
      )}

      {/* ── Results header ────────────────────────────────── */}
      {!loading && !error && jobs.length > 0 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'-1rem' }}>
          <h2 style={{ fontSize:'1.0625rem', fontWeight:700, color:'#0f172a' }}>
            {jobs.length} request{jobs.length !== 1 ? 's' : ''} found
            {category !== 'All' && <span style={{ color:'#0d9488' }}> · {category}</span>}
          </h2>
          <span style={{ fontSize:'0.875rem', color:'#94a3b8' }}>Sorted by newest</span>
        </div>
      )}

      {/* ── States ────────────────────────────────────────── */}
      {loading && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'5rem 0' }}>
          <div className="animate-spin" style={{
            width:'2.25rem', height:'2.25rem', borderRadius:'50%',
            border:'2.5px solid #e2e8f0', borderTopColor:'#0d9488', marginBottom:'0.875rem',
          }}/>
          <p style={{ color:'#94a3b8', fontSize:'0.9375rem', fontWeight:500 }}>Loading requests…</p>
        </div>
      )}

      {error && (
        <div style={{ textAlign:'center', background:'#fff5f5', border:'1px solid #fed7d7', borderRadius:'16px', padding:'2.5rem' }}>
          <p style={{ fontWeight:700, color:'#c53030', marginBottom:'0.5rem' }}>Failed to load jobs</p>
          <p style={{ fontSize:'0.9375rem', color:'#e53e3e', marginBottom:'1.25rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{
            padding:'0.5rem 1.25rem', background:'#c53030', color:'#fff',
            fontWeight:600, fontSize:'0.875rem', borderRadius:'10px', cursor:'pointer', border:'none',
          }}>Try Again</button>
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div style={{
          textAlign:'center', background:'#ffffff',
          border:'1px solid rgba(15,23,42,0.07)', borderRadius:'20px', padding:'4rem 2rem',
        }}>
          <div style={{
            width:56, height:56, borderRadius:16, background:'rgba(13,148,136,0.08)',
            display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem',
          }}>
            <svg width="26" height="26" fill="none" stroke="#0d9488" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <h3 style={{ fontWeight:700, color:'#0f172a', fontSize:'1.0625rem', marginBottom:'0.5rem' }}>No requests found</h3>
          <p style={{ color:'#64748b', fontSize:'0.9375rem' }}>Try different filters or search terms.</p>
        </div>
      )}

      {/* ── Job grid ──────────────────────────────────────── */}
      {!loading && !error && jobs.length > 0 && (
        <div className="fade-up fade-up-delay-3" style={{
          display:'grid', gap:'1.125rem',
          gridTemplateColumns:'repeat(auto-fill, minmax(360px, 1fr))',
        }}>
          {jobs.map(job => <JobCard key={job._id} job={job}/>)}
        </div>
      )}
    </div>
  );
}