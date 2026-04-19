import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const form = new URLSearchParams();
      form.append('username', username.trim());
      form.append('password', password);
      const res = await axios.post('http://127.0.0.1:8000/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const { access_token, role, name } = res.data;
      onLogin({ token: access_token, role, name });
    } catch (err) {
      const msg = err?.response?.data?.detail;
      setError(msg || 'Invalid username or password.');
    }
    setLoading(false);
  };

  return (
    <div className="login-shell">
      {/* Left panel — branding */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="login-logo-row">
            <div className="login-logo-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <span className="login-logo-name">
              DentalAI<span style={{ color: 'var(--cyan)' }}>Pro</span>
            </span>
          </div>
          <h1 className="login-headline">
            AI-powered<br />orthodontic analysis
          </h1>
          <p className="login-tagline">
            Upload 3D dental scans and get instant AI segmentation,
            alignment simulation, and diagnostic reports.
          </p>
          <div className="login-feature-list">
            {[
              'PointNet deep learning segmentation',
              'Tooth-level crowding & spacing diagnosis',
              'Alignment simulation with arch curve fitting',
              '80%+ accuracy on clinical scan data',
            ].map((f, i) => (
              <div key={i} className="login-feature">
                <div className="login-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="login-form-panel">
        <div className="login-form-card">
          <div className="login-form-header">
            <h2 className="login-form-title">Sign in</h2>
            <p className="login-form-sub">Enter your clinic credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label className="login-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                className={`login-input ${error ? 'input-error' : ''}`}
                placeholder="e.g. dr.sharma"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
              />
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`login-input ${error ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                  style={{ width: 14, height: 14, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <span className="login-spinner" />
              ) : 'Sign in'}
            </button>
          </form>

          <div className="login-demo-hint">
            <span className="login-demo-label">Demo credentials</span>
            <div className="login-demo-row">
              <span className="login-demo-chip" onClick={() => { setUsername('doctor'); setPassword('dental123'); setError(''); }}>
                doctor / dental123
              </span>
              <span className="login-demo-chip" onClick={() => { setUsername('admin'); setPassword('admin123'); setError(''); }}>
                admin / admin123
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}