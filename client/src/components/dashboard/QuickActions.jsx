import { Link } from 'react-router-dom';

/**
 * QuickActions — a grid of action cards.
 *
 * @param {{ actions: Array<{ to: string; icon: React.ElementType; label: string; desc: string; tint?: string }> }} props
 */

const TINTS = {
  brand:   'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  amber:   'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  purple:  'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
  rose:    'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
  sky:     'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
};

export default function QuickActions({ title = 'Quick Actions', actions }) {
  return (
    <div>
      <h2 className="font-bold mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="card p-4 group hover:shadow-soft transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className={`h-10 w-10 rounded-xl grid place-items-center mb-3 ${TINTS[a.tint] || TINTS.brand}`}>
              <a.icon size={18} />
            </div>
            <p className="text-sm font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
              {a.label}
            </p>
            {a.desc && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{a.desc}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
