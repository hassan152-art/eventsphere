import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registrationService } from '../../services/registrationService';
import StatusBadge from '../../components/events/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { RowSkeleton } from '../../components/ui/LoadingSkeleton';
import { ClipboardList } from 'lucide-react';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);

  const load = () => {
    setLoading(true);
    registrationService.mine().then(({ data }) => setRegistrations(data.registrations)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const cancel = async () => {
    try {
      const { message } = await registrationService.cancel(target._id);
      toast.success(message);
      setTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">My Registrations</h1>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}</div>
      ) : registrations.length === 0 ? (
        <EmptyState icon={ClipboardList} title="You haven't registered for any events yet." actionLabel="Discover Events" actionTo="/dashboard/discover" />
      ) : (
        <div className="space-y-3">
          {registrations.map((r) => (
            <div key={r._id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1"><StatusBadge status={r.status} /></div>
                <Link to={`/events/${r.event?.slug}`} className="font-semibold hover:text-brand-600">{r.event?.title}</Link>
                <p className="text-xs text-slate-500 mt-1">{r.event?.date && new Date(r.event.date).toDateString()} · {r.event?.venue}</p>
                {r.status === 'Waitlisted' && <p className="text-xs text-amber-600 mt-1">Waitlist position: #{r.waitlistPosition}</p>}
              </div>
              <div className="flex gap-2">
                {r.status === 'Confirmed' && (
                  <Link to="/dashboard/attendance" className="btn-secondary !py-1.5 !px-3 text-xs">View QR Pass</Link>
                )}
                {r.status !== 'Cancelled' && (
                  <button onClick={() => setTarget(r)} className="btn-danger !py-1.5 !px-3 text-xs">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!target} danger title="Cancel this registration?"
        description={target ? `You'll lose your spot for "${target.event?.title}". If someone is waitlisted, they'll be promoted automatically.` : ''}
        confirmLabel="Cancel Registration" onCancel={() => setTarget(null)} onConfirm={cancel}
      />
    </div>
  );
}
