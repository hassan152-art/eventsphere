import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo }) {
  return (
    <div className="text-center py-16 px-4">
      {Icon && (
        <div className="mx-auto h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30 grid place-items-center mb-4">
          <Icon size={26} className="text-brand-500" />
        </div>
      )}
      <h3 className="font-semibold text-lg">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-5 inline-flex">{actionLabel}</Link>
      )}
    </div>
  );
}
