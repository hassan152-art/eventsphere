import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { QrCode, CheckCircle2, Loader2, Download } from 'lucide-react';
import { registrationService, attendanceService } from '../../services/registrationService';
import EmptyState from '../../components/ui/EmptyState';

export default function Attendance() {
  const [registrations, setRegistrations] = useState([]);
  const [attended, setAttended] = useState([]);
  const [activeQR, setActiveQR] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrLoadingId, setQrLoadingId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([registrationService.mine('Confirmed'), attendanceService.mine()])
      .then(([regs, att]) => {
        setRegistrations(regs.data.registrations);
        setAttended(att.data.attendance);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Could not load your attendance data');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const attendedEventIds = new Set(attended.map((a) => a.event?._id));

  const showQR = async (registrationId) => {
    setQrLoadingId(registrationId);
    try {
      const { data } = await attendanceService.myQR(registrationId);
      setActiveQR(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load your QR pass');
    } finally {
      setQrLoadingId(null);
    }
  };

  const upcomingRegs = registrations.filter((r) => r.event && !attendedEventIds.has(r.event._id));

  const downloadQR = () => {
    if (!activeQR?.qrDataUrl) return;
    const link = document.createElement('a');
    link.href = activeQR.qrDataUrl;
    const safeTitle = (activeQR.event?.title || 'event-pass').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    link.download = `eventsphere-qr-pass-${safeTitle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR pass downloaded');
  };

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
              <button
                key={r._id}
                onClick={() => showQR(r._id)}
                disabled={qrLoadingId === r._id}
                className="card p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 disabled:opacity-60"
              >
                <span className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 grid place-items-center">
                  {qrLoadingId === r._id ? <Loader2 size={18} className="animate-spin" /> : <QrCode size={18} />}
                </span>
                <div>
                  <p className="font-medium text-sm">{r.event?.title}</p>
                  <p className="text-xs text-slate-500">{r.event?.date && new Date(r.event.date).toDateString()}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeQR && (
        <div className="card p-6 text-center max-w-sm">
          <p className="font-semibold mb-3">{activeQR.event?.title}</p>
          <img src={activeQR.qrDataUrl} alt="QR attendance pass" className="mx-auto rounded-xl w-56 h-56" />
          <p className="text-xs text-slate-400 mt-3">Show this to the organizer at the venue to check in.</p>
          <button onClick={downloadQR} className="btn-primary mt-4 inline-flex items-center gap-2 !py-2 !px-4 text-sm">
            <Download size={16} /> Download QR Pass
          </button>
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
