import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/schedule', icon: '📅', label: 'Schedule' },
  { to: '/materials', icon: '📚', label: 'Study Materials' },
  { to: '/assignments', icon: '📝', label: 'Assignments' },
  { to: '/classes', icon: '🎥', label: 'Live Classes' },
  { to: '/doubts', icon: '❓', label: 'Ask Doubts' },
];

const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <aside style={{
      width: collapsed ? 64 : 240,
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, height: '100vh',
      zIndex: 100, transition: 'width 0.25s ease', overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 0' : '22px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg,#4F8EF7,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Webdesk</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 2 }}>Smart Classroom</div>
          </div>
        )}
        {collapsed && <span style={{ fontSize: 20 }}>🎓</span>}
        <button onClick={() => setCollapsed(c => !c)} className="icon-btn" style={{ flexShrink: 0, width: 28, height: 28, fontSize: 12 }}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/profile')}>
          <div className="avatar avatar-sm">{getInitials(user?.name)}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize' }}>{user?.role} {user?.semester ? `· Sem ${user.semester}` : ''}</div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
        {!collapsed && <div style={{ padding: '8px 20px 4px', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Main Menu</div>}
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 12,
            padding: collapsed ? '12px 0' : '10px 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
            background: isActive ? 'rgba(79,142,247,0.1)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text2)',
            fontSize: 14, fontWeight: 500, transition: '0.2s',
            textDecoration: 'none'
          })}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Profile & Logout */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 0' }}>
        <NavLink to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '10px 0' : '10px 20px', justifyContent: collapsed ? 'center' : 'flex-start', color: 'var(--text2)', fontSize: 14, textDecoration: 'none', transition: '0.2s' }}>
          <span style={{ fontSize: 18 }}>👤</span>
          {!collapsed && <span>Profile</span>}
        </NavLink>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '10px 0' : '10px 20px', justifyContent: collapsed ? 'center' : 'flex-start', color: 'var(--text2)', fontSize: 14, background: 'none', border: 'none', width: '100%', cursor: 'pointer', transition: '0.2s', fontFamily: 'DM Sans,sans-serif' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}>
          <span style={{ fontSize: 18 }}>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
