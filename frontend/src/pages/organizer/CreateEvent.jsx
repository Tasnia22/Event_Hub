import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateEvent() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', darkMode);
  }, []);
  const [form, setForm] = useState({ name: '', startDateTime: '', endDateTime: '', venue: '', description: '', category: 'General' });
  const [imageFile, setImageFile] = useState(null);
  const [ticketOptions, setTicketOptions] = useState([]);
  const [newTicket, setNewTicket] = useState({ type: 'free', name: '', price: '', quantity: '' });
  const [coSearch, setCoSearch] = useState('');
  const [coResults, setCoResults] = useState([]);
  const [coOrganizers, setCoOrganizers] = useState([]);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addTicketOption = () => {
    if (!newTicket.name) return alert('Enter a ticket name');
    if (newTicket.type === 'fixed' && (!newTicket.price || !newTicket.quantity)) return alert('Enter price and quantity');
    if ((newTicket.type === 'free' || newTicket.type === 'donation') && !newTicket.quantity) return alert('Enter quantity');

    setTicketOptions([...ticketOptions, newTicket]);
    setNewTicket({ type: 'free', name: '', price: '', quantity: '' });
  };

  const removeTicketOption = (index) => {
    setTicketOptions(ticketOptions.filter((_, i) => i !== index));
  };

  const handleCoSearch = async (value) => {
    setCoSearch(value);
    if (value.length < 2) return setCoResults([]);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/auth/search-organizers?q=${value}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoResults(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addCoOrganizer = (user) => {
    if (coOrganizers.find(c => c._id === user._id)) return;
    setCoOrganizers([...coOrganizers, user]);
    setCoSearch('');
    setCoResults([]);
  };

  const removeCoOrganizer = (userId) => {
    setCoOrganizers(coOrganizers.filter(c => c._id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (ticketOptions.length === 0) return setError('Add at least one ticket option');

    const now = new Date();
    const start = new Date(form.startDateTime);
    const end = new Date(form.endDateTime);

    if (start < now) return setError('Start time cannot be in the past');
    if (end <= start) return setError('End time must be after start time');

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', form.name);
      data.append('startDateTime', form.startDateTime);
      data.append('endDateTime', form.endDateTime);
      data.append('venue', form.venue);
      data.append('description', form.description);
      data.append('category', form.category);
      data.append('ticketTiers', JSON.stringify(ticketOptions));
      data.append('coOrganizerIds', JSON.stringify(coOrganizers.map(c => c._id)));
      if (imageFile) data.append('image', imageFile);

      await axios.post('http://localhost:5000/api/events', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      alert('Event created successfully!');
      navigate('/organizer/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
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
          <li className="active" onClick={() => navigate('/organizer/create-event')}>➕ Create Event</li>
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
            <h2 className="page-title">Create Event</h2>
            <p className="page-subtitle">Publish a new event listings</p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/organizer/events')}>← Cancel</button>
        </div>

        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Event Name</label>
              <input name="name" placeholder="Enter event name" value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date & Time</label>
                <input name="startDateTime" type="datetime-local" value={form.startDateTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>End Date & Time</label>
                <input name="endDateTime" type="datetime-local" value={form.endDateTime} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Venue / Location</label>
              <input name="venue" placeholder="e.g. Auditorium Hall, Dhaka" value={form.venue} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Event Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="General">General</option>
                <option value="Concert">🎵 Concert</option>
                <option value="Seminar">📚 Seminar</option>
                <option value="Workshop">🔧 Workshop</option>
                <option value="Sports">⚽ Sports</option>
              </select>
            </div>

            <div className="form-group">
              <label>Event Banner Image</label>
              <div className="file-upload-wrapper">
                <div className="file-upload-btn">
                  {imageFile ? imageFile.name : 'Choose Event Banner Image'}
                </div>
                <input type="file" className="file-upload-input" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" placeholder="Write event details..." value={form.description} onChange={handleChange} />
            </div>

            {/* Ticket Options creator */}
            <div style={{ border: '1px solid var(--border)', padding: '20px', borderRadius: '12px', marginBottom: '24px', backgroundColor: 'var(--bg)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-dark)' }}>Configure Ticket Options</h4>
              
              <div className="form-group">
                <label>Ticket Type</label>
                <select value={newTicket.type} onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })}>
                  <option value="free">Free</option>
                  <option value="fixed">Fixed Price</option>
                  <option value="donation">Donation</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ticket Name</label>
                <input placeholder="e.g. VIP, General" value={newTicket.name} onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })} />
              </div>

              <div className="form-row">
                {newTicket.type === 'fixed' && (
                  <div className="form-group">
                    <label>Price (৳)</label>
                    <input placeholder="Taka" type="number" min="1" value={newTicket.price} onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })} />
                  </div>
                )}
                <div className="form-group">
                  <label>Quantity Available</label>
                  <input placeholder="Quantity" type="number" min="1" value={newTicket.quantity} onChange={(e) => setNewTicket({ ...newTicket, quantity: e.target.value })} />
                </div>
              </div>

              <button type="button" className="btn btn-secondary" onClick={addTicketOption} style={{ fontSize: '13px', padding: '8px 16px' }}>
                + Add Ticket Option
              </button>

              {ticketOptions.length > 0 && (
                <div style={{ marginTop: '20px', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-light)', marginBottom: '8px', textTransform: 'uppercase' }}>Configured Options:</p>
                  <ul className="tag-list" style={{ marginTop: '0' }}>
                    {ticketOptions.map((t, i) => (
                      <li key={i} className="tag-item">
                        <span>
                          <strong>{t.name}</strong> ({t.type}) {t.type === 'fixed' ? `- ৳${t.price}` : ''} x {t.quantity}
                        </span>
                        <span className="tag-remove" onClick={() => removeTicketOption(i)}>×</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Co-organizer search */}
            <div style={{ border: '1px solid var(--border)', padding: '20px', borderRadius: '12px', marginBottom: '24px', backgroundColor: 'var(--bg)', position: 'relative' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-dark)' }}>Add Co-Organizers</h4>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <input placeholder="Search co-organizers..." value={coSearch} onChange={(e) => handleCoSearch(e.target.value)} />
                {coResults.length > 0 && (
                  <div className="autocomplete-dropdown" style={{ left: '20px', right: '20px', width: 'calc(100% - 40px)' }}>
                    {coResults.map((u) => (
                      <div key={u._id} className="autocomplete-item" onClick={() => addCoOrganizer(u)}>
                        <strong>{u.name}</strong> ({u.email})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {coOrganizers.length > 0 && (
                <div style={{ marginTop: '20px', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-light)', marginBottom: '8px', textTransform: 'uppercase' }}>Selected Co-Organizers:</p>
                  <ul className="tag-list" style={{ marginTop: '0' }}>
                    {coOrganizers.map((c) => (
                      <li key={c._id} className="tag-item">
                        <span>{c.name} ({c.email})</span>
                        <span className="tag-remove" onClick={() => removeCoOrganizer(c._id)}>×</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {error && <p className="error-text" style={{ marginBottom: '20px', textAlign: 'center' }}>{error}</p>}
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              Create Event Listing
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;