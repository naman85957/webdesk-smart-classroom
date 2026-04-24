import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const StatCard = ({ num, label, color, icon, change, changeColor }) => (
  <div className="card" style={{ position: 'relative', overflow: 'hidden', cursor: 'default' }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, borderRadius: '0 16px 0 60px', background: color, opacity: 0.15 }} />
    <div style={{ position: 'absolute', top: 18, right: 18, fontSize: 22, opacity: 0.7 }}>{icon}</div>
    <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Syne,sans-serif', color }}>{num}</div>
    <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>{label}</div>
    {change && <div style={{ fontSize: 11, color: changeColor || 'var(--accent3)', marginTop: 8 }}>{change}</div>}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ materials: [], assignments: [], classes: [], announcements: [], schedule: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [m, a, c, ann, s] = await Promise.all([
          api.get('/materials').catch(() => ({ data: [] })),
          api.get('/assignments').catch(() => ({ data: [] })),
          api.get('/classes').catch(() => ({ data: [] })),
          api.get('/announcements').catch(() => ({ data: [] })),
          api.get('/schedule').catch(() => ({ data: [] })),
        ]);
        setData({ materials: m.data, assignments: a.data, classes: c.data, announcements: ann.data, schedule: s.data });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const pending = data.assignments.filter(a => !a.submissions?.find(s => s.student?._id === user?._id));
  const liveClass = data.classes.find(c => c.status === 'live');
  const today = new Date().getDay();
  const todaySchedule = data.schedule.filter(s => s.dayOfWeek === today);
  const greetHour = new Date().getHours();
  const greet = greetHour < 12 ? 'Good morning' : greetHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">{greet}, {user?.name?.split(' ')[0]}! 👋</div>
          <div className="page-sub">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Semester {user?.semester || '-'}</div>
        </div>
        <div className="flex gap-8">
          <button className="icon-btn" title="Notifications">🔔<div className="notif-dot" /></button>
          <button className="icon-btn" onClick={() => navigate('/profile')}>⚙️</button>
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="grid-4 mb-20">
          <StatCard num={data.materials.length} label="Study Materials" color="var(--accent)" icon="📚" change="↑ Available resources" />
          <StatCard num={pending.length} label="Pending Assignments" color="var(--accent2)" icon="📝" change={pending.length > 0 ? '⚠ Action required' : '✓ All done!'} changeColor={pending.length > 0 ? 'var(--accent4)' : 'var(--accent3)'} />
          <StatCard num={data.classes.filter(c => c.status === 'scheduled').length} label="Upcoming Classes" color="var(--accent3)" icon="🎥" change="Scheduled sessions" />
          <StatCard num={data.announcements.length} label="Announcements" color="var(--accent4)" icon="📢" change="From faculty" />
        </div>

        {/* Live class alert */}
        {liveClass && (
          <div style={{ background: 'linear-gradient(135deg,rgba(79,142,247,0.12),rgba(124,58,237,0.12))', border: '1px solid rgba(79,142,247,0.3)', borderRadius: 16, padding: 24, marginBottom: 24 }} className="fade-in">
            <div className="live-badge mb-12"><div className="live-dot" /> LIVE NOW</div>
            <div className="flex items-center justify-between flex-wrap gap-12">
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Syne,sans-serif' }}>{liveClass.title}</div>
                <div style={{ color: 'var(--text3)', marginTop: 6, fontSize: 14 }}>
                  {liveClass.teacher?.name} · {liveClass.students?.length || 0} students joined
                </div>
              </div>
              <button className="btn btn-success" onClick={() => navigate('/classes')}>🎥 Join Now →</button>
            </div>
          </div>
        )}

        <div className="grid-2">
          {/* Today's Schedule */}
          <div className="card">
            <div className="section-header">
              <div className="section-title">Today's Schedule</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/schedule')}>View all →</button>
            </div>
            {todaySchedule.length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}>
                <div className="empty-state-icon">📅</div>
                <div style={{ color: 'var(--text3)', fontSize: 13 }}>No classes scheduled today</div>
              </div>
            ) : todaySchedule.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 10px', borderRadius: 10, marginBottom: 6, background: 'var(--card)', cursor: 'pointer' }}
                onClick={() => navigate('/schedule')}>
                <div style={{ textAlign: 'right', minWidth: 54 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{s.startTime}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{s.endTime}</div>
                </div>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: s.color || 'var(--accent)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{s.subject}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{s.room ? `Room ${s.room}` : ''} {s.teacherName ? `· ${s.teacherName}` : ''}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Announcements */}
          <div className="card">
            <div className="section-header">
              <div className="section-title">Announcements</div>
            </div>
            {data.announcements.slice(0, 5).map((ann, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: ann.priority === 'urgent' ? 'rgba(239,68,68,0.15)' : ann.priority === 'high' ? 'rgba(245,158,11,0.15)' : 'rgba(79,142,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                  {ann.priority === 'urgent' ? '🚨' : ann.priority === 'high' ? '⚡' : '📢'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{ann.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{ann.author?.name} · {new Date(ann.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {data.announcements.length === 0 && (
              <div className="empty-state" style={{ padding: 30 }}>
                <div className="empty-state-icon">📢</div>
                <div style={{ color: 'var(--text3)', fontSize: 13 }}>No announcements yet</div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming assignments */}
        <div className="card mt-20">
          <div className="section-header">
            <div className="section-title">Pending Assignments</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/assignments')}>View all →</button>
          </div>
          {pending.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-title" style={{ fontSize: 15 }}>All caught up!</div>
              <div style={{ color: 'var(--text3)', fontSize: 13 }}>No pending assignments</div>
            </div>
          ) : (
            <div className="grid-3">
              {pending.slice(0, 3).map((a, i) => {
                const due = new Date(a.dueDate);
                const now = new Date();
                const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                const isOverdue = diff < 0;
                const isUrgent = diff <= 1 && diff >= 0;
                return (
                  <div key={i} className="card-sm" style={{ cursor: 'pointer' }} onClick={() => navigate('/assignments')}>
                    <div className="flex justify-between mb-8">
                      <span className={`tag ${isOverdue ? 'tag-red' : isUrgent ? 'tag-amber' : 'tag-green'}`}>
                        {isOverdue ? 'Overdue' : isUrgent ? 'Due soon' : `${diff}d left`}
                      </span>
                      <span className={`tag ${a.priority === 'high' ? 'tag-red' : a.priority === 'medium' ? 'tag-amber' : 'tag-blue'}`}>{a.priority}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{a.subject} · {a.assignedBy?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>Due: {due.toLocaleDateString('en-IN')}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
