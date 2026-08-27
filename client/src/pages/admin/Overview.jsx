import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ListChecks, ClipboardCheck, CheckCircle2, ClipboardList,
  Shield, BarChart3, Megaphone, ArrowRight, UserCheck, UserX,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { adminService } from '../../services/userService';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import StatsGrid from '../../components/dashboard/StatsGrid';
import QuickActions from '../../components/dashboard/QuickActions';
import DashboardCard from '../../components/dashboard/DashboardCard';

const COLORS = ['#6d5df5', '#a855f7', '#10B981', '#F59E0B', '#EF4444', '#3b82f6', '#ec4899', '#14b8a6'];
const ROLE_COLORS = ['#3b82f6', '#a855f7', '#f59e0b'];

const QUICK_ACTIONS = [
  { to: '/admin/users',          icon: Users,          label: 'Manage Users',     desc: 'Roles & status',       tint: 'brand' },
  { to: '/admin/pending',        icon: ClipboardCheck, label: 'Approvals',        desc: 'Pending events',       tint: 'amber' },
  { to: '/admin/announcements',  icon: Megaphone,      label: 'Announcements',    desc: 'Publish updates',      tint: 'purple' },
  { to: '/admin/reports',        icon: BarChart3,      label: 'Reports',          desc: 'Download Excel',       tint: 'emerald' },
];

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.dashboard()
      .then(({ data }) => { setStats(data.stats); setCharts(data.charts); })
      .finally(() => setLoading(false));
  }, []);

  /* Main stat cards */
  const mainStats = stats
    ? [
        { icon: Users,          label: 'Total Users',        value: stats.totalUsers,          tint: 'brand' },
        { icon: ListChecks,     label: 'Total Events',       value: stats.totalEvents,         tint: 'purple' },
        { icon: ClipboardCheck, label: 'Pending Approvals',  value: stats.pendingEvents,       tint: 'amber' },
        { icon: CheckCircle2,   label: 'Attendance Rate',    value: `${stats.attendanceRate}%`, tint: 'emerald' },
      ]
    : [];

  /* Secondary stat cards */
  const secondaryStats = stats
    ? [
        { icon: UserCheck,     label: 'Students',       value: stats.students,            tint: 'sky' },
        { icon: Shield,        label: 'Organizers',     value: stats.organizers,          tint: 'purple' },
        { icon: ClipboardList, label: 'Registrations',  value: stats.totalRegistrations,  tint: 'emerald' },
      ]
    : [];

  /* Role distribution for pie */
  const roleData = stats
    ? [
        { name: 'Students', value: stats.students },
        { name: 'Organizers', value: stats.organizers },
        { name: 'Admins', value: stats.admins },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* ── Welcome ─────────────────────────────── */}
      <WelcomeBanner subtitle="System overview and administration tools" />

      {/* ── Primary Stats ────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 h-[88px] animate-pulse bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      ) : stats && (
        <StatsGrid stats={mainStats} cols={4} />
      )}

      {/* ── Secondary Stats ──────────────────────── */}
      {stats && <StatsGrid stats={secondaryStats} cols={3} />}

      {/* ── Quick Actions ────────────────────────── */}
      <QuickActions actions={QUICK_ACTIONS} />

      {/* ── Pending Approvals Preview ────────────── */}
      {stats && stats.pendingEvents > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 grid place-items-center">
              <ClipboardCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {stats.pendingEvents} event{stats.pendingEvents > 1 ? 's' : ''} awaiting your approval
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Review and approve submitted events</p>
            </div>
          </div>
          <Link to="/admin/pending" className="btn-primary !py-2 !px-4 text-xs shrink-0">
            Review Now
          </Link>
        </div>
      )}

      {/* ── Charts Row 1 ─────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="card p-5">
          <h2 className="font-bold mb-4">User Growth</h2>
          {charts?.userGrowth?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={charts.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6d5df5" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-400">No data yet.</p>}
        </div>

        {/* Event Growth */}
        <div className="card p-5">
          <h2 className="font-bold mb-4">Event Growth</h2>
          {charts?.eventGrowth?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts.eventGrowth}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-400">No data yet.</p>}
        </div>
      </div>

      {/* ── Charts Row 2 ─────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="card p-5">
          <h2 className="font-bold mb-4">Event Category Distribution</h2>
          {charts?.categoryDistribution?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={charts.categoryDistribution} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label>
                  {charts.categoryDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-400">No data yet.</p>}
        </div>

        {/* Role Distribution */}
        <div className="card p-5">
          <h2 className="font-bold mb-4">User Role Distribution</h2>
          {roleData.some((r) => r.value > 0) ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={260}>
                <PieChart>
                  <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4}>
                    {roleData.map((_, i) => <Cell key={i} fill={ROLE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {roleData.map((r, i) => (
                  <div key={r.name} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: ROLE_COLORS[i] }} />
                    <span className="text-sm">{r.name} ({r.value})</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100 dark:border-white/10">
                  <p className="text-lg font-extrabold">{stats?.totalUsers}</p>
                  <p className="text-xs text-slate-400">Total users</p>
                </div>
              </div>
            </div>
          ) : <p className="text-sm text-slate-400">No data yet.</p>}
        </div>
      </div>
    </div>
  );
}
