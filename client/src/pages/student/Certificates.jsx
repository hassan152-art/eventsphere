import { useEffect, useState } from 'react';
import { Award, Download } from 'lucide-react';
import { certificateService } from '../../services/registrationService';
import EmptyState from '../../components/ui/EmptyState';
import { GridSkeleton } from '../../components/ui/LoadingSkeleton';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateService.mine().then(({ data }) => setCertificates(data.certificates)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Certificates</h1>
      {loading ? <GridSkeleton count={3} /> : certificates.length === 0 ? (
        <EmptyState icon={Award} title="Your certificates will appear here after attending eligible events." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((c) => (
            <div key={c._id} className="card p-5">
              <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 grid place-items-center mb-3"><Award size={20} /></div>
              <p className="font-semibold text-sm">{c.event?.title}</p>
              <p className="text-xs text-slate-500 mt-1">{c.type} · {c.certificateNumber}</p>
              <p className="text-xs text-slate-400 mt-1">Issued {new Date(c.issuedAt).toDateString()}</p>
              <a href={c.certificateUrl} target="_blank" rel="noreferrer" className="btn-secondary w-full mt-4 !py-2 text-sm">
                <Download size={14} /> Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
