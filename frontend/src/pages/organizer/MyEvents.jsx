import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MyEvents() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [shareOpen, setShareOpen] = useState(null);
  const [copied, setCopied] = useState(false);
  const darkMode = localStorage.getItem('darkMode') === 'true';

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/events/organizer/my-events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfirmDelete(null);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const filteredEvents = events.filter(ev => ev.name.toLowerCase().includes(search.toLowerCase()));
  const now = new Date();

  const organizedByText = (ev) => {
    const names = [ev.organizer?.name, ...(ev.coOrganizers?.map(c => c.name) || [])].filter(Boolean);
    return names.join(' & ');
  };

  const getShareUrl = (eventId) => `${window.location.origin}/customer/event/${eventId}`;

  const copyLink = (eventId) => {
    navigator.clipboard.writeText(getShareUrl(eventId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <li onClick={() => navigate('/organizer/dashboard')}>📊 Dashboard</li>
          <li className="active" onClick={() => navigate('/organizer/events')}>📋 My Events</li>
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
            <h2 className="page-title">My Events</h2>
            <p className="page-subtitle">Manage all the events you are hosting or co-hosting</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/organizer/create-event')}>
            ➕ Create New Event
          </button>
        </div>

        <div className="search-bar-container">
          <input className="search-bar" placeholder="🔍  Search my events..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="card-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="skeleton" style={{ width: '100%', height: '140px', borderRadius: 0 }}></div>
                <div style={{ padding: '16px' }}>
                  <div className="skeleton" style={{ width: '60%', height: '14px', marginBottom: '10px' }}></div>
                  <div className="skeleton" style={{ width: '90%', height: '20px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ width: '50%', height: '12px', marginBottom: '20px' }}></div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="skeleton" style={{ flex: 1, height: '32px' }}></div>
                    <div className="skeleton" style={{ flex: 1, height: '32px' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No events found</div>
            <div className="empty-state-description">Create your first event to start selling tickets and managing attendees.</div>
            <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/organizer/create-event')}>Create Event</button>
          </div>
        ) : (
          <div className="card-grid">
            {filteredEvents.map((ev) => {
              const isUpcoming = new Date(ev.startDateTime) > now;
              return (
                <div key={ev._id} className="card event-card" style={{ cursor: 'default' }}>
                  <div style={{ position: 'relative' }}>
                    {ev.image ? (
                      <img src={ev.image} alt={ev.name} className="event-card-img" />
                    ) : (
                      <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(99,102,241,0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', borderBottom: '1px solid var(--border)' }}>🎉</div>
                    )}
                    <span className={`badge ${isUpcoming ? 'badge-success' : 'badge-warning'}`} style={{ position: 'absolute', top: '10px', right: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                      {isUpcoming ? '⏳ Upcoming' : '✅ Past'}
                    </span>
                  </div>
                  <div className="event-card-content" style={{ padding: '16px' }}>
                    <span className="event-card-date">
                      {new Date(ev.startDateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <h4 className="event-card-title" style={{ fontSize: '16px', marginBottom: '4px' }}>{ev.name}</h4>
                    <p className="event-card-venue" style={{ fontSize: '12px', marginBottom: '4px' }}>📍 {ev.venue}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '16px' }}>
                      By: {organizedByText(ev)}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px', flexWrap: 'wrap' }}>
                      <button onClick={() => navigate(`/organizer/edit-event/${ev._id}`)} className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '12px' }}>
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setShareOpen(shareOpen === ev._id ? null : ev._id)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                      >
                        🔗 Share
                      </button>
                      <button onClick={() => setConfirmDelete(ev)} className="btn btn-danger" style={{ flex: 1, padding: '8px', fontSize: '12px' }}>
                        🗑️ Delete
                      </button>
                    </div>

                    {/* Share Popover */}
                    {shareOpen === ev._id && (
                      <div style={{ marginTop: '12px', padding: '14px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Share this event:</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(ev._id))}`}
                            target="_blank" rel="noopener noreferrer"
                            className="btn"
                            style={{ textDecoration: 'none', background: '#1877F2', color: '#fff', fontSize: '12px', padding: '7px 12px' }}
                          >
                            Facebook
                          </a>
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Check out this event: ${ev.name} ${getShareUrl(ev._id)}`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="btn"
                            style={{ textDecoration: 'none', background: '#25D366', color: '#fff', fontSize: '12px', padding: '7px 12px' }}
                          >
                            WhatsApp
                          </a>
                          <button
                            onClick={() => copyLink(ev._id)}
                            className="btn btn-outline"
                            style={{ fontSize: '12px', padding: '7px 12px' }}
                          >
                            {copied ? '✅ Copied!' : '📋 Copy Link'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>⚠️</span>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-dark)' }}>Delete Event?</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                Are you sure you want to delete <strong>"{confirmDelete.name}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(confirmDelete._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyEvents;