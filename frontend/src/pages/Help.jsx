import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const faqs = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" on the home page. Choose your role — Customer (to browse & buy tickets) or Organizer (to create & manage events). Fill in your name, email, and password, then you\'re all set!'
      },
      {
        q: 'Can I switch between organizer and customer roles?',
        a: 'Each account is tied to a single role. To use both, simply create two separate accounts with different emails.'
      }
    ]
  },
  {
    category: 'Booking Tickets',
    items: [
      {
        q: 'How do I find an event and buy a ticket?',
        a: 'Log in as a Customer, browse the Home page, click an event card, select your ticket type and number of attendees, then proceed to checkout. You can pay via bKash or Nagad.'
      },
      {
        q: 'What happens after I book?',
        a: 'You\'ll receive a notification confirming your booking. You can view all your tickets in "My Bookings". Each ticket shows attendee details and a scannable QR code.'
      },
      {
        q: 'Can I download my ticket?',
        a: 'Yes! On the My Bookings page, each ticket has a "Download PDF" button. The PDF contains your event info, attendee name, ticket number, and QR code for scanning at the door.'
      }
    ]
  },
  {
    category: 'Check-In Process',
    items: [
      {
        q: 'How does check-in work for organizers?',
        a: 'Go to the Check-In page from your organizer dashboard. Grant camera access, then scan attendee QR codes. The system instantly verifies and marks the ticket as checked-in.'
      },
      {
        q: 'What if a ticket is already scanned?',
        a: 'The system will alert you that the ticket has already been checked-in, preventing duplicate entries.'
      }
    ]
  },
  {
    category: 'Feedback & Ratings',
    items: [
      {
        q: 'How do I leave a review for an event?',
        a: 'After attending an event, go to "My Bookings" and find that event. You\'ll see a star rating input and a comment box below your ticket. Submit your review anytime after the event.'
      },
      {
        q: 'Can organizers see my review?',
        a: 'Yes! Organizers can see all ratings and reviews for their events on their dashboard. This helps them improve future events.'
      }
    ]
  },
  {
    category: 'Notifications',
    items: [
      {
        q: 'How do notifications work?',
        a: 'You\'ll receive automated notifications when you book a ticket (Booking Confirmed) and when your ticket is scanned at an event (Checked-In). Check the bell icon in the top-right of your dashboard.'
      }
    ]
  }
];

function Help() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [openFaq, setOpenFaq] = useState(null);

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
      <div className="sidebar">
        <div className="sidebar-logo">🎉 EventHub</div>
        {user && (
          <div className="sidebar-profile" onClick={() => navigate('/profile')}>
            {user.photo ? (
              <img src={user.photo} alt="Profile" className="sidebar-avatar" />
            ) : (
              <div className="sidebar-avatar">{user.name?.charAt(0).toUpperCase()}</div>
            )}
            <h4>{user.name}</h4>
          </div>
        )}
        <ul className="sidebar-nav">
          <li onClick={goHome}>← Back</li>
          {user && <li onClick={handleLogout} className="logout">Logout</li>}
        </ul>
      </div>

      <div className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">Help & FAQ</h2>
            <p className="page-subtitle">Everything you need to know about EventHub</p>
          </div>
        </div>

        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          {/* Contact Banner */}
          <div className="card" style={{ padding: '28px', marginBottom: '32px', background: 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)', border: 'none' }}>
            <h3 style={{ color: '#fff', fontWeight: '800', fontSize: '18px', marginBottom: '8px' }}>Need more help?</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.5' }}>
              Our support team is here to help. Reach us at{' '}
              <strong style={{ color: '#fff' }}>support@eventhub.app</strong> and we'll get back to you within 24 hours.
            </p>
          </div>

          {faqs.map((section, si) => (
            <div key={si} style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '18px', background: 'var(--primary)', borderRadius: '2px', display: 'inline-block' }}></span>
                {section.category}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {section.items.map((faq, fi) => {
                  const key = `${si}-${fi}`;
                  const isOpen = openFaq === key;
                  return (
                    <div
                      key={fi}
                      className="card"
                      style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                      onClick={() => setOpenFaq(isOpen ? null : key)}
                    >
                      <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-dark)' }}>{faq.q}</span>
                        <span style={{ fontSize: '18px', color: 'var(--primary)', flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(45deg)' : 'none' }}>+</span>
                      </div>
                      {isOpen && (
                        <div style={{ padding: '0 20px 18px', borderTop: '1px solid var(--border)' }}>
                          <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.7', marginTop: '12px' }}>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Help;
