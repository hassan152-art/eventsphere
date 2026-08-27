import DashboardCard from './DashboardCard';

/**
 * StatsGrid — renders an array of stat objects as DashboardCards in a responsive grid.
 *
 * @param {{ stats: Array<{ icon, label, value, tint?, change? }>, cols?: number }} props
 */
export default function StatsGrid({ stats, cols = 4 }) {
  const colClass = {
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 lg:grid-cols-5',
  }[cols] || 'grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${colClass} gap-4`}>
      {stats.map((s, i) => (
        <DashboardCard
          key={i}
          icon={s.icon}
          label={s.label}
          value={s.value}
          tint={s.tint || 'brand'}
          change={s.change}
        />
      ))}
    </div>
  );
}
