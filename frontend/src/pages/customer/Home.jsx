import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../../components/NotificationBell';

const CATEGORIES = ['All', 'Concert', 'Seminar', 'Workshop', 'Sports', 'General'];

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/events');
        setEvents(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const now = new Date();
  const filtered = events
    .filter(ev => tab === 'upcoming' ? new Date(ev.startDateTime) >= now : new Date(ev.startDateTime) < now)
    .filter(ev => category === 'All' || ev.category === category)
    .filter(ev =>
      ev.name.toLowerCase().includes(search.toLowerCase()) ||
      ev.venue.toLowerCase().includes(search.toLowerCase())
    );

  const organizedByText = (ev) => {
    const names = [ev.organizer?.name, ...(ev.coOrganizers?.map(c => c.name) || [])].filter(Boolean);
    return names.join(' & ');
  };

  const getCategoryColor = (cat) => {
    const map = { Concert: '#8B5CF6', Seminar: '#3B82F6', Workshop: '#F59E0B', Sports: '#10B981', General: '#6B7280' };
    return map[cat] || '#6B7280';
  };

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
          <li className="active" onClick={() => navigate('/customer/home')}>🏠 Home</li>
          <li onClick={() => navigate('/customer/bookings')}>🎟️ My Bookings</li>
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
            <h2 className="page-title">Browse Events</h2>
            <p className="page-subtitle">Discover and book tickets for upcoming events</p>
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

        {/* Search Bar */}
        <div className="search-bar-container">
          <input
            className="search-bar"
            placeholder="🔍  Search by event name or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Upcoming / Past Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {['upcoming', 'past'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="btn"
              style={{
                background: tab === t ? 'var(--primary)' : 'var(--card-bg)',
                color: tab === t ? '#fff' : 'var(--text-light)',
                border: `1px solid ${tab === t ? 'var(--primary)' : 'var(--border)'}`,
                padding: '8px 20px',
                fontSize: '13px',
                boxShadow: 'none',
                textTransform: 'capitalize'
              }}
            >
              {t === 'upcoming' ? '⏳ Upcoming' : '✅ Past Events'}
            </button>
          ))}
        </div>

        {/* Category Filter Tabs */}
        <div className="filter-tabs">
          {CATEGORIES.map(cat => (
            <div
              key={cat}
              className={`filter-tab ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </div>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="card-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="skeleton" style={{ width: '100%', height: '160px', borderRadius: 0 }}></div>
                <div style={{ padding: '16px' }}>
                  <div className="skeleton" style={{ width: '60%', height: '14px', marginBottom: '10px' }}></div>
                  <div className="skeleton" style={{ width: '90%', height: '20px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ width: '50%', height: '12px' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No events found</div>
            <div className="empty-state-description">
              {tab === 'past' ? 'No past events match your search.' : 'Try a different category or search term.'}
            </div>
          </div>
        ) : (
          <div className="card-grid">
            {filtered.map((ev) => (
              <div key={ev._id} className="card event-card" onClick={() => navigate(`/customer/event/${ev._id}`)}>
                {ev.image ? (
                  <img src={ev.image} alt={ev.name} className="event-card-img" />
                ) : (
                  <div style={{ height: '160px', background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(99,102,241,0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', borderBottom: '1px solid var(--border)', fontSize: '48px' }}>
                    🎉
                  </div>
                )}
                <div className="event-card-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span className="event-card-date">
                      {new Date(ev.startDateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {ev.category && (
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: getCategoryColor(ev.category) + '18', color: getCategoryColor(ev.category), border: `1px solid ${getCategoryColor(ev.category)}40` }}>
                        {ev.category}
                      </span>
                    )}
                  </div>
                  <h4 className="event-card-title">{ev.name}</h4>
                  <p className="event-card-venue">📍 {ev.venue}</p>
                  <div className="event-card-meta">
                    <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>By: <strong>{organizedByText(ev)}</strong></span>
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>View →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;