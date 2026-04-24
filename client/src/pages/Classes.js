import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

function NewClassModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', subject: '', description: '', scheduledAt: '', duration: 60, meetLink: '', isRecorded: false });
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/classes', form);
      onAdd(res.data);
      toast.success('Class scheduled!');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><div className="modal-title">Schedule Online Class</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Class Title</label><input className="form-input" required placeholder="e.g. Graph Algorithms - Lecture 9" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Subject</label><input className="form-input" required placeholder="Data Structures" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={2} placeholder="Topics to be covered..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group"><label className="form-label">Date & Time</label><input type="datetime-local" className="form-input" required value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Duration (min)</label>
              <select className="form-input" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}>
                {[30,45,60,90,120].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Meet Link (optional)</label><input className="form-input" placeholder="https://meet.google.com/..." value={form.meetLink} onChange={e => setForm(f => ({ ...f, meetLink: e.target.value }))} /></div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="recorded" checked={form.isRecorded} onChange={e => setForm(f => ({ ...f, isRecorded: e.target.checked }))} style={{ width: 16, height: 16 }} />
            <label htmlFor="recorded" style={{ fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>Enable recording</label>
          </div>
          <div className="flex gap-8 mt-8">
            <button type="button" className="btn btn-outline btn-block" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? '...' : '📅 Schedule'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClassDetailModal({ cls, onClose, onStatusChange, isTeacher }) {
  const [status, setStatus] = useState(cls.status);
  const [recording, setRecording] = useState(cls.recordingUrl || '');
  const [loading, setLoading] = useState(false);

  const changeStatus = async (s) => {
    setLoading(true);
    try {
      await api.put(`/classes/${cls._id}/status`, { status: s });
      setStatus(s);
      onStatusChange(cls._id, s);
      toast.success(`Class is now ${s}`);
    } catch { toast.error('Failed to update status'); }
    finally { setLoading(false); }
  };

  const saveRecording = async () => {
    try {
      await api.put(`/classes/${cls._id}/recording`, { recordingUrl: recording });
      toast.success('Recording URL saved');
    } catch { toast.error('Failed'); }
  };

  const join = async () => {
    try {
      await api.post(`/classes/${cls._id}/join`);
      if (cls.meetLink) window.open(cls.meetLink, '_blank');
      else toast.success('Joined class!');
    } catch (err) { toast.error(err.response?.data?.message || 'Join failed'); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{cls.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>{cls.subject}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span className={`tag ${status === 'live' ? 'tag-red' : status === 'ended' ? 'tag-gray' : 'tag-green'}`}>
            {status === 'live' ? '🔴 Live' : status === 'ended' ? '⏹ Ended' : '🗓 Scheduled'}
          </span>
          <span className="tag tag-blue">🕐 {new Date(cls.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          <span className="tag tag-purple">⏱ {cls.duration} min</span>
          <span className="tag tag-amber">👥 {cls.students?.length || 0} enrolled</span>
        </div>

        {cls.description && <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>{cls.description}</p>}

        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Class Code</div>
          <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, letterSpacing: 4, color: 'var(--accent)' }}>{cls.classCode}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Share this code with students to join</div>
        </div>

        {isTeacher ? (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Manage Class</div>
            <div className="flex gap-8 mb-16 flex-wrap">
              {status === 'scheduled' && <button className="btn btn-success btn-sm" disabled={loading} onClick={() => changeStatus('live')}>🔴 Start Live</button>}
              {status === 'live' && <button className="btn btn-danger btn-sm" disabled={loading} onClick={() => changeStatus('ended')}>⏹ End Class</button>}
              {status === 'ended' && <span className="tag tag-gray">Class ended</span>}
            </div>
            {cls.isRecorded && (
              <div className="form-group">
                <label className="form-label">Recording URL</label>
                <div className="flex gap-8">
                  <input className="form-input flex-1" placeholder="https://..." value={recording} onChange={e => setRecording(e.target.value)} />
                  <button className="btn btn-outline btn-sm" onClick={saveRecording}>Save</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-8">
            {status === 'live' ? (
              <button className="btn btn-success btn-block" onClick={join}>🎥 Join Live Class</button>
            ) : status === 'ended' && cls.recordingUrl ? (
              <a href={cls.recordingUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-block">▶ Watch Recording</a>
            ) : (
              <button className="btn btn-outline btn-block" disabled>
                {status === 'scheduled' ? '⏳ Not started yet' : 'No recording available'}
              </button>
            )}
          </div>
        )}

        {cls.students?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Enrolled Students ({cls.students.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cls.students.slice(0, 12).map((s, i) => (
                <div key={i} title={s.name} style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${i * 47}, 60%, 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>
                  {s.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
              ))}
              {cls.students.length > 12 && <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text3)' }}>+{cls.students.length - 12}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JoinByCodeModal({ onClose, onJoined }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/classes/join-code', { code });
      onJoined(res.data);
      toast.success('Joined class!');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid code'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="modal-header"><div className="modal-title">Join Class by Code</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Class Code</label>
            <input className="form-input" required placeholder="e.g. AB12CD" value={code} onChange={e => setCode(e.target.value.toUpperCase())} style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 4, textAlign: 'center' }} maxLength={6} />
          </div>
          <div className="flex gap-8 mt-8">
            <button type="button" className="btn btn-outline btn-block" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? '...' : 'Join →'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Classes() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [showNew, setShowNew] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const res = await api.get('/classes'); setClasses(res.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const isTeacher = user?.role === 'teacher';
  const filtered = classes.filter(c => {
    if (tab === 'live') return c.status === 'live';
    if (tab === 'upcoming') return c.status === 'scheduled';
    if (tab === 'ended') return c.status === 'ended';
    return true;
  });

  const liveClasses = classes.filter(c => c.status === 'live');

  const handleStatusChange = (id, status) => {
    setClasses(prev => prev.map(c => c._id === id ? { ...c, status } : c));
  };

  const colorForSubject = (subj) => {
    const colors = ['var(--accent)', 'var(--accent2)', 'var(--accent3)', 'var(--accent4)', 'var(--accent5)'];
    let hash = 0;
    for (let c of (subj || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Online Classes</div>
          <div className="page-sub">Live sessions, recordings & group discussions</div>
        </div>
        <div className="flex gap-8">
          {!isTeacher && <button className="btn btn-outline" onClick={() => setShowJoin(true)}>🔑 Join by Code</button>}
          {isTeacher && <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Schedule Class</button>}
        </div>
      </div>

      <div className="page-content">
        {/* Live banner */}
        {liveClasses.map(lc => (
          <div key={lc._id} style={{ background: 'linear-gradient(135deg,rgba(79,142,247,0.12),rgba(124,58,237,0.12))', border: '1px solid rgba(79,142,247,0.3)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div className="live-badge mb-12"><div className="live-dot" />LIVE NOW</div>
            <div className="flex items-center justify-between flex-wrap gap-12">
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Syne,sans-serif' }}>{lc.title}</div>
                <div style={{ color: 'var(--text3)', marginTop: 6, fontSize: 14 }}>{lc.teacher?.name} · {lc.students?.length || 0} students enrolled</div>
              </div>
              <button className="btn btn-success" onClick={() => setSelected(lc)}>🎥 Join Class →</button>
            </div>
          </div>
        ))}

        <div className="tabs">
          {[['upcoming','Upcoming'],['live','Live'],['ended','Recordings'],['all','All']].map(([k,l]) => (
            <button key={k} className={`tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {loading ? <div className="loader"><div className="spinner" /></div> : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎥</div>
            <div className="empty-state-title">No classes here</div>
            <div>{isTeacher ? 'Schedule your first class!' : 'No classes in this category yet'}</div>
          </div>
        ) : (
          <div className="grid-2">
            {filtered.map(c => (
              <div key={c._id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, cursor: 'pointer', transition: '0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                onClick={() => setSelected(c)}>
                <div className="flex items-start justify-between mb-8">
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${colorForSubject(c.subject)}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎓</div>
                  <span className={`tag ${c.status === 'live' ? 'tag-red' : c.status === 'ended' ? 'tag-gray' : 'tag-green'}`}>
                    {c.status === 'live' ? '🔴 Live' : c.status === 'ended' ? 'Ended' : 'Scheduled'}
                  </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>{c.subject} · {c.teacher?.name}</div>
                <div className="flex gap-8 flex-wrap">
                  <span className="tag tag-blue">🕐 {new Date(c.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {new Date(c.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="tag tag-purple">⏱ {c.duration}m</span>
                  <span className="tag tag-amber">👥 {c.students?.length || 0}</span>
                </div>
                {c.status === 'live' && (
                  <button className="btn btn-success btn-sm w-full mt-12" onClick={e => { e.stopPropagation(); setSelected(c); }}>🎥 Join Now</button>
                )}
                {c.status === 'ended' && c.recordingUrl && (
                  <a href={c.recordingUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm w-full mt-12" style={{ display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>▶ Watch Recording</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showNew && <NewClassModal onClose={() => setShowNew(false)} onAdd={c => setClasses(p => [c, ...p])} />}
      {showJoin && <JoinByCodeModal onClose={() => setShowJoin(false)} onJoined={() => fetch()} />}
      {selected && <ClassDetailModal cls={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} isTeacher={isTeacher} />}
    </div>
  );
}
