import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', darkMode);
  }, []);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile deleted successfully.');
      localStorage.clear();
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete profile');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', name);
      data.append('phone', phone);
      data.append('bio', bio);
      if (password) data.append('password', password);
      if (photoFile) data.append('photo', photoFile);

      const res = await axios.put('http://localhost:5000/api/auth/profile', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('user', JSON.stringify(res.data));
      setMessage('Profile updated successfully!');
      setMessageType('success');
      setPassword('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
      setMessageType('error');
    }
  };

  const goHome = () => {
    if (user?.role === 'organizer') navigate('/organizer/dashboard');
    else navigate('/customer/home');
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
          <li onClick={goHome}>← Dashboard</li>
          <li onClick={() => navigate('/about')}>ℹ️ About Us</li>
          <li onClick={() => navigate('/help')}>❓ Help & FAQ</li>
          <li onClick={handleLogout} className="logout">🚪 Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">Profile Settings</h2>
            <p className="page-subtitle">Update your personal information and profile picture</p>
          </div>
        </div>

        <div className="card" style={{ maxWidth: '550px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            {user?.photo ? (
              <img src={user.photo} alt="Profile" style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', marginBottom: '12px' }} />
            ) : (
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-dark)' }}>{user?.name}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'capitalize', fontWeight: '600' }}>Role: {user?.role}</p>
          </div>

          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Profile Photo</label>
              <div className="file-upload-wrapper">
                <div className="file-upload-btn">
                  {photoFile ? photoFile.name : 'Upload New Photo (JPEG, PNG)'}
                </div>
                <input type="file" className="file-upload-input" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
              </div>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Email (Cannot change)</label>
              <input value={user?.email} disabled />
            </div>

            <div className="form-group">
              <label>Phone (Optional)</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+8801XXXXXXXXX" />
            </div>

            <div className="form-group">
              <label>Bio (Optional)</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Write something about yourself..." />
            </div>

            <div className="form-group">
              <label>New Password (Leave blank to keep current)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            {message && (
              <p className={messageType === 'success' ? 'success-text' : 'error-text'} style={{ marginBottom: '16px', textAlign: 'center' }}>
                {message}
              </p>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              Update Profile
            </button>
          </form>

          {/* Danger Zone */}
          <div className="danger-zone">
            <h4 className="danger-zone-title">⚠️ Danger Zone</h4>
            <p className="danger-zone-description">
              Deleting your profile will permanently remove your account and all associated data.
              {user?.role === 'organizer' 
                ? ' All events hosted by you, co-hosting links, and attendee tickets will be deleted.'
                : ' All tickets booked by you will be canceled.'}
            </p>
            <button 
              type="button" 
              className="btn btn-danger" 
              style={{ width: '100%' }}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete My Profile
            </button>
          </div>
        </div>
      </div>

      {/* Profile Deletion Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>⚠️</span>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-dark)' }}>
                Delete Account?
              </h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.5' }}>
                Are you absolutely sure you want to delete your profile? All account details, events, and bookings will be wiped out. <strong>This action cannot be undone.</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button"
                className="btn btn-outline" 
                style={{ flex: 1 }} 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-danger" 
                style={{ flex: 1 }} 
                onClick={handleDeleteProfile}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;