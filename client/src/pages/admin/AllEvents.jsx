import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import StatusBadge from '../../components/events/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import { Users } from 'lucide-react';

export default function AllEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.list({ limit: 100 }).then(({ data }) => setEvents(data.events)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">All Events & Participant Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Overview of all college events, approval statuses, and participant bookings.</p>
      </div>

      <div className="card p-5">
        {loading ? <p className="text-sm text-slate-400">Loading events...</p> : (
          <DataTable
            columns={[
              { key: 'title', label: 'Title', render: (e) => <span className="font-semibold">{e.title}</span> },
              { key: 'organizer', label: 'Organizer', render: (e) => e.organizer?.fullName || 'N/A' },
              { key: 'status', label: 'Approval', render: (e) => <StatusBadge status={e.status} /> },
              { key: 'computedStatus', label: 'Status', render: (e) => <StatusBadge status={e.computedStatus} /> },
              { key: 'registrationCount', label: 'Registrations', render: (e) => <span className="font-bold">{e.registrationCount}</span> },
              { key: 'date', label: 'Date', render: (e) => new Date(e.date).toDateString() },
              {
                key: 'actions',
                label: 'Manage Bookings',
                render: (e) => (
                  <Link
                    to={`/organizer/registrations?eventId=${e._id}`}
                    className="btn-secondary !py-1 !px-2.5 text-xs flex items-center gap-1.5"
                  >
                    <Users size={14} /> Registrations
                  </Link>
                ),
              },
            ]}
            rows={events}
          />
        )}
      </div>
    </div>
  );
}
