import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CalendarClock, CheckCircle2, Award, Bookmark } from 'lucide-react';
import { userService } from '../../services/userService';
import DashboardCard from '../../components/dashboard/DashboardCard';
import StatusBadge from '../../components/events/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/ui/EmptyState';

export default function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    userService.dashboard().then(({ data }) => { setStats(data.stats); setUpcoming(data.upcoming); });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Welcome back, {user?.fullName?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your events</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardCard icon={ClipboardList} label="Registered" value={stats.registeredEvents} tint="brand" />
          <DashboardCard icon={CalendarClock} label="Upcoming" value={stats.upcomingEvents} tint="purple" />
          <DashboardCard icon={CheckCircle2} label="Attended" value={stats.attendedEvents} tint="emerald" />
          <DashboardCard icon={Award} label="Certificates" value={stats.certificates} tint="amber" />
          <DashboardCard icon={Bookmark} label="Saved" value={stats.savedEvents} tint="brand" />
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Upcoming events</h2>
          <Link to="/dashboard/registrations" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState title="Nothing on your calendar yet" description="Discover events happening around campus and register." actionLabel="Discover Events" actionTo="/dashboard/discover" />
        ) : (
          <div className="space-y-3">
            {upcoming.map((r) => (
              <div key={r._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5">
                <div>
                  <p className="font-medium text-sm">{r.event?.title}</p>
                  <p className="text-xs text-slate-500">{new Date(r.event?.date).toDateString()} · {r.event?.venue}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
