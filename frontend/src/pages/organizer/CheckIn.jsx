import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

function CheckIn() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketNumber, setTicketNumber] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [tickets, setTickets] = useState([]);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', darkMode);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/events/organizer/my-events', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEvents();
  }, []);

  const fetchTickets = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/tickets/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const openEvent = (ev) => {
    setSelectedEvent(ev);
    setMessage('');
    setMessageType('');
    fetchTickets(ev._id);
  };

  const doCheckIn = async (number) => {
    setMessage('');
    setMessageType('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/tickets/checkin', { ticketNumber: number }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✅ ' + res.data.message + ' - ' + res.data.ticket.buyer?.name);
      setMessageType('success');
      setTicketNumber('');
      if (selectedEvent) fetchTickets(selectedEvent._id);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Check-in failed'));
      setMessageType('error');
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    doCheckIn(ticketNumber);
  };

  const startScanner = () => {
    setScanning(true);
    setTimeout(() => {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 200 },
        (decodedText) => {
          doCheckIn(decodedText);
          stopScanner();
        },
        () => {}
      ).catch((err) => {
        setMessage('❌ Camera error: ' + err);
        setMessageType('error');
        setScanning(false);
      });
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
        setScanning(false);
      }).catch(() => setScanning(false));
    } else {
      setScanning(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const filteredEvents = events.filter(ev => ev.name.toLowerCase().includes(search.toLowerCase()));
  const checkedInCount = tickets.filter(t => t.checkedIn).length;

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
          <li onClick={() => navigate('/organizer/dashboard')}>📊 Dashboard</li>
          <li onClick={() => navigate('/organizer/events')}>📋 My Events</li>
          <li onClick={() => navigate('/organizer/create-event')}>➕ Create Event</li>
          <li onClick={() => navigate('/organizer/bookings')}>📦 Bookings</li>
          <li className="active" onClick={() => navigate('/organizer/checkin')}>📷 Check-In</li>
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
                <h2 className="page-title">Check-In Tickets</h2>
                <p className="page-subtitle">Select an event to start ticket scanning and check-in</p>
              </div>
            </div>

            <div className="search-bar-container">
              <input className="search-bar" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {filteredEvents.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                <p style={{ fontSize: '15px', fontWeight: '500' }}>No active events found.</p>
              </div>
            ) : (
              <div className="card-grid">
                {filteredEvents.map((ev) => (
                  <div key={ev._id} className="card event-card" onClick={() => openEvent(ev)}>
                    {ev.image ? (
                      <img src={ev.image} alt={ev.name} className="event-card-img" />
                    ) : (
                      <div style={{ height: '140px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '32px' }}>📅</span>
                      </div>
                    )}
                    <div className="event-card-content" style={{ padding: '16px' }}>
                      <h4 className="event-card-title" style={{ fontSize: '16px', marginBottom: '4px' }}>{ev.name}</h4>
                      <p className="event-card-venue" style={{ fontSize: '12px', marginBottom: '8px' }}>📍 {ev.venue}</p>
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
                <h2 className="page-title">{selectedEvent.name} - Check-In</h2>
                <p className="page-subtitle">Verify QR tickets at door entry</p>
              </div>
              <button className="btn btn-outline" onClick={() => { setSelectedEvent(null); stopScanner(); }}>← Back to Events</button>
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              
              {/* Scan Card Panel */}
              <div className="card" style={{ flex: '1', minWidth: '320px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-dark)' }}>Camera Validation</h3>
                  <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    Checked In: <strong>{checkedInCount} / {tickets.length}</strong>
                  </span>
                </div>

                <div className="scanner-container">
                  {!scanning ? (
                    <button onClick={startScanner} className="btn btn-secondary" style={{ width: '100%', padding: '14px', background: 'var(--secondary)' }}>
                      📷 Start QR Scanner
                    </button>
                  ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <button onClick={stopScanner} className="btn btn-danger" style={{ width: '100%', padding: '12px', marginBottom: '16px' }}>
                        Stop Scanner
                      </button>
                      <div className="camera-box">
                        <div id="qr-reader" style={{ width: '100%', height: '100%' }}></div>
                        <div className="scanner-laser"></div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Or Enter Number</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                </div>

                <form onSubmit={handleCheckIn} style={{ display: 'flex', gap: '10px' }}>
                  <input placeholder="Enter Ticket # (e.g. TKT-123456)" value={ticketNumber} onChange={(e) => setTicketNumber(e.target.value)} required style={{ flex: 1 }} />
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>Check-In</button>
                </form>

                {message && (
                  <div style={{ marginTop: '20px', padding: '14px', borderRadius: '8px', background: messageType === 'success' ? 'var(--secondary-light)' : 'rgba(239,68,68,0.1)', border: `1px solid ${messageType === 'success' ? 'var(--secondary)' : 'var(--danger)'}`, color: messageType === 'success' ? 'var(--secondary-hover)' : 'var(--danger)', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>
                    {message}
                  </div>
                )}
              </div>

              {/* Roster Logs list */}
              <div className="card" style={{ flex: '1.5', minWidth: '320px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-dark)' }}>Check-In Roster Logs</h3>
                
                <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto', marginTop: '0' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Buyer</th>
                        <th>Ticket</th>
                        <th>Ticket #</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((t) => (
                        <tr key={t._id}>
                          <td><strong>{t.buyer?.name}</strong></td>
                          <td>{t.ticketName}</td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.ticketNumber}</td>
                          <td>
                            <span className={`badge ${t.checkedIn ? 'badge-success' : 'badge-warning'}`}>
                              {t.checkedIn ? 'Checked-In' : 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {tickets.length === 0 && (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)' }}>
                            No tickets booked for this event yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CheckIn;