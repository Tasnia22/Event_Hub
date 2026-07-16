import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', darkMode);
  }, []);

  const goHome = () => {
    if (!user) navigate('/');
    else if (user.role === 'organizer') navigate('/organizer/dashboard');
    else navigate('/customer/home');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">🎉 EventHub</div>
        {user && (
          <div className="sidebar-profile" onClick={() => navigate('/profile')}>
            {user.photo ? (
              <img src={user.photo} alt="Profile" className="sidebar-avatar" />
            ) : (
              <div className="sidebar-avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <h4>{user.name}</h4>
          </div>
        )}
        <ul className="sidebar-nav">
          <li onClick={goHome}>← Back</li>
          {user && <li onClick={handleLogout} className="logout">Logout</li>}
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">About Us</h2>
            <p className="page-subtitle">Welcome to the EventHub Platform</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '800px', margin: '0 auto' }}>
          
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <span style={{ fontSize: '64px', marginBottom: '16px', display: 'inline-block' }}>✨</span>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>Our Mission</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '15px', lineHeight: '1.6' }}>
              At EventHub, we believe that bringing people together creates meaningful connections, sparks innovations, and builds communities. Our mission is to provide an all-in-one ticketing, check-in, and hosting workspace that empowers organizers to host unforgettable experiences, and enables customers to discover them effortlessly.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card">
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px', color: 'var(--primary)' }}>For Event Creators</h4>
              <p style={{ color: 'var(--text-light)', fontSize: '13px', lineHeight: '1.6' }}>
                We provide a comprehensive host dashboard. Create events, establish multiple ticketing options (free, fixed pricing, custom donations), invite co-organizers, review attendee lists, check feedbacks, and scan QR code tickets at the door using your camera.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px', color: 'var(--secondary)' }}>For Ticket Buyers</h4>
              <p style={{ color: 'var(--text-light)', fontSize: '13px', lineHeight: '1.6' }}>
                Search through active listings across music concerts, educational seminars, creative workshops, and sports matches. Pay securely via mobile wallets (bKash/Nagad), download PDF ticket vouchers with scan codes, and leave star ratings after attending.
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: '30px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>Core Values</h4>
            <ul style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '2', paddingLeft: '20px' }}>
              <li>🌟 <strong>Aesthetic Integrity:</strong> Building tools that are beautiful and pleasant to use.</li>
              <li>⚡ <strong>Speed & Performance:</strong> Fast ticket booking, instantaneous notifications, and zero check-in delays.</li>
              <li>🛡️ <strong>Security first:</strong> Encrypted transactions and digital signing for QR ticket codes.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

export default About;
