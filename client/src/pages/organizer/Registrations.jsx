import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/events/StatusBadge';

export default function Registrations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(searchParams.get('eventId') || '');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    eventService.list({ mine: true, limit: 50 }).then(({ data }) => {
      setEvents(data.events);
      if (!eventId && data.events[0]) setEventId(data.events[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    eventService.registrations(eventId).then(({ data }) => setRegistrations(data.registrations)).finally(() => setLoading(false));
  }, [eventId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold">Registrations</h1>
        <select value={eventId} onChange={(e) => { setEventId(e.target.value); setSearchParams({ eventId: e.target.value }); }} className="input !py-2 text-sm w-64">
          {events.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
        </select>
      </div>

      <div className="card p-5">
        {loading ? <p className="text-sm text-slate-400">Loading...</p> : (
          <DataTable
            emptyMessage="No registrations for this event yet."
            columns={[
              { key: 'name', label: 'Name', render: (r) => r.student?.fullName },
              { key: 'email', label: 'Email', render: (r) => r.student?.email },
              { key: 'enrollment', label: 'Enrollment', render: (r) => r.student?.enrollmentNumber },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              { key: 'registeredAt', label: 'Registered', render: (r) => new Date(r.registeredAt).toLocaleDateString() },
            ]}
            rows={registrations}
          />
        )}
      </div>
    </div>
  );
}
