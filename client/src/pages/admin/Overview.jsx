import { useEffect, useState } from 'react';
import { Users, ListChecks, ClipboardCheck, CheckCircle2, ClipboardList } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { adminService } from '../../services/userService';
import DashboardCard from '../../components/dashboard/DashboardCard';

const COLORS = ['#6d5df5', '#a855f7', '#10B981', '#F59E0B', '#EF4444', '#3b82f6', '#ec4899', '#14b8a6'];

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    adminService.dashboard().then(({ data }) => { setStats(data.stats); setCharts(data.charts); });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Admin Overview</h1>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard icon={Users} label="Total Users" value={stats.totalUsers} tint="brand" />
          <DashboardCard icon={ListChecks} label="Total Events" value={stats.totalEvents} tint="purple" />
          <DashboardCard icon={ClipboardCheck} label="Pending Approvals" value={stats.pendingEvents} tint="amber" />
          <DashboardCard icon={CheckCircle2} label="Attendance Rate" value={`${stats.attendanceRate}%`} tint="emerald" />
        </div>
      )}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <DashboardCard icon={Users} label="Students" value={stats.students} tint="brand" />
          <DashboardCard icon={Users} label="Organizers" value={stats.organizers} tint="purple" />
          <DashboardCard icon={ClipboardList} label="Registrations" value={stats.totalRegistrations} tint="emerald" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
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

        <div className="card p-5">
          <h2 className="font-bold mb-4">Event Category Distribution</h2>
          {charts?.categoryDistribution?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={charts.categoryDistribution} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label>
                  {charts.categoryDistribution.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-400">No data yet.</p>}
        </div>
      </div>
    </div>
  );
}
