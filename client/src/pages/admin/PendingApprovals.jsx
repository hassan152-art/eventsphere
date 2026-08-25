import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ClipboardCheck } from 'lucide-react';
import { adminService } from '../../services/userService';
import EmptyState from '../../components/ui/EmptyState';

export default function PendingApprovals() {
  const [events, setEvents] = useState([]);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminService.pendingEvents().then(({ data }) => setEvents(data.events)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const decide = async (event, decision) => {
    try {
      await adminService.setApproval(event._id, decision, noteDrafts[event._id] || '');
      toast.success(`Event ${decision.toLowerCase()}`);
      load();
    } catch {
      toast.error('Could not update event status');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Pending Approvals</h1>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : events.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No events awaiting approval" description="New organizer submissions will appear here." />
      ) : (
        <div className="space-y-4">
          {events.map((e) => (
            <div key={e._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{e.title}</p>
                  <p className="text-xs text-slate-500 mt-1">By {e.organizer?.fullName} · {e.department?.name} · {new Date(e.date).toDateString()}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-xl">{e.description}</p>
                </div>
              </div>
              <textarea
                placeholder="Optional note for the organizer..."
                value={noteDrafts[e._id] || ''}
                onChange={(ev) => setNoteDrafts({ ...noteDrafts, [e._id]: ev.target.value })}
                className="input mt-3 text-sm" rows={2}
              />
              <div className="flex gap-2 mt-3">
                <button onClick={() => decide(e, 'Approved')} className="btn-primary !py-1.5 !px-4 text-xs">Approve</button>
                <button onClick={() => decide(e, 'Changes Requested')} className="btn-secondary !py-1.5 !px-4 text-xs">Request Changes</button>
                <button onClick={() => decide(e, 'Rejected')} className="btn-danger !py-1.5 !px-4 text-xs">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
