import { useAuth } from '../../context/AuthContext';

const ROLE_BADGES = {
  participant: { label: 'Student', cls: 'bg-blue-500/20 text-blue-200 border-blue-400/30' },
  organizer:   { label: 'Organizer', cls: 'bg-purple-500/20 text-purple-200 border-purple-400/30' },
  admin:       { label: 'Administrator', cls: 'bg-amber-500/20 text-amber-200 border-amber-400/30' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function WelcomeBanner({ subtitle, children }) {
  const { user } = useAuth();
  const badge = ROLE_BADGES[user?.role] || ROLE_BADGES.participant;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-hero-gradient p-6 sm:p-8 text-white">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-white/5 blur-xl" />

      <div className="relative flex flex-wrap items-center gap-4">
        {/* Avatar */}
        <span className="h-14 w-14 shrink-0 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center text-2xl font-bold ring-2 ring-white/30">
          {user?.fullName?.[0]?.toUpperCase() || 'U'}
        </span>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold leading-tight truncate">
            {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-white/70 mt-1">
            {subtitle || 'Here\'s your dashboard overview'}
          </p>
        </div>

        {/* Role badge */}
        <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      {children && <div className="relative mt-4">{children}</div>}
    </div>
  );
}
