'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    const syncAuth = () => {
      const profile = localStorage.getItem('workerProfile');
      setWorker(profile ? JSON.parse(profile) : null);
    };

    // Run on mount
    syncAuth();

    // Re-run whenever login fires the custom event (same tab)
    window.addEventListener('authChange', syncAuth);
    // Re-run on storage change from other tabs
    window.addEventListener('storage', syncAuth);

    return () => {
      window.removeEventListener('authChange', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('workerToken');
    localStorage.removeItem('workerProfile');
    setWorker(null);
    window.dispatchEvent(new Event('authChange'));
    router.push('/');
  };

  return (
    <header style={{
      position:'sticky', top:0, zIndex:50, width:'100%',
      background:'rgba(238,242,247,0.92)', backdropFilter:'blur(16px)',
      WebkitBackdropFilter:'blur(16px)',
      borderBottom:'1px solid rgba(15,23,42,0.07)',
    }}>
      <div style={{
        maxWidth:'1360px', margin:'0 auto',
        padding:'0 2.5rem', height:'68px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display:'flex', alignItems:'center', gap:'10px',
          textDecoration:'none',
        }}>
          <div style={{
            width:38, height:38, borderRadius:10,
            background:'linear-gradient(135deg,#0d9488,#2563eb)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v11a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h-5"/>
            </svg>
          </div>
          <span style={{
            fontSize:'1.25rem', fontWeight:800, letterSpacing:'-0.03em',
            background:'linear-gradient(120deg,#0d9488,#2563eb)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundClip:'text',
          }}>TradeLink</span>
        </Link>

        {/* Nav links */}
        <nav style={{display:'flex', alignItems:'center', gap:'1rem'}}>
          <Link href="/" style={{fontSize:'0.9375rem', fontWeight:500, color:'#475569', textDecoration:'none'}}>
            Browse Jobs
          </Link>

          <Link href="/new" style={{
            display:'inline-flex', alignItems:'center', gap:'7px',
            padding:'0.5625rem 1.25rem', borderRadius:'10px',
            fontSize:'0.9375rem', fontWeight:700, color:'#fff',
            background:'linear-gradient(110deg,#0d9488,#2563eb)',
            textDecoration:'none', border:'none',
            boxShadow:'0 2px 10px rgba(13,148,136,0.28)',
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            Post a Job
          </Link>

          {worker ? (
            <div style={{display:'flex', alignItems:'center', gap:'0.625rem'}}>
              {/* Avatar */}
              <div style={{
                width:34, height:34, borderRadius:'50%',
                background:'linear-gradient(135deg,#7c3aed,#db2777)',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
              }}>
                <span style={{color:'#fff', fontSize:'0.8125rem', fontWeight:700}}>
                  {worker.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Name + role */}
              <div style={{lineHeight:1.2}}>
                <p style={{margin:0, fontSize:'0.8125rem', fontWeight:700, color:'#0f172a'}}>{worker.name}</p>
                <p style={{margin:0, fontSize:'0.6875rem', fontWeight:500, color:'#7c3aed', textTransform:'capitalize'}}>{worker.role}</p>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  marginLeft:'0.25rem',
                  display:'inline-flex', alignItems:'center', gap:'5px',
                  padding:'0.4375rem 0.875rem', borderRadius:'8px',
                  fontSize:'0.8125rem', fontWeight:600,
                  color:'#64748b', background:'transparent',
                  border:'1.5px solid #e2e8f0',
                  cursor:'pointer', transition:'all 0.18s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#fef2f2';
                  e.currentTarget.style.borderColor = '#fca5a5';
                  e.currentTarget.style.color = '#dc2626';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" style={{
              display:'inline-flex', alignItems:'center', gap:'6px',
              padding:'0.5rem 1rem', borderRadius:'10px',
              fontSize:'0.9375rem', fontWeight:600,
              color:'#7c3aed', textDecoration:'none',
              border:'1.5px solid #ede9fe',
              background:'#faf5ff',
            }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}