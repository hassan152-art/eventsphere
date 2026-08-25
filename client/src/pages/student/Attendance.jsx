import { useEffect, useState } from 'react';
import { QrCode, CheckCircle2 } from 'lucide-react';
import { registrationService } from '../../services/registrationService';
import { attendanceService } from '../../services/registrationService';
import EmptyState from '../../components/ui/EmptyState';

export default function Attendance() {
  const [registrations, setRegistrations] = useState([]);
  const [attended, setAttended] = useState([]);
  const [activeQR, setActiveQR] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([registrationService.mine('Confirmed'), attendanceService.mine()])
      .then(([regs, att]) => { setRegistrations(regs.data.registrations); setAttended(att.data.attendance); })
      .finally(() => setLoading(false));
  }, []);

  const attendedEventIds = new Set(attended.map((a) => a.event?._id));

  const showQR = async (registrationId) => {
    const { data } = await attendanceService.myQR(registrationId);
    setActiveQR(data);
  };

  const upcomingRegs = registrations.filter((r) => !attendedEventIds.has(r.event?._id));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Attendance</h1>

      <div className="card p-5">
        <h2 className="font-bold mb-4">Your QR Passes</h2>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : upcomingRegs.length === 0 ? (
          <EmptyState icon={QrCode} title="No active QR passes" description="Passes appear here once you have a confirmed registration for an upcoming event." />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {upcomingRegs.map((r) => (
              <button key={r._id} onClick={() => showQR(r._id)} className="card p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 grid place-items-center"><QrCode size={18} /></span>
                <div><p className="font-medium text-sm">{r.event?.title}</p><p className="text-xs text-slate-500">{new Date(r.event?.date).toDateString()}</p></div>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeQR && (
        <div className="card p-6 text-center max-w-sm">
          <p className="font-semibold mb-3">{activeQR.event.title}</p>
          <img src={activeQR.qrDataUrl} alt="QR attendance pass" className="mx-auto rounded-xl w-56 h-56" />
          <p className="text-xs text-slate-400 mt-3">Show this to the organizer at the venue to check in.</p>
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-bold mb-4">Attendance History</h2>
        {attended.length === 0 ? (
          <p className="text-sm text-slate-400">No attendance recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {attended.map((a) => (
              <div key={a._id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-900/10">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <div><p className="text-sm font-medium">{a.event?.title}</p><p className="text-xs text-slate-500">Checked in {new Date(a.checkedInAt).toLocaleString()}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
