import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [event, setEvent] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', darkMode);
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEvent();
  }, [id]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!event) return (
    <div className="app-layout">
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ fontSize: '15px', color: 'var(--text-light)', fontWeight: 600 }}>Loading event details...</p>
      </div>
    </div>
  );

  const organizedByText = () => {
    const names = [event.organizer?.name, ...(event.coOrganizers?.map(c => c.name) || [])].filter(Boolean);
    return names.join(' & ');
  };

  const shareUrl = window.location.href;
  const shareText = `Check out this event: ${event.name}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
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
            <div className="sidebar-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <h4>{user?.name}</h4>
        </div>
        <ul className="sidebar-nav">
          <li onClick={() => navigate('/customer/home')}>🏠 Home</li>
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
            <h2 className="page-title">Event Details</h2>
            <p className="page-subtitle">View info and get tickets for this event</p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/customer/home')}>← Back to Events</button>
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Main Info */}
          <div className="card" style={{ flex: '2', minWidth: '320px', padding: '0', overflow: 'hidden' }}>
            {event.image ? (
              <img src={event.image} alt={event.name} style={{ width: '100%', maxHeight: '350px', objectFit: 'cover' }} />
            ) : (
              <div style={{ height: '240px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <span style={{ fontSize: '72px' }}>📅</span>
              </div>
            )}
            <div style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>{event.name}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '24px', padding: '20px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Time</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)', marginTop: '6px' }}>
                    {new Date(event.startDateTime).toLocaleDateString(undefined, { dateStyle: 'medium' })}<br/>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 500 }}>
                      {new Date(event.startDateTime).toLocaleTimeString(undefined, { timeStyle: 'short' })} - {new Date(event.endDateTime).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                    </span>
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Venue</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)', marginTop: '6px' }}>📍 {event.venue}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hosted By</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)', marginTop: '6px' }}>👤 {organizedByText()}</p>
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-dark)' }}>About this Event</h3>
              <p style={{ fontSize: '15px', color: 'var(--text-light)', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '24px' }}>{event.description}</p>

              {/* Share Links */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '12px' }}>Share with friends:</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="btn" style={{ textDecoration: 'none', background: '#1877F2', color: '#fff', fontSize: '13px' }}>
                    Facebook
                  </a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="btn" style={{ textDecoration: 'none', background: '#25D366', color: '#fff', fontSize: '13px' }}>
                    WhatsApp
                  </a>
                  <button onClick={copyLink} className="btn btn-outline" style={{ fontSize: '13px' }}>
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Column */}
          <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-dark)' }}>Available Tickets</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {event.ticketOptions?.map((t, i) => (
                  <div key={i} style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: t.quantity <= 0 ? 'var(--bg)' : '#fff' }}>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-dark)' }}>{t.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                        {t.quantity > 0 ? `${t.quantity} tickets left` : 'SOLD OUT'}
                      </p>
                    </div>
                    <div>
                      {t.type === 'free' && <span className="badge badge-success">Free</span>}
                      {t.type === 'donation' && <span className="badge badge-warning">Donation</span>}
                      {t.type === 'fixed' && <strong style={{ color: 'var(--primary)', fontSize: '15px' }}>৳{t.price}</strong>}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate(`/customer/booking/${event._id}`)} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;