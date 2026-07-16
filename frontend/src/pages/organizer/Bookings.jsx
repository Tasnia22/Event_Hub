import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function OrganizerBookings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [tickets, setTickets] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('roster');
  const [loading, setLoading] = useState(true);
  const darkMode = localStorage.getItem('darkMode') === 'true';

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/tickets/organizer-bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const fetchReviews = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/feedback/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const openEvent = (ev) => {
    setSelectedEvent(ev);
    setActiveTab('roster');
    fetchReviews(ev._id);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const uniqueEvents = [...new Map(tickets.map(t => [t.event?._id, t.event])).values()].filter(Boolean);
  const filteredEvents = uniqueEvents.filter(ev => ev.name.toLowerCase().includes(search.toLowerCase()));
  const eventTickets = selectedEvent ? tickets.filter(t => t.event?._id === selectedEvent._id) : [];
  const checkedInCount = eventTickets.filter(t => t.checkedIn).length;

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

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
          <li onClick={() => navigate('/organizer/events')}>📋 My Events</li>
          <li onClick={() => navigate('/organizer/create-event')}>➕ Create Event</li>
          <li className="active" onClick={() => navigate('/organizer/bookings')}>📦 Bookings</li>
          <li onClick={() => navigate('/organizer/checkin')}>📷 Check-In</li>
          <li onClick={() => navigate('/profile')}>👤 Profile</li>
          <li onClick={() => navigate('/about')}>ℹ️ About Us</li>
          <li onClick={() => navigate('/help')}>❓ Help & FAQ</li>
          <li onClick={handleLogout} className="logout">🚪 Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {!selectedEvent && (
          <>
            <div className="page-header">
              <div>
                <h2 className="page-title">Event Bookings</h2>
                <p className="page-subtitle">Review attendee lists and ticket sales per event</p>
              </div>
            </div>

            <div className="search-bar-container">
              <input className="search-bar" placeholder="🔍  Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {loading ? (
              <div className="card-grid">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="skeleton" style={{ width: '100%', height: '140px', borderRadius: 0 }}></div>
                    <div style={{ padding: '16px' }}>
                      <div className="skeleton" style={{ width: '80%', height: '18px', marginBottom: '10px' }}></div>
                      <div className="skeleton" style={{ width: '50%', height: '12px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <div className="empty-state-title">No bookings yet</div>
                <div className="empty-state-description">Once attendees purchase tickets, they'll appear here.</div>
              </div>
            ) : (
              <div className="card-grid">
                {filteredEvents.map((ev) => {
                  const count = tickets.filter(t => t.event?._id === ev._id).length;
                  const revenue = tickets.filter(t => t.event?._id === ev._id).reduce((s, t) => s + t.amountPaid, 0);
                  return (
                    <div key={ev._id} className="card event-card" onClick={() => openEvent(ev)}>
                      {ev.image ? (
                        <img src={ev.image} alt={ev.name} className="event-card-img" />
                      ) : (
                        <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(99,102,241,0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', borderBottom: '1px solid var(--border)' }}>🎉</div>
                      )}
                      <div className="event-card-content" style={{ padding: '16px' }}>
                        <h4 className="event-card-title" style={{ fontSize: '16px', marginBottom: '4px' }}>{ev.name}</h4>
                        <p className="event-card-venue" style={{ fontSize: '12px', marginBottom: '12px' }}>📍 {ev.venue}</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="badge badge-success">{count} Ticket(s)</span>
                          <span className="badge" style={{ background: 'rgba(79,70,229,0.1)', color: 'var(--primary)' }}>৳{revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {selectedEvent && (
          <>
            <div className="page-header">
              <div>
                <h2 className="page-title">{selectedEvent.name}</h2>
                <p className="page-subtitle">Roster and reviews for this event</p>
              </div>
              <button className="btn btn-outline" onClick={() => setSelectedEvent(null)}>← Back to Events</button>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div className="stat-card" style={{ flex: 1, minWidth: '140px', borderTop: '4px solid var(--primary)' }}>
                <h4>Total Sold</h4><p style={{ color: 'var(--primary)', fontSize: '24px' }}>{eventTickets.length}</p>
              </div>
              <div className="stat-card" style={{ flex: 1, minWidth: '140px', borderTop: '4px solid var(--secondary)' }}>
                <h4>Checked In</h4><p style={{ color: 'var(--secondary)', fontSize: '24px' }}>{checkedInCount}</p>
              </div>
              <div className="stat-card" style={{ flex: 1, minWidth: '140px', borderTop: '4px solid #F59E0B' }}>
                <h4>Revenue</h4><p style={{ color: '#F59E0B', fontSize: '24px' }}>৳{eventTickets.reduce((s, t) => s + t.amountPaid, 0).toLocaleString()}</p>
              </div>
              {avgRating && (
                <div className="stat-card" style={{ flex: 1, minWidth: '140px', borderTop: '4px solid #F59E0B' }}>
                  <h4>Avg Rating</h4><p style={{ color: '#F59E0B', fontSize: '24px' }}>⭐ {avgRating}</p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
              {['roster', 'reviews'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className="btn"
                  style={{ background: activeTab === tab ? 'var(--primary)' : 'var(--card-bg)', color: activeTab === tab ? '#fff' : 'var(--text-light)', border: `1px solid ${activeTab === tab ? 'var(--primary)' : 'var(--border)'}`, padding: '8px 20px', fontSize: '13px', boxShadow: 'none', textTransform: 'capitalize' }}>
                  {tab === 'roster' ? '📋 Attendee Roster' : '⭐ Reviews'}
                </button>
              ))}
            </div>

            {activeTab === 'roster' && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Attendee</th>
                      <th>Email</th>
                      <th>Ticket Type</th>
                      <th>Amount Paid</th>
                      <th>Ticket #</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventTickets.map((t) => (
                      <tr key={t._id}>
                        <td><strong>{t.attendeeName}</strong></td>
                        <td>{t.attendeeEmail}</td>
                        <td>{t.ticketName}</td>
                        <td><strong>৳{t.amountPaid}</strong></td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '12px' }}>{t.ticketNumber}</td>
                        <td>
                          <span className={`badge ${t.checkedIn ? 'badge-success' : 'badge-warning'}`}>
                            {t.checkedIn ? '✅ Checked-In' : '⏳ Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {eventTickets.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-light)' }}>No tickets sold for this event yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {reviews.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">⭐</div>
                    <div className="empty-state-title">No reviews yet</div>
                    <div className="empty-state-description">Reviews from attendees will appear here after the event.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {reviews.map((r, i) => (
                      <div key={i} className="card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ color: '#F59E0B', fontSize: '18px', letterSpacing: '2px' }}>{renderStars(r.rating)}</span>
                            <p style={{ fontWeight: '700', color: 'var(--text-dark)', marginTop: '8px', fontSize: '14px' }}>{r.user?.name || 'Anonymous'}</p>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        {r.comment && <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '8px', lineHeight: '1.5' }}>"{r.comment}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default OrganizerBookings;