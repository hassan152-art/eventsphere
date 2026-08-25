import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Award } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { certificateService } from '../../services/registrationService';

export default function CertificateIssue() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    eventService.list({ mine: true, limit: 50, status: 'Completed' }).then(({ data }) => {
      setEvents(data.events);
      if (data.events[0]) setEventId(data.events[0]._id);
    });
  }, []);

  const bulkIssue = async () => {
    if (!eventId) return;
    setIssuing(true);
    try {
      const { message } = await certificateService.bulkIssue({ eventId, type: 'Participation' });
      toast.success(message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not issue certificates');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-extrabold">Certificates</h1>
      <div className="card p-6">
        <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 grid place-items-center mb-4"><Award size={20} /></div>
        <p className="font-semibold mb-1">Bulk issue certificates</p>
        <p className="text-sm text-slate-500 mb-4">Generates a certificate for every checked-in participant of a completed event who doesn't already have one.</p>

        {events.length === 0 ? (
          <p className="text-sm text-slate-400">No completed events yet.</p>
        ) : (
          <>
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="input mb-4">
              {events.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
            <button onClick={bulkIssue} disabled={issuing} className="btn-primary w-full">{issuing ? 'Issuing...' : 'Bulk Issue Certificates'}</button>
          </>
        )}
      </div>
    </div>
  );
}
