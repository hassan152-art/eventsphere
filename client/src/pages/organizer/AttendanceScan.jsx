import { useEffect, useState } from 'react';
import { QrCode, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '../../services/eventService';
import { attendanceService } from '../../services/registrationService';
import DataTable from '../../components/ui/DataTable';

export default function AttendanceScan() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [rawPayload, setRawPayload] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    eventService.list({ mine: true, limit: 50 }).then(({ data }) => {
      setEvents(data.events);
      if (data.events[0]) setEventId(data.events[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!eventId) return;
    eventService.attendance(eventId).then(({ data }) => setAttendance(data.attendance));
  }, [eventId, lastResult]);

  const submitScan = async (e) => {
    e.preventDefault();
    try {
      const payload = JSON.parse(rawPayload);
      const { data } = await attendanceService.scan({ registrationId: payload.r, eventId: payload.e, token: payload.t });
      toast.success('Attendance Marked Successfully');
      setLastResult({ ok: true, name: data.participant.name });
      setRawPayload('');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid QR code';
      toast.error(message);
      setLastResult({ ok: false, message });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Attendance Check-in</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <label className="label">Event</label>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="input mb-4">
            {events.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
          </select>

          <div className="h-40 rounded-xl bg-slate-50 dark:bg-white/5 grid place-items-center mb-4">
            <div className="text-center text-slate-400">
              <QrCode size={32} className="mx-auto mb-2" />
              <p className="text-xs">Connect a QR scanner device, or paste scanned payload below</p>
            </div>
          </div>

          <form onSubmit={submitScan} className="space-y-3">
            <textarea
              value={rawPayload} onChange={(e) => setRawPayload(e.target.value)} rows={3}
              placeholder='Paste QR payload JSON, e.g. {"r":"...","e":"...","t":"..."}'
              className="input font-mono text-xs"
            />
            <button className="btn-primary w-full">Verify & Check In</button>
          </form>

          {lastResult && (
            <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-sm ${lastResult.ok ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
              {lastResult.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {lastResult.ok ? `Attendance verified for ${lastResult.name}` : lastResult.message}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-4">Checked-in participants ({attendance.length})</h2>
          <DataTable
            emptyMessage="No check-ins yet."
            columns={[
              { key: 'name', label: 'Name', render: (a) => a.student?.fullName },
              { key: 'email', label: 'Email', render: (a) => a.student?.email },
              { key: 'time', label: 'Checked in', render: (a) => new Date(a.checkedInAt).toLocaleTimeString() },
            ]}
            rows={attendance}
          />
        </div>
      </div>
    </div>
  );
}
