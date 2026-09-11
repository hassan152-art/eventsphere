const MAP = {
  Upcoming: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  Ongoing: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Completed: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  Cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
  'Pending Approval': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
  'Changes Requested': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Waitlisted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${MAP[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}
