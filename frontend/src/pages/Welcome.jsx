import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <div className="auth-container">
      {/* Theme Toggle Button */}
      <button className="auth-theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <div className="auth-card" style={{ textAlign: 'center', width: '440px', padding: '40px 36px' }}>
        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '54px', display: 'block', marginBottom: '8px' }}>🎉</span>
          <h1 style={{ color: 'var(--primary)', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.03em', margin: '0 0 4px 0' }}>EventHub</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
            Discover events near you or create and sell tickets for your own gatherings.
          </p>
        </div>

        <div style={{ margin: '30px 0' }}>
          <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-dark)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Choose your role to continue
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => navigate('/signup?role=organizer')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '10px' }}
            >
              📅 I want to Host & Organize
            </button>
            <button
              onClick={() => navigate('/signup?role=customer')}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '10px' }}
            >
              🎟️ I want to Discover & Book
            </button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-light)', margin: 0 }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Welcome;