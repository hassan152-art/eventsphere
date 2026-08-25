import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Star, MessageSquare } from 'lucide-react';
import { attendanceService, feedbackService } from '../../services/registrationService';
import EmptyState from '../../components/ui/EmptyState';

const CRITERIA = [
  { key: 'venueRating', label: 'Venue' },
  { key: 'coordinationRating', label: 'Coordination' },
  { key: 'technicalArrangementRating', label: 'Technical Arrangement' },
  { key: 'hospitalityRating', label: 'Hospitality' },
];

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} onClick={() => onChange(n)}>
          <Star size={20} className={n <= value ? 'text-amber-500' : 'text-slate-300'} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

export default function Feedback() {
  const [attended, setAttended] = useState([]);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ overallRating: 5, venueRating: 5, coordinationRating: 5, technicalArrangementRating: 5, hospitalityRating: 5, comment: '' });

  useEffect(() => {
    attendanceService.mine().then(({ data }) => setAttended(data.attendance));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { message } = await feedbackService.submit(active.event._id, form);
      toast.success(message);
      setActive(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit feedback');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Feedback</h1>
      {attended.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Attend an event to leave feedback" />
      ) : active ? (
        <form onSubmit={submit} className="card p-6 max-w-lg space-y-5">
          <h2 className="font-bold">{active.event.title}</h2>
          <div>
            <label className="label">Overall rating</label>
            <StarPicker value={form.overallRating} onChange={(v) => setForm({ ...form, overallRating: v })} />
          </div>
          {CRITERIA.map((c) => (
            <div key={c.key}>
              <label className="label">{c.label}</label>
              <StarPicker value={form[c.key]} onChange={(v) => setForm({ ...form, [c.key]: v })} />
            </div>
          ))}
          <div>
            <label className="label">Comments</label>
            <textarea rows={3} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="input" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setActive(null)} className="btn-secondary flex-1">Back</button>
            <button className="btn-primary flex-1">Submit Feedback</button>
          </div>
        </form>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {attended.map((a) => (
            <button key={a._id} onClick={() => setActive(a)} className="card p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5">
              <p className="font-medium text-sm">{a.event?.title}</p>
              <p className="text-xs text-slate-500 mt-1">Tap to leave feedback</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
