import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SUBJECTS = ['Data Structures', 'Database Systems', 'Web Development', 'Machine Learning', 'Software Engineering', 'Operating Systems', 'Computer Networks', 'Other'];

function AskDoubtModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ question: '', description: '', subject: '', tags: '' });
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/doubts', { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
      onAdd(res.data);
      toast.success('Doubt posted!');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><div className="modal-title">Ask a Doubt</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Subject</label>
            <select className="form-input" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
              <option value="">Select subject...</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Your Question</label><input className="form-input" required placeholder="Short, clear title for your doubt" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Details (optional)</label><textarea className="form-input" rows={3} placeholder="Describe your doubt in detail, share code or context..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-input" placeholder="e.g. Trees, Recursion, Pointers" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} /></div>
          <div className="flex gap-8 mt-8">
            <button type="button" className="btn btn-outline btn-block" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? '...' : 'Post Doubt'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DoubtDetailModal({ doubt, onClose, onUpdate }) {
  const { user } = useAuth();
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [upvoted, setUpvoted] = useState(doubt.upvotes?.includes(user?._id));
  const [upvoteCount, setUpvoteCount] = useState(doubt.upvotes?.length || 0);

  const submitReply = async e => {
    e.preventDefault();
    if (!reply.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/doubts/${doubt._id}/reply`, { text: reply });
      onUpdate(res.data);
      setReply('');
      toast.success('Reply posted!');
    } catch { toast.error('Failed to post reply'); }
    finally { setLoading(false); }
  };

  const handleUpvote = async () => {
    try {
      const res = await api.put(`/doubts/${doubt._id}/upvote`);
      setUpvoted(u => !u);
      setUpvoteCount(res.data.upvotes);
    } catch { toast.error('Failed'); }
  };

  const subjectColor = (s) => {
    const map = { 'Data Structures': 'tag-blue', 'Database Systems': 'tag-purple', 'Web Development': 'tag-green', 'Machine Learning': 'tag-amber' };
    return map[s] || 'tag-gray';
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div className="flex gap-8 mb-8 flex-wrap">
              <span className={`tag ${subjectColor(doubt.subject)}`}>{doubt.subject}</span>
              <span className={`tag ${doubt.status === 'answered' ? 'tag-green' : 'tag-amber'}`}>
                {doubt.status === 'answered' ? '✓ Answered' : '⏳ Pending'}
              </span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.4 }}>{doubt.question}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="flex items-center gap-12 mb-16">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="avatar avatar-sm">{doubt.askedBy?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{doubt.askedBy?.name}</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(doubt.createdAt).toLocaleDateString()} · {doubt.views || 0} views</span>
          <button onClick={handleUpvote} style={{ background: upvoted ? 'rgba(79,142,247,0.15)' : 'transparent', border: `1px solid ${upvoted ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: upvoted ? 'var(--accent)' : 'var(--text3)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
            ▲ {upvoteCount}
          </button>
        </div>

        {doubt.description && (
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>
            {doubt.description}
          </div>
        )}

        {doubt.tags?.length > 0 && (
          <div className="flex gap-6 flex-wrap mb-20">
            {doubt.tags.map(t => <span key={t} className="tag tag-blue" style={{ fontSize: 11 }}>#{t}</span>)}
          </div>
        )}

        {/* Replies */}
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Replies ({doubt.replies?.length || 0})</div>
        {doubt.replies?.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 13, padding: '16px 0', textAlign: 'center' }}>No replies yet. Be the first to answer!</div>
        ) : (
          <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
            {doubt.replies.map((r, i) => (
              <div key={i} style={{
                borderLeft: r.isTeacher ? '3px solid var(--accent3)' : '3px solid var(--border)',
                padding: '12px 14px', background: r.isTeacher ? 'rgba(16,185,129,0.07)' : 'var(--bg3)', borderRadius: '0 10px 10px 0'
              }}>
                <div className="flex items-center gap-8 mb-8">
                  <div className="avatar avatar-sm" style={{ background: r.isTeacher ? 'linear-gradient(135deg,var(--accent3),var(--accent))' : 'linear-gradient(135deg,var(--accent),var(--accent2))' }}>
                    {r.author?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.author?.name}</span>
                  {r.isTeacher && <span className="tag tag-green" style={{ fontSize: 10 }}>Teacher</span>}
                  <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{r.text}</div>
              </div>
            ))}
          </div>
        )}

        {/* Reply form */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <form onSubmit={submitReply}>
            <textarea className="form-input mb-8" rows={3} placeholder="Write your answer or follow-up question..." value={reply} onChange={e => setReply(e.target.value)} />
            <div className="flex justify-between items-center">
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                {user?.role === 'teacher' ? '🎓 Replying as Teacher' : '💬 Replying as Student'}
              </span>
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !reply.trim()}>
                {loading ? '...' : 'Post Reply'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Doubts() {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showAsk, setShowAsk] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterSubject) params.subject = filterSubject;
      if (tab === 'mine') params.mine = 'true';
      if (tab === 'answered') params.status = 'answered';
      if (tab === 'pending') params.status = 'pending';
      const res = await api.get('/doubts', { params });
      setDoubts(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [tab, search, filterSubject]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doubt?')) return;
    try {
      await api.delete(`/doubts/${id}`);
      setDoubts(d => d.filter(x => x._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const subjectColor = (s) => {
    const map = { 'Data Structures': 'tag-blue', 'Database Systems': 'tag-purple', 'Web Development': 'tag-green', 'Machine Learning': 'tag-amber' };
    return map[s] || 'tag-gray';
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Ask Doubts</div>
          <div className="page-sub">Get answers from teachers & peers</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAsk(true)}>+ Ask a Doubt</button>
      </div>

      <div className="page-content">
        <div className="flex gap-12 mb-16 flex-wrap">
          <div className="search-bar flex-1" style={{ minWidth: 180 }}>
            <span className="search-bar-icon">🔍</span>
            <input className="form-input" placeholder="Search doubts..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" style={{ width: 200 }} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
            <option value="">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="tabs">
          {[['all','All'],['mine','My Doubts'],['answered','Answered'],['pending','Pending']].map(([k,l]) => (
            <button key={k} className={`tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {loading ? <div className="loader"><div className="spinner" /></div> : doubts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">❓</div>
            <div className="empty-state-title">No doubts found</div>
            <div>Be the first to ask a question!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {doubts.map(d => (
              <div key={d._id}
                style={{ background: 'var(--bg2)', border: `1px solid var(--border)`, borderLeft: `3px solid ${d.status === 'answered' ? 'var(--accent3)' : 'var(--accent4)'}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: '0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = d.status === 'answered' ? 'var(--accent3)' : 'var(--accent4)'}
                onMouseLeave={e => e.currentTarget.style.borderTopColor = 'var(--border)'}
                onClick={() => setSelected(d)}>
                <div className="flex items-start justify-between gap-12">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-8 mb-6 flex-wrap">
                      <div className="avatar avatar-sm">{d.askedBy?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{d.askedBy?.name}</span>
                      <span className={`tag ${subjectColor(d.subject)}`}>{d.subject}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>{d.question}</div>
                    <div className="flex gap-8 flex-wrap items-center">
                      {d.tags?.slice(0, 4).map(t => <span key={t} className="tag tag-gray" style={{ fontSize: 10 }}>#{t}</span>)}
                      <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 4 }}>💬 {d.replies?.length || 0} replies · ▲ {d.upvotes?.length || 0} · {d.views || 0} views</span>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-8" style={{ flexShrink: 0 }}>
                    <span className={`tag ${d.status === 'answered' ? 'tag-green' : 'tag-amber'}`} style={{ whiteSpace: 'nowrap' }}>
                      {d.status === 'answered' ? '✓ Answered' : '⏳ Pending'}
                    </span>
                    {(d.askedBy?._id === user?._id || user?.role === 'teacher') && (
                      <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); handleDelete(d._id); }} style={{ color: 'var(--danger)', padding: '3px 8px' }}>🗑</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAsk && <AskDoubtModal onClose={() => setShowAsk(false)} onAdd={d => setDoubts(p => [d, ...p])} />}
      {selected && (
        <DoubtDetailModal
          doubt={selected}
          onClose={() => setSelected(null)}
          onUpdate={updated => {
            setDoubts(p => p.map(d => d._id === updated._id ? updated : d));
            setSelected(updated);
          }}
        />
      )}
    </div>
  );
}
