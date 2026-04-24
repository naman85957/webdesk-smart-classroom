import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', semester: user?.semester || '', bio: user?.bio || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const saveProfile = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSavingPw(false); }
  };

  const roleColor = user?.role === 'teacher' ? 'var(--accent2)' : 'var(--accent)';

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">My Profile</div>
          <div className="page-sub">Manage your account and preferences</div>
        </div>
      </div>

      <div className="page-content">
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Left: Profile card */}
          <div>
            <div className="card" style={{ textAlign: 'center', padding: 32, marginBottom: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor}, var(--accent2))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, margin: '0 auto 16px', color: 'white' }}>
                {getInitials(user?.name)}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Syne,sans-serif' }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>{user?.email}</div>
              <div style={{ marginTop: 12 }}>
                <span className={`tag ${user?.role === 'teacher' ? 'tag-purple' : 'tag-blue'}`} style={{ fontSize: 13, padding: '5px 14px' }}>
                  {user?.role === 'teacher' ? '🎓 Teacher' : '👨‍🎓 Student'}
                </span>
              </div>
              {user?.department && <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text2)' }}>🏛 {user.department}</div>}
              {user?.semester && <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text2)' }}>📚 Semester {user.semester}</div>}
              {user?.bio && <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text3)', lineHeight: 1.6, fontStyle: 'italic' }}>"{user.bio}"</div>}
            </div>

            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Account Info</div>
              {[
                { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : 'N/A' },
                { label: 'Role', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) },
                { label: 'Email verified', value: '✓ Verified' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text3)' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Tabs */}
          <div>
            <div className="tabs">
              <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Edit Profile</button>
              <button className={`tab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>Security</button>
              <button className={`tab ${tab === 'notifications' ? 'active' : ''}`} onClick={() => setTab('notifications')}>Preferences</button>
            </div>

            {tab === 'profile' && (
              <div className="card">
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Edit Profile</div>
                <form onSubmit={saveProfile}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input className="form-input" placeholder="e.g. Computer Science" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                  </div>
                  {user?.role === 'student' && (
                    <div className="form-group">
                      <label className="form-label">Semester</label>
                      <select className="form-input" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                        <option value="">Not specified</option>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-input" rows={3} placeholder="Tell something about yourself..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '...' : '✓ Save Changes'}</button>
                </form>
              </div>
            )}

            {tab === 'security' && (
              <div className="card">
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Change Password</div>
                <form onSubmit={changePassword}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-input" required value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-input" required minLength={6} value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-input" required value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={savingPw}>{savingPw ? '...' : '🔒 Update Password'}</button>
                </form>
              </div>
            )}

            {tab === 'notifications' && (
              <div className="card">
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Notification Preferences</div>
                {[
                  { label: 'New assignment posted', desc: 'Get notified when teachers assign new work' },
                  { label: 'Class starting soon', desc: 'Reminder 10 minutes before class starts' },
                  { label: 'Doubt answered', desc: 'When your doubt gets a reply' },
                  { label: 'New study material', desc: 'When new materials are uploaded' },
                  { label: 'Assignment deadline reminder', desc: '24 hours before due date' },
                  { label: 'Announcements', desc: 'Important school announcements' },
                ].map(({ label, desc }, i) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{desc}</div>
                    </div>
                    <div style={{ position: 'relative', width: 40, height: 22, background: i % 2 === 0 ? 'var(--accent)' : 'var(--bg4)', borderRadius: 11, cursor: 'pointer', transition: '0.2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 3, left: i % 2 === 0 ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: '0.2s' }} />
                    </div>
                  </div>
                ))}
                <button className="btn btn-primary mt-16" onClick={() => toast.success('Preferences saved!')}>Save Preferences</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
