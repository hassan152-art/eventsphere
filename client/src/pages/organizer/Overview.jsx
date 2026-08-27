import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock, ListChecks, Users, CheckCircle2, Star,
  CalendarPlus, QrCode, Award, BarChart3, ArrowRight, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import { organizerService } from '../../services/userService';
import { eventService } from '../../services/eventService';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import StatsGrid from '../../components/dashboard/StatsGrid';
import QuickActions from '../../components/dashboard/QuickActions';
import StatusBadge from '../../components/events/StatusBadge';

const QUICK_ACTIONS = [
  { to: '/organizer/create',        icon: CalendarPlus, label: 'Create Event',   desc: 'New event submission', tint: 'brand' },
  { to: '/organizer/registrations',  icon: Users,        label: 'Registrations',  desc: 'Manage signups',       tint: 'emerald' },
  { to: '/organizer/attendance',     icon: QrCode,       label: 'Scan QR',        desc: 'Check-in attendees',   tint: 'purple' },
  { to: '/organizer/certificates',   icon: Award,        label: 'Certificates',   desc: 'Issue bulk certs',     tint: 'amber' },
];

const DONUT_COLORS = ['#10B981', '#6d5df5'];

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      organizerService.dashboard(),
      eventService.list({ mine: true, limit: 5 }),
    ])
      .then(([dash, evts]) => {
        setStats(dash.data.stats);
        setCharts(dash.data.charts);
        setRecentEvents(evts.data.events);
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { icon: ListChecks,   label: 'Total Events',     value: stats.totalEvents,        tint: 'brand' },
        { icon: CalendarClock, label: 'Upcoming',         value: stats.upcomingEvents,     tint: 'purple' },
        { icon: Users,         label: 'Registrations',    value: stats.totalRegistrations, tint: 'sky' },
        { icon: CheckCircle2,  label: 'Attendance Rate',  value: `${stats.attendanceRate}%`, tint: 'emerald' },
        { icon: Star,          label: 'Avg Rating',       value: stats.averageRating || '—', tint: 'amber' },
      ]
    : [];

  /* Attendance donut data */
  const donutData = stats && stats.totalRegistrations > 0
    ? [
        { name: 'Attended', value: Math.round(stats.totalRegistrations * stats.attendanceRate / 100) },
        { name: 'Not attended', value: stats.totalRegistrations - Math.round(stats.totalRegistrations * stats.attendanceRate / 100) },
      ]
    : [];

  /* Events pending approval */
  const pendingEvents = recentEvents.filter((e) => e.status === 'Pending Approval');

  return (
    <div className="space-y-6">
      {/* ── Welcome ─────────────────────────────── */}
      <WelcomeBanner subtitle="Manage your events and track performance" />

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

      {/* ── Quick Actions ────────────────────────── */}
      <QuickActions actions={QUICK_ACTIONS} />

      {/* ── Pending Approval Notice ──────────────── */}
      {pendingEvents.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {pendingEvents.length} event{pendingEvents.length > 1 ? 's' : ''} awaiting admin approval
            </p>
            <div className="mt-2 space-y-1">
              {pendingEvents.map((e) => (
                <p key={e._id} className="text-xs text-amber-700 dark:text-amber-400">• {e.title}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Charts ───────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Registration Trends */}
        <div className="card p-5">
          <h2 className="font-bold mb-4">Registration Trends</h2>
          {charts?.registrationTrends?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.registrationTrends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="event" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="registrations" fill="#6d5df5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-400">No data yet.</p>}
        </div>

        {/* Attendance Donut */}
        <div className="card p-5">
          <h2 className="font-bold mb-4">Attendance Breakdown</h2>
          {donutData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} label>
                    {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-sm">Attended ({donutData[0].value})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-brand-500" />
                  <span className="text-sm">Not attended ({donutData[1].value})</span>
                </div>
                <p className="text-2xl font-extrabold text-emerald-600">{stats?.attendanceRate}%</p>
                <p className="text-xs text-slate-400">Overall rate</p>
              </div>
            </div>
          ) : <p className="text-sm text-slate-400">No attendance data yet.</p>}
        </div>
      </div>

      {/* ── Recent Events ────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Recent Events</h2>
          <Link to="/organizer/events" className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <p className="text-sm text-slate-400">No events created yet.</p>
        ) : (
          <div className="space-y-2">
            {recentEvents.map((e) => (
              <div key={e._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 grid place-items-center shrink-0">
                    <ListChecks size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{e.title}</p>
                    <p className="text-xs text-slate-500">{new Date(e.date).toDateString()} · {e.registrationCount} registered</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={e.status} />
                  <StatusBadge status={e.computedStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
