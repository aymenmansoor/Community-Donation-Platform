import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import AdminTables from '../components/admin/AdminTables';
export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [data, setData] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [moderation, setModeration] = useState(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (tab === 'overview') setStats((await api.get('/api/admin/stats')).data);
      else setData((await api.get(`/api/admin/${tab}`, { params: { page, ...(tab === 'users' ? { search: query } : {}) } })).data);
    } catch (e) { setError(e.response?.data?.message || 'Unable to load administration data.'); }
    finally { setLoading(false); }
  }, [tab, page, query]);
  useEffect(() => { load(); }, [load]);
  const updateUser = async user => {
    if (!window.confirm(`${user.status === 'suspended' ? 'Reactivate' : 'Suspend'} ${user.fullName}? Existing sessions will be revoked.`)) return;
    try { await api.patch(`/api/admin/users/${user._id}`, { status: user.status === 'suspended' ? 'active' : 'suspended' }); await load(); }
    catch (e) { setError(e.response?.data?.message || 'Account update failed.'); }
  };
  const submitModeration = async event => {
    event.preventDefault(); setSaving(true);
    try { await api.patch(`/api/admin/donations/${moderation._id}`, { moderationStatus: moderation.moderationStatus === 'hidden' ? 'published' : 'hidden', reason }); setModeration(null); setReason(''); await load(); }
    catch (e) { setError(e.response?.data?.message || 'Moderation failed.'); }
    finally { setSaving(false); }
  };
  return <section className="py-4 text-start">
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"><div><p className="text-success fw-bold mb-1">Platform administration</p><h1 className="text-success fw-bold">Community overview</h1><p className="text-muted mb-0">Support members, moderate listings and review community activity.</p></div><button onClick={load} className="btn btn-outline-success rounded-pill">Refresh</button></div>
    <nav aria-label="Administration sections" className="d-flex flex-wrap gap-2 mb-4">{['overview','users','donations','requests','audit'].map(name => <button key={name} className={`btn rounded-pill text-capitalize ${tab === name ? 'btn-success' : 'btn-outline-success'}`} onClick={() => { setTab(name); setPage(1); setQuery(''); setSearch(''); }}>{name === 'audit' ? 'Audit log' : name}</button>)}</nav>
    {error && <div role="alert" className="alert alert-danger">{error}</div>}
    {tab === 'users' && <form className="d-flex gap-2 mb-3" onSubmit={e => { e.preventDefault(); setPage(1); setQuery(search); }}><label className="visually-hidden" htmlFor="user-search">Search users</label><input id="user-search" className="form-control" placeholder="Search by name or email" maxLength={100} value={search} onChange={e => setSearch(e.target.value)} /><button className="btn btn-success">Search</button></form>}
    {loading ? <p role="status">Loading administration data…</p> : tab === 'overview' && stats ? <>
      <div className="row g-3">{['users','donors','requesters','donations','requests','suspended'].map(key => <div className="col-6 col-lg-4" key={key}><div className="card border-0 rounded-4 shadow-sm p-4 h-100"><span className="text-muted text-capitalize">{key === 'users' ? 'Total users' : key}</span><strong className="display-5 text-success">{stats[key]}</strong></div></div>)}</div>
      <div className="row g-3 mt-1">{[['Donation categories',stats.categories],['Request status',stats.statuses]].map(([label, rows]) => <div key={label} className="col-md-6"><div className="card rounded-4 border-0 shadow-sm p-4"><h2 className="h5 text-success">{label}</h2>{rows.map(row => <div className="d-flex justify-content-between border-bottom py-2" key={row._id}><span>{row._id}</span><strong>{row.count}</strong></div>)}</div></div>)}</div>
    </> : tab !== 'overview' && <div className="card border-0 rounded-4 shadow-sm overflow-hidden"><AdminTables tab={tab} items={data.items} updateUser={updateUser} moderate={item => { setModeration(item); setReason(''); }} /><div className="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 border-top"><span className="small text-muted">{data.total} records · Page {data.page} of {data.pages}</span><div className="d-flex gap-2"><button className="btn btn-sm btn-outline-success" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><button className="btn btn-sm btn-outline-success" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button></div></div></div>}
    {moderation && <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="moderation-title" style={{background:'rgba(0,0,0,.45)'}}><div className="modal-dialog modal-dialog-centered"><form onSubmit={submitModeration} className="modal-content rounded-4 border-0 p-4"><h2 id="moderation-title" className="h4 text-success">{moderation.moderationStatus === 'hidden' ? 'Restore' : 'Hide'} {moderation.itemName}</h2><label htmlFor="moderation-reason" className="form-label">Moderation reason</label><textarea autoFocus id="moderation-reason" required maxLength={500} className="form-control" value={reason} onChange={e => setReason(e.target.value)} /><div className="d-flex gap-2 justify-content-end mt-3"><button type="button" className="btn btn-light" onClick={() => setModeration(null)}>Cancel</button><button disabled={saving} className="btn btn-success">Save moderation</button></div></form></div></div>}
  </section>;
}
