import { TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardCard({ icon: Icon, label, value, tint = 'brand', change }) {
  const tints = {
    brand:   'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    purple:  'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
    sky:     'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
  };

  const isPositive = change && !change.startsWith('-');

  return (
    <div className="card p-5 flex items-center gap-4 hover:shadow-soft transition-all duration-200 hover:-translate-y-0.5">
      <div className={`h-12 w-12 rounded-xl grid place-items-center shrink-0 ${tints[tint] || tints.brand}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-extrabold leading-none">{value}</p>
          {change && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {change}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}
