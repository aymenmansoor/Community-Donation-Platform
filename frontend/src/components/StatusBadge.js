export default function StatusBadge({ value }) {
  const color = ['Approved','active','published'].includes(value) ? 'success' : ['Rejected','suspended','hidden'].includes(value) ? 'danger' : 'warning text-dark';
  return <span className={`badge rounded-pill bg-${color}`}>{value}</span>;
}
