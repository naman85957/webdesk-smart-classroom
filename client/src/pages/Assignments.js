import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

function NewAssignmentModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', description: '', subject: '', dueDate: '', maxMarks: 100, priority: 'medium', allowLateSubmission: false });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('attachment', file);
      const res = await api.post('/assignments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onAdd(res.data);
      toast.success('Assignment created!');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><div className="modal-title">New Assignment</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" required placeholder="e.g. BST Implementation" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Subject</label><input className="form-input" required placeholder="Data Structures" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Instructions</label><textarea className="form-input" rows={3} required placeholder="Detailed instructions..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group"><label className="form-label">Due Date</label><input type="datetime-local" className="form-input" required value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Max Marks</label><input type="number" className="form-input" value={form.maxMarks} onChange={e => setForm(f => ({ ...f, maxMarks: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Priority</label>
            <select className="form-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Attachment (optional)</label>
            <div className="upload-area" onClick={() => document.getElementById('asgn-attach').click()}>
              <div className="upload-area-icon">📎</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{file ? file.name : 'Attach reference file'}</div>
            </div>
            <input id="asgn-attach" type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
          </div>
          <div className="flex gap-8">
            <button type="button" className="btn btn-outline btn-block" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? '...' : 'Assign to Class'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitModal({ assignment, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('note', note);
      if (file) fd.append('file', file);
      const res = await api.post(`/assignments/${assignment._id}/submit`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSubmit(res.data);
      toast.success('Assignment submitted!');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><div className="modal-title">Submit Assignment</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14, marginBottom: 20 }}>
          <div style={{ fontWeight: 700 }}>{assignment.title}</div>
          <div className="text-sm text-muted mt-4">{assignment.subject} · Due: {new Date(assignment.dueDate).toLocaleString('en-IN')}</div>
        </div>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Note to teacher (optional)</label><textarea className="form-input" rows={3} placeholder="Any comments..." value={note} onChange={e => setNote(e.target.value)} /></div>
          <div className="form-group">
            <label className="form-label">Upload your work</label>
            <div className="upload-area" onClick={() => document.getElementById('sub-file').click()}>
              <div className="upload-area-icon">📁</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{file ? file.name : 'Click to select file'}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>PDF, ZIP, code files accepted</div>
            </div>
            <input id="sub-file" type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
          </div>
          <div className="flex gap-8">
            <button type="button" className="btn btn-outline btn-block" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success btn-block" disabled={loading}>{loading ? '...' : '✓ Submit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GradeModal({ submission, assignmentId, onClose, onGraded }) {
  const [grade, setGrade] = useState(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/assignments/${assignmentId}/grade/${submission.student._id}`, { grade, feedback });
      onGraded();
      toast.success('Graded!');
      onClose();
    } catch { toast.error('Grading failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><div className="modal-title">Grade Submission</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <div style={{ fontWeight: 600 }}>{submission.student?.name}</div>
          <div className="text-sm text-muted">Submitted: {new Date(submission.submittedAt).toLocaleString()}</div>
          {submission.note && <div className="text-sm mt-4" style={{ color: 'var(--text2)' }}>Note: {submission.note}</div>}
          {submission.fileUrl && <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm mt-8">↓ Download submission</a>}
        </div>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Grade</label><input type="number" className="form-input" required value={grade} onChange={e => setGrade(e.target.value)} placeholder="Score" /></div>
          <div className="form-group"><label className="form-label">Feedback</label><textarea className="form-input" rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Comments to student..." /></div>
          <div className="flex gap-8">
            <button type="button" className="btn btn-outline btn-block" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? '...' : '✓ Save Grade'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [showNew, setShowNew] = useState(false);
  const [submitModal, setSubmitModal] = useState(null);
  const [gradeModal, setGradeModal] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const res = await api.get('/assignments'); setAssignments(res.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const mySubmission = a => a.submissions?.find(s => s.student?._id === user?._id || s.student === user?._id);
  const isTeacher = user?.role === 'teacher';

  const filtered = assignments.filter(a => {
    if (isTeacher) return true;
    const sub = mySubmission(a);
    if (tab === 'pending') return !sub;
    if (tab === 'submitted') return sub && sub.status !== 'graded';
    if (tab === 'graded') return sub && sub.status === 'graded';
    return true;
  });

  const getDueDiff = (date) => {
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Assignments</div>
          <div className="page-sub">{isTeacher ? `${assignments.length} total assignments` : `${assignments.filter(a => !mySubmission(a)).length} pending · ${assignments.filter(a => mySubmission(a)?.status === 'graded').length} graded`}</div>
        </div>
        {isTeacher && <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ New Assignment</button>}
      </div>

      <div className="page-content">
        {!isTeacher && (
          <div className="tabs">
            {[['pending','Pending'],['submitted','Submitted'],['graded','Graded'],['all','All']].map(([k,l]) => (
              <button key={k} className={`tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
        )}

        {loading ? <div className="loader"><div className="spinner" /></div> : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No assignments here</div>
          </div>
        ) : filtered.map(a => {
          const sub = mySubmission(a);
          const diff = getDueDiff(a.dueDate);
          const isOverdue = diff < 0;
          const isOpen = expanded === a._id;

          return (
            <div key={a._id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }} onClick={() => setExpanded(isOpen ? null : a._id)}>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-8 mb-4 flex-wrap">
                    <span className={`tag ${a.priority === 'high' ? 'tag-red' : a.priority === 'medium' ? 'tag-amber' : 'tag-blue'}`}>{a.priority}</span>
                    <span className={`tag ${isOverdue ? 'tag-red' : diff <= 2 ? 'tag-amber' : 'tag-green'}`}>{isOverdue ? 'Overdue' : diff === 0 ? 'Due today' : `${diff}d left`}</span>
                    {sub && <span className={`tag ${sub.status === 'graded' ? 'tag-green' : 'tag-purple'}`}>{sub.status === 'graded' ? `✓ ${sub.grade}/${a.maxMarks}` : '✓ Submitted'}</span>}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>{a.subject} · {a.assignedBy?.name} · Due: {new Date(a.dueDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                </div>
                <span style={{ color: 'var(--text3)', fontSize: 18 }}>{isOpen ? '▲' : '▼'}</span>
              </div>

              {isOpen && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ paddingTop: 16, fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{a.description}</div>
                  {a.attachmentUrl && <a href={a.attachmentUrl} download className="btn btn-outline btn-sm mt-12" style={{ display: 'inline-flex' }}>📎 Download Attachment</a>}

                  {isTeacher ? (
                    <div className="mt-20">
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Submissions ({a.submissions?.length || 0})</div>
                      {a.submissions?.length === 0 ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>No submissions yet</div> : (
                        <div style={{ display: 'grid', gap: 8 }}>
                          {a.submissions.map((s, i) => (
                            <div key={i} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.student?.name || 'Student'}</div>
                                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(s.submittedAt).toLocaleString()} · {s.status}</div>
                              </div>
                              {s.grade !== null && s.grade !== undefined && <span className="tag tag-green">{s.grade}/{a.maxMarks}</span>}
                              <button className="btn btn-outline btn-sm" onClick={() => setGradeModal({ submission: s, assignmentId: a._id })}>
                                {s.status === 'graded' ? 'Edit Grade' : 'Grade'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-8 mt-16">
                      {!sub ? (
                        <button className="btn btn-primary" onClick={() => setSubmitModal(a)}>📤 Submit Assignment</button>
                      ) : (
                        <div>
                          <div style={{ color: 'var(--accent3)', fontWeight: 600, fontSize: 13 }}>✓ Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</div>
                          {sub.feedback && <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, fontSize: 13 }}><strong>Feedback:</strong> {sub.feedback}</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showNew && <NewAssignmentModal onClose={() => setShowNew(false)} onAdd={a => { setAssignments(p => [a, ...p]); }} />}
      {submitModal && <SubmitModal assignment={submitModal} onClose={() => setSubmitModal(null)} onSubmit={updated => { setAssignments(p => p.map(a => a._id === updated._id ? updated : a)); }} />}
      {gradeModal && <GradeModal {...gradeModal} onClose={() => setGradeModal(null)} onGraded={fetch} />}
    </div>
  );
}
