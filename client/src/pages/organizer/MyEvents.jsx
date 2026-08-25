import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks } from 'lucide-react';
import { eventService } from '../../services/eventService';
import StatusBadge from '../../components/events/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { GridSkeleton } from '../../components/ui/LoadingSkeleton';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.list({ mine: true, limit: 50 }).then(({ data }) => setEvents(data.events)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">My Events</h1>
        <Link to="/organizer/create" className="btn-primary">Create Event</Link>
      </div>

      {loading ? <GridSkeleton count={3} /> : events.length === 0 ? (
        <EmptyState icon={ListChecks} title="You haven't created any events yet" actionLabel="Create your first event" actionTo="/organizer/create" />
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e._id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1"><StatusBadge status={e.status} /><StatusBadge status={e.computedStatus} /></div>
                <p className="font-semibold">{e.title}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(e.date).toDateString()} · {e.registrationCount} registered · {e.seatsRemaining} seats left</p>
                {e.approvalNote && <p className="text-xs text-amber-600 mt-1">Admin note: {e.approvalNote}</p>}
              </div>
              <div className="flex gap-2">
                <Link to={`/organizer/registrations?eventId=${e._id}`} className="btn-secondary !py-1.5 !px-3 text-xs">Registrations</Link>
                <Link to={`/events/${e.slug}`} className="btn-secondary !py-1.5 !px-3 text-xs">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
