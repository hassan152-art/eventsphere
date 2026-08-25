import { useEffect, useState } from 'react';
import { CalendarClock, ListChecks, Users, CheckCircle2, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { organizerService } from '../../services/userService';
import DashboardCard from '../../components/dashboard/DashboardCard';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    organizerService.dashboard().then(({ data }) => { setStats(data.stats); setCharts(data.charts); });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Organizer Overview</h1>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardCard icon={ListChecks} label="Total Events" value={stats.totalEvents} tint="brand" />
          <DashboardCard icon={CalendarClock} label="Upcoming" value={stats.upcomingEvents} tint="purple" />
          <DashboardCard icon={Users} label="Registrations" value={stats.totalRegistrations} tint="brand" />
          <DashboardCard icon={CheckCircle2} label="Attendance Rate" value={`${stats.attendanceRate}%`} tint="emerald" />
          <DashboardCard icon={Star} label="Avg Rating" value={stats.averageRating || '—'} tint="amber" />
        </div>
      )}

      {charts?.registrationTrends?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold mb-4">Registration Trends</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.registrationTrends}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="event" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="registrations" fill="#6d5df5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
