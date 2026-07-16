import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import NotificationBell from '../../components/NotificationBell';

function MyBookings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState({});
  const [hoverStar, setHoverStar] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [loading, setLoading] = useState(true);
  const ticketRefs = useRef({});
  const darkMode = localStorage.getItem('darkMode') === 'true';

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/tickets/my-bookings', {
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const uniqueEvents = [...new Map(tickets.map(t => [t.event?._id, t.event])).values()].filter(Boolean);
  const filteredEvents = uniqueEvents.filter(ev => ev.name.toLowerCase().includes(search.toLowerCase()));
  const eventTickets = selectedEvent ? tickets.filter(t => t.event?._id === selectedEvent._id) : [];
  const now = new Date();
  const isPast = selectedEvent ? new Date(selectedEvent.endDateTime) < now : false;

  const downloadTicket = async (ticketId) => {
    const element = ticketRefs.current[ticketId];
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#fff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`ticket-${ticketId}.pdf`);
  };

  const setFeedbackField = (eventId, field, value) => {
    setFeedbacks(prev => ({ ...prev, [eventId]: { ...(prev[eventId] || { rating: 0, comment: '' }), [field]: value } }));
  };

  const submitFeedback = async (eventId) => {
    const fb = feedbacks[eventId] || {};
    if (!fb.rating) return alert('Please select a star rating.');
    setSubmitting(prev => ({ ...prev, [eventId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/feedback', {
        event: eventId,
        rating: fb.rating,
        comment: fb.comment || ''
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSubmitted(prev => ({ ...prev, [eventId]: true }));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit feedback');
    } finally {
      setSubmitting(prev => ({ ...prev, [eventId]: false }));
    }
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
          <li onClick={() => navigate('/customer/home')}>🏠 Home</li>
          <li className="active" onClick={() => navigate('/customer/bookings')}>🎟️ My Bookings</li>
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
                <h2 className="page-title">My Bookings</h2>
                <p className="page-subtitle">View and download tickets for your registered events</p>
              </div>
              <NotificationBell />
            </div>

            <div className="search-bar-container">
              <input className="search-bar" placeholder="🔍  Search booked events..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <div className="empty-state-icon">🎟️</div>
                <div className="empty-state-title">No bookings yet</div>
                <div className="empty-state-description">You haven't booked any events. Browse and book your first event!</div>
                <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/customer/home')}>Browse Events</button>
              </div>
            ) : (
              <div className="card-grid">
                {filteredEvents.map((ev) => (
                  <div key={ev._id} className="card event-card" onClick={() => setSelectedEvent(ev)}>
                    {ev.image ? (
                      <img src={ev.image} alt={ev.name} className="event-card-img" />
                    ) : (
                      <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(99,102,241,0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', borderBottom: '1px solid var(--border)' }}>🎉</div>
                    )}
                    <div className="event-card-content" style={{ padding: '16px' }}>
                      <span className="event-card-date">{new Date(ev.startDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <h4 className="event-card-title" style={{ fontSize: '16px', marginBottom: '4px' }}>{ev.name}</h4>
                      <p className="event-card-venue" style={{ fontSize: '12px', marginBottom: '8px' }}>📍 {ev.venue}</p>
                      <div className="event-card-meta" style={{ borderTop: 'none', paddingTop: '0' }}>
                        <span className="badge badge-success">
                          {tickets.filter(t => t.event?._id === ev._id).length} Ticket(s)
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--primary)' }}>View →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {selectedEvent && (
          <>
            <div className="page-header">
              <div>
                <h2 className="page-title">{selectedEvent.name}</h2>
                <p className="page-subtitle">Your generated tickets for this event</p>
              </div>
              <button className="btn btn-outline" onClick={() => setSelectedEvent(null)}>← Back to Events</button>
            </div>

            {/* Tickets Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', marginTop: '24px' }}>
              {eventTickets.map((t) => (
                <div key={t._id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  {/* Ticket Voucher */}
                  <div ref={(el) => (ticketRefs.current[t._id] = el)} className="ticket-card">
                    {selectedEvent.image && (
                      <img src={selectedEvent.image} alt={selectedEvent.name} className="ticket-card-banner" />
                    )}
                    <div className="ticket-header">
                      <h4>{selectedEvent.name}</h4>
                      <p style={{ fontSize: '12px', opacity: 0.85, marginTop: '4px' }}>
                        📅 {new Date(selectedEvent.startDateTime).toLocaleDateString(undefined, { dateStyle: 'medium' })} &nbsp;|&nbsp;
                        📍 {selectedEvent.venue}
                      </p>
                    </div>
                    <div className="ticket-body">
                      <div className="ticket-detail"><span>Attendee</span><strong>{t.attendeeName}</strong></div>
                      <div className="ticket-detail"><span>Email</span><strong style={{ fontSize: '12px' }}>{t.attendeeEmail}</strong></div>
                      <div className="ticket-detail"><span>Type</span><strong>{t.ticketName}</strong></div>
                      <div className="ticket-detail"><span>Paid</span><strong>৳{t.amountPaid}</strong></div>

                      <div className="ticket-divider"></div>

                      <div className="ticket-detail"><span>Ticket #</span><strong style={{ fontFamily: 'monospace', fontSize: '12px' }}>{t.ticketNumber}</strong></div>
                      <div className="ticket-detail">
                        <span>Status</span>
                        <span className={`badge ${t.checkedIn ? 'badge-success' : 'badge-warning'}`}>
                          {t.checkedIn ? '✅ Checked-In' : '⏳ Active'}
                        </span>
                      </div>

                      {t.qrImage && (
                        <div className="ticket-qr-container">
                          <div className="ticket-qr">
                            <img src={t.qrImage} alt="QR Code" style={{ width: '120px', height: '120px', display: 'block' }} />
                          </div>
                        </div>
                      )}

                      <div className="ticket-footer">✨ Powered by EventHub</div>
                    </div>
                  </div>

                  <button onClick={() => downloadTicket(t._id)} className="btn btn-primary" style={{ width: '100%', maxWidth: '350px' }}>
                    ⬇ Download PDF
                  </button>
                </div>
              ))}
            </div>

            {/* Feedback Section (only for past events) */}
            {isPast && (
              <div className="card" style={{ maxWidth: '500px', margin: '40px auto 0', padding: '28px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-dark)' }}>
                  Rate this Event
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '20px' }}>
                  Share your experience to help the organizer improve.
                </p>
                {submitted[selectedEvent._id] ? (
                  <div style={{ textAlign: 'center', padding: '20px', background: 'var(--secondary-light)', borderRadius: '12px', color: 'var(--secondary-hover)', fontWeight: '700' }}>
                    🎉 Thank you for your feedback!
                  </div>
                ) : (
                  <>
                    <div className="star-rating" style={{ marginBottom: '16px', justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={`star ${star <= (hoverStar[selectedEvent._id] || feedbacks[selectedEvent._id]?.rating || 0) ? 'selected' : ''}`}
                          onMouseEnter={() => setHoverStar(prev => ({ ...prev, [selectedEvent._id]: star }))}
                          onMouseLeave={() => setHoverStar(prev => ({ ...prev, [selectedEvent._id]: 0 }))}
                          onClick={() => setFeedbackField(selectedEvent._id, 'rating', star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="form-group">
                      <label>Comment (optional)</label>
                      <textarea
                        placeholder="Tell us about your experience..."
                        value={feedbacks[selectedEvent._id]?.comment || ''}
                        onChange={(e) => setFeedbackField(selectedEvent._id, 'comment', e.target.value)}
                        style={{ minHeight: '80px' }}
                      />
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      disabled={submitting[selectedEvent._id]}
                      onClick={() => submitFeedback(selectedEvent._id)}
                    >
                      {submitting[selectedEvent._id] ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyBookings;