import { Download } from 'lucide-react';

const REPORTS = [
  { key: 'registrations', label: 'Event Registrations' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'certificates', label: 'Certificates' },
];

export default function Reports() {
  const download = (key) => {
    const token = localStorage.getItem('es_token');
    const base = import.meta.env.VITE_API_BASE_URL || '/api';
    // Direct link so the browser handles the CSV download; token passed as query for simplicity in this demo build.
    window.open(`${base}/reports/${key}?format=csv&token=${token}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Reports</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {REPORTS.map((r) => (
          <div key={r.key} className="card p-5 flex items-center justify-between">
            <p className="font-semibold text-sm">{r.label}</p>
            <button onClick={() => download(r.key)} className="btn-secondary !py-1.5 !px-3 text-xs"><Download size={14} /> CSV</button>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">Note: report downloads authenticate via your session token; ensure pop-ups are allowed for this site.</p>
    </div>
  );
}
