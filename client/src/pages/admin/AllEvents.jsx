import { useEffect, useState } from 'react';
import { eventService } from '../../services/eventService';
import StatusBadge from '../../components/events/StatusBadge';
import DataTable from '../../components/ui/DataTable';

export default function AllEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.list({ limit: 100 }).then(({ data }) => setEvents(data.events)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">All Events</h1>
      <div className="card p-5">
        {loading ? <p className="text-sm text-slate-400">Loading...</p> : (
          <DataTable
            columns={[
              { key: 'title', label: 'Title' },
              { key: 'organizer', label: 'Organizer', render: (e) => e.organizer?.fullName },
              { key: 'status', label: 'Approval', render: (e) => <StatusBadge status={e.status} /> },
              { key: 'computedStatus', label: 'Status', render: (e) => <StatusBadge status={e.computedStatus} /> },
              { key: 'registrationCount', label: 'Registrations' },
              { key: 'date', label: 'Date', render: (e) => new Date(e.date).toDateString() },
            ]}
            rows={events}
          />
        )}
      </div>
    </div>
  );
}
