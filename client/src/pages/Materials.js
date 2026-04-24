import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const typeIcon = { pdf: '📄', video: '🎥', notes: '📝', presentation: '📊', link: '🔗', other: '📁' };
const typeColor = { pdf: 'tag-blue', video: 'tag-purple', notes: 'tag-amber', presentation: 'tag-green', link: 'tag-green', other: 'tag-gray' };

function UploadModal({ onClose, onUpload }) {
  const [form, setForm] = useState({ title: '', description: '', subject: '', type: 'pdf', externalLink: '', tags: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, k === 'tags' ? JSON.stringify(v.split(',').map(t => t.trim()).filter(Boolean)) : v));
      if (file) fd.append('file', file);
      const res = await api.post('/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUpload(res.data);
      toast.success('Material uploaded!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Upload Study Material</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" required placeholder="e.g. Week 8 Notes - Binary Trees" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group"><label className="form-label">Subject</label><input className="form-input" required placeholder="Data Structures" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {Object.keys(typeIcon).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={2} placeholder="Brief description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          {form.type === 'link' ? (
            <div className="form-group"><label className="form-label">External Link</label><input className="form-input" type="url" placeholder="https://..." value={form.externalLink} onChange={e => setForm(f => ({ ...f, externalLink: e.target.value }))} /></div>
          ) : (
            <div className="form-group">
              <label className="form-label">File</label>
              <div className="upload-area" onClick={() => document.getElementById('mat-file').click()}>
                <div className="upload-area-icon">☁️</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{file ? file.name : 'Click to select file'}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>PDF, MP4, PPTX, DOCX up to 100MB</div>
              </div>
              <input id="mat-file" type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
            </div>
          )}
          <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-input" placeholder="Trees, Algorithms, Sorting" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} /></div>
          <div className="flex gap-8 mt-16">
            <button type="button" className="btn btn-outline btn-block" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? '...' : '↑ Upload'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Materials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterType) params.type = filterType;
      if (filterSubject) params.subject = filterSubject;
      const res = await api.get('/materials', { params });
      setMaterials(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMaterials(); }, [search, filterType, filterSubject]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await api.delete(`/materials/${id}`);
      setMaterials(m => m.filter(x => x._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const subjects = [...new Set(materials.map(m => m.subject))];
  const formatSize = bytes => bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : bytes > 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${bytes} B`;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Study Materials</div>
          <div className="page-sub">{materials.length} resources available</div>
        </div>
        {user?.role === 'teacher' && (
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}>+ Upload Material</button>
        )}
      </div>

      <div className="page-content">
        <div className="flex gap-12 mb-20 flex-wrap">
          <div className="search-bar flex-1" style={{ minWidth: 200 }}>
            <span className="search-bar-icon">🔍</span>
            <input className="form-input" placeholder="Search materials..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" style={{ width: 150 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {Object.keys(typeIcon).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select className="form-input" style={{ width: 180 }} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? <div className="loader"><div className="spinner" /></div> : materials.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-title">No materials found</div>
            <div>{user?.role === 'teacher' ? 'Upload the first material!' : 'No materials have been uploaded yet'}</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {materials.map(m => (
              <div key={m._id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 14, transition: '0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ width: 46, height: 46, borderRadius: 10, background: m.type === 'pdf' ? 'rgba(79,142,247,0.15)' : m.type === 'video' ? 'rgba(124,58,237,0.15)' : 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {typeIcon[m.type] || '📁'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>{m.subject} · By {m.uploadedBy?.name} · {new Date(m.createdAt).toLocaleDateString()}</div>
                  {m.tags?.length > 0 && <div className="flex gap-4 mt-4 flex-wrap">{m.tags.slice(0, 4).map(t => <span key={t} className="tag tag-gray" style={{ fontSize: 10 }}>#{t}</span>)}</div>}
                </div>
                <div className="flex items-center gap-8">
                  <span className={`tag ${typeColor[m.type] || 'tag-gray'}`}>{m.type.toUpperCase()}</span>
                  {m.fileSize > 0 && <span style={{ fontSize: 12, color: 'var(--text3)', minWidth: 52, textAlign: 'right' }}>{formatSize(m.fileSize)}</span>}
                  {m.type === 'link' ? (
                    <a href={m.externalLink} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Open ↗</a>
                  ) : m.fileUrl ? (
                    <a href={m.fileUrl} download className="btn btn-outline btn-sm" onClick={() => api.put(`/materials/${m._id}/download`)}>↓ Download</a>
                  ) : null}
                  {user?.role === 'teacher' && user?._id === m.uploadedBy?._id && (
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(m._id)} style={{ color: 'var(--danger)' }}>🗑</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={m => setMaterials(prev => [m, ...prev])} />}
    </div>
  );
}
