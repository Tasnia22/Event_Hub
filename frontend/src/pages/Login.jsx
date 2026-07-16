import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (res.data.user.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/customer/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      {/* Theme Toggle Button */}
      <button className="auth-theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <div className="auth-card" style={{ padding: '40px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🔐</span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-dark)' }}>
            Welcome Back
          </h2>
          <p className="auth-subtitle" style={{ margin: 0, fontSize: '13px' }}>
            Enter your credentials to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', fontWeight: '700' }}>
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              required
              style={{ padding: '12px 14px', borderRadius: '8px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', fontWeight: '700' }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              style={{ padding: '12px 14px', borderRadius: '8px' }}
            />
          </div>

          {error && (
            <p className="error-text" style={{ textAlign: 'center', marginBottom: '16px', fontWeight: '600' }}>
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '15px', borderRadius: '8px', fontWeight: '700' }}
          >
            Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-light)' }}>
          Don't have an account?{' '}
          <a
            href="/"
            style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}
          >
            Create Account
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;