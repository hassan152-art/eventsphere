import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, CalendarClock, CheckCircle2, Award, Bookmark,
  Compass, QrCode, MessageSquare, Clock, ArrowRight,
} from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import StatsGrid from '../../components/dashboard/StatsGrid';
import QuickActions from '../../components/dashboard/QuickActions';
import StatusBadge from '../../components/events/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

const QUICK_ACTIONS = [
  { to: '/dashboard/discover',      icon: Compass,       label: 'Discover Events', desc: 'Browse & register',  tint: 'brand' },
  { to: '/dashboard/attendance',     icon: QrCode,        label: 'QR Pass',         desc: 'View your passes',   tint: 'emerald' },
  { to: '/dashboard/certificates',   icon: Award,         label: 'Certificates',    desc: 'Download certs',     tint: 'amber' },
  { to: '/dashboard/feedback',       icon: MessageSquare, label: 'Give Feedback',   desc: 'Rate past events',   tint: 'purple' },
];

function daysUntil(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${diff} days`;
}

export default function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.dashboard()
      .then(({ data }) => { setStats(data.stats); setUpcoming(data.upcoming); })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { icon: ClipboardList, label: 'Registered',  value: stats.registeredEvents, tint: 'brand' },
        { icon: CalendarClock, label: 'Upcoming',     value: stats.upcomingEvents,   tint: 'purple' },
        { icon: CheckCircle2,  label: 'Attended',     value: stats.attendedEvents,   tint: 'emerald' },
        { icon: Award,         label: 'Certificates', value: stats.certificates,     tint: 'amber' },
        { icon: Bookmark,      label: 'Saved',        value: stats.savedEvents,      tint: 'sky' },
      ]
    : [];

  /* Progress pipeline percentages */
  const pipeline = stats && stats.registeredEvents > 0
    ? {
        registered: stats.registeredEvents,
        attended:   stats.attendedEvents,
        certified:  stats.certificates,
        attendPct:  Math.round((stats.attendedEvents / stats.registeredEvents) * 100),
        certPct:    stats.attendedEvents ? Math.round((stats.certificates / stats.attendedEvents) * 100) : 0,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* ── Welcome ─────────────────────────────── */}
      <WelcomeBanner subtitle="Here's what's happening with your events" />

      {/* ── Stats ────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-5 h-[88px] animate-pulse bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      ) : stats && (
        <StatsGrid stats={statCards} cols={5} />
      )}

      {/* ── Quick actions ────────────────────────── */}
      <QuickActions actions={QUICK_ACTIONS} />

      {/* ── Progress Pipeline ────────────────────── */}
      {pipeline && (
        <div className="card p-5">
          <h2 className="font-bold mb-4">Your Progress Pipeline</h2>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Registered */}
            <div className="text-center min-w-[80px]">
              <p className="text-2xl font-extrabold text-brand-600">{pipeline.registered}</p>
              <p className="text-xs text-slate-500">Registered</p>
            </div>

            <ArrowRight size={18} className="text-slate-300 shrink-0" />

            {/* Attended */}
            <div className="text-center min-w-[80px]">
              <p className="text-2xl font-extrabold text-emerald-600">{pipeline.attended}</p>
              <p className="text-xs text-slate-500">Attended</p>
              <p className="text-[10px] text-emerald-500 font-semibold">{pipeline.attendPct}% rate</p>
            </div>

            <ArrowRight size={18} className="text-slate-300 shrink-0" />

            {/* Certified */}
            <div className="text-center min-w-[80px]">
              <p className="text-2xl font-extrabold text-amber-600">{pipeline.certified}</p>
              <p className="text-xs text-slate-500">Certified</p>
              <p className="text-[10px] text-amber-500 font-semibold">{pipeline.certPct}% rate</p>
            </div>

            {/* Visual progress bar */}
            <div className="flex-1 min-w-[120px] hidden sm:block">
              <div className="h-3 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden flex">
                <div className="h-full bg-brand-500 transition-all" style={{ width: '100%' }} />
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden flex mt-1.5">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pipeline.attendPct}%` }} />
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden flex mt-1.5">
                <div className="h-full bg-amber-500 transition-all" style={{ width: `${pipeline.certPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Upcoming events ──────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Upcoming Events</h2>
          <Link to="/dashboard/registrations" className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse bg-slate-50 dark:bg-white/5" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            title="Nothing on your calendar yet"
            description="Discover events happening around campus and register."
            actionLabel="Discover Events"
            actionTo="/dashboard/discover"
          />
        ) : (
          <div className="space-y-2">
            {upcoming.map((r) => (
              <div key={r._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 grid place-items-center shrink-0">
                    <CalendarClock size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{r.event?.title}</p>
                    <p className="text-xs text-slate-500">{new Date(r.event?.date).toDateString()} · {r.event?.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-full">
                    <Clock size={12} />
                    {daysUntil(r.event?.date)}
                  </span>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
