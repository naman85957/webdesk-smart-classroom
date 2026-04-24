import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = ['#4F8EF7', '#7C3AED', '#10B981', '#F59E0B', '#EC4899', '#EF4444', '#06B6D4'];
const SUBJECTS = ['Data Structures', 'Database Systems', 'Web Development', 'Machine Learning', 'Software Engineering', 'Operating Systems', 'Computer Networks', 'Mathematics', 'Physics'];

function AddScheduleModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ subject: '', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', room: '', color: '#4F8EF7', semester: '', section: '' });
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/schedule', form);
      onAdd(res.data);
      toast.success('Schedule added!');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><div className="modal-title">Add Class Schedule</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Subject</label>
            <select className="form-input" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
              <option value="">Select subject...</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Day of Week</label>
            <select className="form-input" value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: parseInt(e.target.value) }))}>
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group"><label className="form-label">Start Time</label><input type="time" className="form-input" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">End Time</label><input type="time" className="form-input" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} /></div>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group"><label className="form-label">Room / Location</label><input className="form-input" placeholder="e.g. Room 201, Lab 3" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Semester</label><input className="form-input" placeholder="e.g. 6" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} /></div>
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="flex gap-8" style={{ paddingTop: 4 }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid white' : '3px solid transparent', transition: '0.15s', transform: form.color === c ? 'scale(1.15)' : 'scale(1)' }} />
              ))}
            </div>
          </div>
          <div className="flex gap-8 mt-8">
            <button type="button" className="btn btn-outline btn-block" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? '...' : '+ Add Schedule'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Schedule() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('week');
  const [showAdd, setShowAdd] = useState(false);
  const isTeacher = user?.role === 'teacher';
  const today = new Date().getDay();

  const fetch = async () => {
    setLoading(true);
    try { const res = await api.get('/schedule'); setSchedule(res.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this schedule?')) return;
    try {
      await api.delete(`/schedule/${id}`);
      setSchedule(s => s.filter(x => x._id !== id));
      toast.success('Removed');
    } catch { toast.error('Failed'); }
  };

  const scheduleByDay = (day) => schedule.filter(s => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const hours = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Class Schedule</div>
          <div className="page-sub">Semester {user?.semester || '-'} · Weekly timetable</div>
        </div>
        <div className="flex gap-8">
          {isTeacher && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Class</button>}
        </div>
      </div>

      <div className="page-content">
        <div className="tabs">
          {[['week','Weekly View'],['list','List View']].map(([k,l]) => (
            <button key={k} className={`tab ${view===k?'active':''}`} onClick={() => setView(k)}>{l}</button>
          ))}
        </div>

        {loading ? <div className="loader"><div className="spinner" /></div> : view === 'week' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, overflowX: 'auto' }}>
            {[1,2,3,4,5,6,0].map(day => {
              const daySchedule = scheduleByDay(day);
              const isToday = day === today;
              const dateOfWeek = new Date();
              const diff = day === 0 ? (7 - dateOfWeek.getDay()) % 7 : day - dateOfWeek.getDay();
              const displayDate = new Date(dateOfWeek);
              displayDate.setDate(displayDate.getDate() + diff);

              return (
                <div key={day} style={{ minWidth: 120, background: isToday ? 'rgba(79,142,247,0.05)' : 'var(--bg2)', border: `1px solid ${isToday ? 'rgba(79,142,247,0.4)' : 'var(--border)'}`, borderRadius: 12, padding: '12px 10px' }}>
                  <div style={{ marginBottom: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isToday ? 'var(--accent)' : 'var(--text2)' }}>{DAYS_SHORT[day]}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{displayDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    {isToday && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', margin: '4px auto 0' }} />}
                  </div>
                  {daySchedule.length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '16px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: 11 }}>Free</div>
                  ) : daySchedule.map(s => (
                    <div key={s._id} style={{ background: `${s.color}18`, borderLeft: `3px solid ${s.color}`, padding: '8px 8px', borderRadius: '0 7px 7px 0', marginBottom: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.startTime} – {s.endTime}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2, lineHeight: 1.3 }}>{s.subject}</div>
                      {s.room && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{s.room}</div>}
                      {s.teacherName && <div style={{ fontSize: 10, color: 'var(--text3)' }}>{s.teacherName}</div>}
                      {isTeacher && (
                        <button onClick={() => handleDelete(s._id)} style={{ marginTop: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 11, padding: 0 }}>× Remove</button>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          /* List view */
          schedule.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <div className="empty-state-title">No schedule added yet</div>
              {isTeacher && <button className="btn btn-primary mt-12" onClick={() => setShowAdd(true)}>+ Add First Class</button>}
            </div>
          ) : (
            [1,2,3,4,5].map(day => {
              const daySchedule = scheduleByDay(day);
              if (daySchedule.length === 0) return null;
              const isToday = day === today;
              return (
                <div key={day} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: isToday ? 'var(--accent)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {DAYS[day]}{isToday && <span className="tag tag-blue" style={{ fontSize: 10 }}>Today</span>}
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {daySchedule.map(s => (
                      <div key={s._id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `4px solid ${s.color}`, borderRadius: '0 12px 12px 0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ minWidth: 90, textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.startTime}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.endTime}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{s.subject}</div>
                          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
                            {[s.room && `Room ${s.room}`, s.teacherName, s.semester && `Sem ${s.semester}`].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                        {isTeacher && (
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(s._id)} style={{ color: 'var(--danger)' }}>🗑</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {showAdd && <AddScheduleModal onClose={() => setShowAdd(false)} onAdd={s => setSchedule(p => [...p, s])} />}
    </div>
  );
}
