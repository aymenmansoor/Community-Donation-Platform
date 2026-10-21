import StatusBadge from '../StatusBadge';
export default function AdminTables({ tab, items, updateUser, moderate }) {
  return <div className="table-responsive"><table className="table table-hover align-middle mb-0">
    <thead className="table-success"><tr>{({ users: ['Name / email','Role','Status','Action'], donations: ['Item / category','Donor','Visibility','Moderation'], requests: ['Item','Requester / reason','Status','Created'], audit: ['Event','Administrator / actor','Outcome','Date'] }[tab]).map(label => <th key={label}>{label}</th>)}</tr></thead>
    <tbody>{items.map(item => <tr key={item._id}>
      {tab === 'users' && <><td><strong>{item.fullName}</strong><div className="text-muted small">{item.email}</div></td><td>{item.role}</td><td><StatusBadge value={item.status || 'active'} /></td><td>{item.role !== 'Admin' && <button className={`btn btn-sm btn-outline-${item.status === 'suspended' ? 'success' : 'danger'} rounded-pill`} onClick={() => updateUser(item)}>{item.status === 'suspended' ? 'Reactivate' : 'Suspend'}</button>}</td></>}
      {tab === 'donations' && <><td><strong>{item.itemName}</strong><div className="small text-muted">{item.category}</div></td><td>{item.donorEmail}</td><td><StatusBadge value={item.moderationStatus || 'published'} /></td><td><button className="btn btn-sm btn-outline-success rounded-pill" onClick={() => moderate(item)}>{item.moderationStatus === 'hidden' ? 'Restore' : 'Hide listing'}</button>{item.moderationReason && <div className="small text-muted mt-1">{item.moderationReason}</div>}</td></>}
      {tab === 'requests' && <><td>{item.itemId?.itemName || 'Removed item'}</td><td><strong>{item.requesterName}</strong><div className="small text-muted">{item.reason}</div></td><td><StatusBadge value={item.status} /></td><td>{new Date(item.createdAt).toLocaleDateString()}</td></>}
      {tab === 'audit' && <><td>{item.action}</td><td>{item.actor?.fullName || 'System / signed-out visitor'}</td><td><StatusBadge value={item.outcome} /></td><td>{new Date(item.createdAt).toLocaleString()}</td></>}
    </tr>)}</tbody></table>{!items.length && <p className="p-4 mb-0 text-muted">No matching records.</p>}</div>;
}
