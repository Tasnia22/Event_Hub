import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../../components/NotificationBell';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState({ totalRevenue: 0, totalTicketsSold: 0, totalAttendance: 0, totalEvents: 0 });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [shareOpen, setShareOpen] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [statsRes, eventsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/events/organizer/stats', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/events/organizer/my-events', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStats(statsRes.data);
        setRecentEvents(eventsRes.data.slice(0, 3));
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getShareUrl = (eventId) => `${window.location.origin}/customer/event/${eventId}`;

  const copyLink = (eventId) => {
    navigator.clipboard.writeText(getShareUrl(eventId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statItems = [
    { label: 'Total Revenue', value: `৳${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: '#10B981' },
    { label: 'Tickets Sold', value: stats.totalTicketsSold, icon: '🎟️', color: '#4F46E5' },
    { label: 'Check-Ins', value: stats.totalAttendance, icon: '✅', color: '#F59E0B' },
    { label: 'Events Hosted', value: stats.totalEvents, icon: '📅', color: '#EF4444' },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">🎉 EventHub</div>
        <div className="sidebar-profile" onClick={() => navigate('/profile')}>
          {user?.photo ? (
            <img src={user.photo} alt="Profile" className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          )}
          <h4>{user?.name}</h4>
        </div>
        <ul className="sidebar-nav">
          <li className="active" onClick={() => navigate('/organizer/dashboard')}>📊 Dashboard</li>
          <li onClick={() => navigate('/organizer/events')}>📋 My Events</li>
          <li onClick={() => navigate('/organizer/create-event')}>➕ Create Event</li>
          <li onClick={() => navigate('/organizer/bookings')}>📦 Bookings</li>
          <li onClick={() => navigate('/organizer/checkin')}>📷 Check-In</li>
          <li onClick={() => navigate('/profile')}>👤 Profile</li>
          <li onClick={() => navigate('/about')}>ℹ️ About Us</li>
          <li onClick={() => navigate('/help')}>❓ Help & FAQ</li>
          <li onClick={handleLogout} className="logout">🚪 Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">Organizer Dashboard</h2>
            <p className="page-subtitle">Overview of your events' metrics and performance</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <NotificationBell />
            <button
              className="btn btn-outline"
              onClick={() => setDarkMode(!darkMode)}
              style={{ padding: '8px 14px', fontSize: '16px' }}
              title="Toggle Dark Mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="stat-card-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="stat-card">
                <div className="skeleton" style={{ width: '50%', height: '12px', marginBottom: '12px' }}></div>
                <div className="skeleton" style={{ width: '70%', height: '32px' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="stat-card-grid">
            {statItems.map((s, i) => (
              <div key={i} className="stat-card" style={{ borderTop: `4px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4>{s.label}</h4>
                  <span style={{ fontSize: '22px' }}>{s.icon}</span>
                </div>
                <p style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Welcome + Quick Actions */}
        <div className="card" style={{ padding: '30px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-dark)' }}>
                Welcome back, {user?.name}! 👋
              </h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.6', maxWidth: '480px' }}>
                Use the navigation sidebar to manage your events, review check-in rosters, create new event listings, or scan tickets at event entry doors using the live QR scanner.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/organizer/create-event')}>
                ➕ Create New Event
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/organizer/checkin')}>
                📷 Scan QR Tickets
              </button>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        {recentEvents.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)' }}>Recent Events</h3>
              <button className="btn btn-outline" style={{ fontSize: '13px' }} onClick={() => navigate('/organizer/events')}>
                View All →
              </button>
            </div>
            <div className="card-grid">
              {recentEvents.map(ev => (
                <div key={ev._id} className="card event-card" style={{ cursor: 'default' }}>
                  {ev.image ? (
                    <img src={ev.image} alt={ev.name} className="event-card-img" />
                  ) : (
                    <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(99,102,241,0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', borderBottom: '1px solid var(--border)' }}>🎉</div>
                  )}
                  <div className="event-card-content" style={{ padding: '16px' }}>
                    <span className="event-card-date">{new Date(ev.startDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <h4 className="event-card-title" style={{ fontSize: '15px' }}>{ev.name}</h4>
                    <p className="event-card-venue" style={{ fontSize: '12px' }}>📍 {ev.venue}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <button onClick={() => navigate(`/organizer/edit-event/${ev._id}`)} className="btn btn-outline" style={{ flex: 1, padding: '7px', fontSize: '12px' }}>Edit</button>
                      <button
                        onClick={() => setShareOpen(shareOpen === ev._id ? null : ev._id)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '7px', fontSize: '12px' }}
                      >
                        🔗 Share
                      </button>
                      <button onClick={() => navigate('/organizer/checkin')} className="btn btn-secondary" style={{ flex: 1, padding: '7px', fontSize: '12px' }}>Check-In</button>
                    </div>

                    {/* Share Popover */}
                    {shareOpen === ev._id && (
                      <div style={{ marginTop: '10px', padding: '12px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Share this event:</p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(ev._id))}`}
                            target="_blank" rel="noopener noreferrer"
                            className="btn"
                            style={{ textDecoration: 'none', background: '#1877F2', color: '#fff', fontSize: '11px', padding: '6px 10px' }}
                          >
                            Facebook
                          </a>
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Check out this event: ${ev.name} ${getShareUrl(ev._id)}`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="btn"
                            style={{ textDecoration: 'none', background: '#25D366', color: '#fff', fontSize: '11px', padding: '6px 10px' }}
                          >
                            WhatsApp
                          </a>
                          <button
                            onClick={() => copyLink(ev._id)}
                            className="btn btn-outline"
                            style={{ fontSize: '11px', padding: '6px 10px' }}
                          >
                            {copied ? '✅ Copied!' : '📋 Copy Link'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;