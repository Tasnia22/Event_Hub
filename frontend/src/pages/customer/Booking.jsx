import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [event, setEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [donationAmount, setDonationAmount] = useState('');
  const [attendees, setAttendees] = useState([{ name: '', email: '' }]);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [ticketResults, setTicketResults] = useState(null);

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
        <p style={{ fontSize: '15px', color: 'var(--text-light)', fontWeight: 600 }}>Loading booking details...</p>
      </div>
    </div>
  );

  const ticketObj = event.ticketOptions.find(t => t.name === selectedTicket);

  const getAmountPerTicket = () => {
    if (!ticketObj) return 0;
    if (ticketObj.type === 'fixed') return ticketObj.price;
    if (ticketObj.type === 'donation') return Number(donationAmount) || 0;
    return 0;
  };

  const getTotalAmount = () => getAmountPerTicket() * quantity;

  const updateQuantity = (val) => {
    const q = Math.max(1, Number(val));
    setQuantity(q);
    const newAttendees = Array.from({ length: q }, (_, i) => attendees[i] || { name: '', email: '' });
    setAttendees(newAttendees);
  };

  const updateAttendee = (index, field, value) => {
    const updated = [...attendees];
    updated[index][field] = value;
    setAttendees(updated);
  };

  const handleProceedToPayment = () => {
    setError('');
    if (!selectedTicket) return setError('Select a ticket option');
    if (ticketObj.type === 'donation' && (!donationAmount || Number(donationAmount) <= 0)) return setError('Enter a donation amount');
    if (quantity > ticketObj.quantity) return setError('Not enough tickets available');
    for (const a of attendees) {
      if (!a.name || !a.email) return setError('Enter name and email for every attendee');
    }
    setStep(2);
  };

  const handleConfirmPayment = async () => {
    setError('');
    if (getTotalAmount() > 0 && (!phone || !pin)) return setError('Enter phone number and PIN');

    setProcessing(true);
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('http://localhost:5000/api/tickets/book', {
          eventId: event._id,
          ticketName: ticketObj.name,
          ticketType: ticketObj.type,
          attendees,
          amountPerTicket: getAmountPerTicket()
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTicketResults(res.data);
        setProcessing(false);
        setStep(3);
      } catch (err) {
        setError(err.response?.data?.message || 'Booking failed');
        setProcessing(false);
      }
    }, 2000);
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
            <h2 className="page-title">Book Tickets</h2>
            <p className="page-subtitle">{event.name}</p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate(`/customer/event/${event._id}`)}>← Cancel</button>
        </div>

        <div className="card" style={{ maxWidth: '550px', margin: '0 auto' }}>
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'completed' : ''}`}>1</div>
            <div className={`step-dot ${step >= 2 ? (step === 2 ? 'active' : 'completed') : ''}`}>2</div>
            <div className={`step-dot ${step === 3 ? 'completed' : ''}`}>3</div>
          </div>

          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', color: 'var(--text-dark)' }}>Select Tickets & Details</h3>
              
              <div className="form-group">
                <label>Ticket Option</label>
                <select value={selectedTicket} onChange={(e) => setSelectedTicket(e.target.value)}>
                  <option value="">-- Choose Ticket Type --</option>
                  {event.ticketOptions.map((t, i) => (
                    <option key={i} value={t.name} disabled={t.quantity <= 0}>
                      {t.name} ({t.type}) {t.type === 'fixed' ? `- ৳${t.price}` : ''} {t.quantity <= 0 ? '- (SOLD OUT)' : `- (${t.quantity} left)`}
                    </option>
                  ))}
                </select>
              </div>

              {ticketObj && (
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" min="1" max={ticketObj.quantity} value={quantity} onChange={(e) => updateQuantity(e.target.value)} />
                </div>
              )}

              {ticketObj && ticketObj.type === 'donation' && (
                <div className="form-group">
                  <label>Donation Amount per Ticket (৳)</label>
                  <input type="number" min="1" placeholder="Enter custom donation amount" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} />
                </div>
              )}

              {ticketObj && (
                <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-dark)' }}>Attendee Roster Details</h4>
                  {attendees.map((a, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', padding: '16px', marginBottom: '12px', borderRadius: '8px', background: 'var(--bg)' }}>
                      <p style={{ fontWeight: '700', fontSize: '12px', marginBottom: '10px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendee #{i + 1}</p>
                      <div className="form-group" style={{ marginBottom: '10px' }}>
                        <input placeholder="Full Name" value={a.name} onChange={(e) => updateAttendee(i, 'name', e.target.value)} required />
                      </div>
                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <input placeholder="Email Address" type="email" value={a.email} onChange={(e) => updateAttendee(i, 'email', e.target.value)} required />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {ticketObj && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-light)' }}>Total Amount:</span>
                  <strong style={{ fontSize: '22px', color: 'var(--primary)' }}>৳{getTotalAmount()}</strong>
                </div>
              )}

              {error && <p className="error-text" style={{ marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
              
              <button onClick={handleProceedToPayment} className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={!selectedTicket}>
                {ticketObj && getTotalAmount() === 0 ? 'Get Free Ticket(s)' : 'Proceed to Payment'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px', color: 'var(--text-dark)' }}>Checkout</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '20px' }}>
                Total Payment: <strong style={{ color: 'var(--primary)', fontSize: '16px' }}>৳{getTotalAmount()}</strong>
              </p>

              {getTotalAmount() > 0 ? (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px', color: 'var(--text-dark)' }}>Select Payment Method</label>
                  <div className="payment-methods-grid">
                    <div className={`payment-btn bkash ${paymentMethod === 'bkash' ? 'active' : ''}`} onClick={() => setPaymentMethod('bkash')}>
                      bKash
                    </div>
                    <div className={`payment-btn nagad ${paymentMethod === 'nagad' ? 'active' : ''}`} onClick={() => setPaymentMethod('nagad')}>
                      Nagad
                    </div>
                  </div>

                  <div className="payment-form-card">
                    <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '16px', textAlign: 'center', letterSpacing: '0.05em' }}>
                      {paymentMethod === 'bkash' ? 'bKash Account Checkout' : 'Nagad Account Checkout'}
                    </p>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input placeholder="e.g. 01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: '0' }}>
                      <label>Account PIN</label>
                      <input type="password" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} required />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '24px', background: 'var(--secondary-light)', border: '1px solid var(--secondary)', borderRadius: '8px', color: 'var(--secondary-hover)', textAlign: 'center', marginBottom: '20px', fontWeight: '600' }}>
                  This booking is free. No billing info needed. Click below to continue.
                </div>
              )}

              {error && <p className="error-text" style={{ marginTop: '16px', textAlign: 'center' }}>{error}</p>}
              
              <button onClick={handleConfirmPayment} disabled={processing} className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '20px' }}>
                {processing ? 'Processing Payment...' : 'Pay & Book Tickets'}
              </button>
            </div>
          )}

          {step === 3 && ticketResults && (
            <div className="ticket-container">
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px' }}>✓</div>
                <h3 style={{ color: 'var(--secondary-hover)', fontWeight: '800', fontSize: '20px' }}>Booking Successful!</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '13px', marginTop: '4px' }}>Your tickets have been generated successfully.</p>
              </div>

              {ticketResults.map((t) => (
                <div key={t._id} className="ticket-card">
                  <div className="ticket-header">
                    <h4>{event.name}</h4>
                    <p style={{ fontSize: '11px', opacity: 0.8 }}>📅 {new Date(event.startDateTime).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                  </div>
                  <div className="ticket-body">
                    <div className="ticket-detail">Attendee: <strong>{t.attendeeName}</strong></div>
                    <div className="ticket-detail">Email: <strong>{t.attendeeEmail}</strong></div>
                    <div className="ticket-detail">Type: <strong>{t.ticketName}</strong></div>
                    
                    <div className="ticket-divider"></div>
                    
                    <div className="ticket-detail" style={{ fontSize: '11px' }}>Ticket #: <strong style={{ fontFamily: 'monospace' }}>{t.ticketNumber}</strong></div>
                    <div className="ticket-detail" style={{ fontSize: '11px' }}>Total Paid: <strong>৳{t.amountPaid}</strong></div>
                    
                    {t.qrImage && (
                      <div className="ticket-qr">
                        <img src={t.qrImage} alt="QR Code" style={{ width: '120px', height: '120px' }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button onClick={() => navigate('/customer/bookings')} className="btn btn-secondary" style={{ width: '100%', padding: '12px', marginTop: '12px' }}>
                Go to My Bookings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Booking;