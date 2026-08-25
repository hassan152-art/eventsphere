import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { eventService, lookupService } from '../../services/eventService';

const STEPS = ['Basic Info', 'Schedule', 'Venue', 'Registration', 'Media', 'Review'];
const EVENT_TYPES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Annual Day', 'Intercollegiate'];

const initial = {
  title: '', description: '', category: '', department: '', eventType: '',
  date: '', startTime: '', endTime: '', registrationDeadline: '',
  venue: '', capacity: '',
  maxParticipants: '', eligibility: 'Open to all students', waitlistEnabled: true,
  bannerFile: null,
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    lookupService.categories().then(({ data }) => setCategories(data.categories));
    lookupService.departments().then(({ data }) => setDepartments(data.departments));
  }, []);

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'file' ? e.target.files[0] : e.target.value;
    setForm({ ...form, [key]: value });
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = { ...form };
      delete payload.bannerFile;
      const { data } = await eventService.create(payload);

      if (form.bannerFile) {
        const fd = new FormData();
        fd.append('file', form.bannerFile);
        fd.append('field', 'banner');
        await eventService.uploadMedia(data.event._id, fd);
      }

      toast.success('Event submitted for admin approval');
      navigate('/organizer/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold mb-6">Create Event</h1>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div className={`h-7 w-7 rounded-full grid place-items-center text-xs font-bold ${
              i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'
            }`}>
              {i < step ? <Check size={13} /> : i + 1}
            </div>
            <span className={`text-xs ${i === step ? 'font-semibold' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-slate-200 dark:bg-white/10" />}
          </div>
        ))}
      </div>

      <div className="card p-6 space-y-4">
        {step === 0 && (
          <>
            <div><label className="label">Title</label><input value={form.title} onChange={update('title')} className="input" /></div>
            <div><label className="label">Description</label><textarea rows={4} value={form.description} onChange={update('description')} className="input" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Category</label>
                <select value={form.category} onChange={update('category')} className="input">
                  <option value="">Select</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="label">Department</label>
                <select value={form.department} onChange={update('department')} className="input">
                  <option value="">Select</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div><label className="label">Event Type</label>
              <select value={form.eventType} onChange={update('eventType')} className="input">
                <option value="">Select</option>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div><label className="label">Date</label><input type="date" value={form.date} onChange={update('date')} className="input" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Start Time</label><input type="time" value={form.startTime} onChange={update('startTime')} className="input" /></div>
              <div><label className="label">End Time</label><input type="time" value={form.endTime} onChange={update('endTime')} className="input" /></div>
            </div>
            <div><label className="label">Registration Deadline</label><input type="date" value={form.registrationDeadline} onChange={update('registrationDeadline')} className="input" /></div>
          </>
        )}

        {step === 2 && (
          <>
            <div><label className="label">Venue</label><input value={form.venue} onChange={update('venue')} className="input" /></div>
            <div><label className="label">Capacity</label><input type="number" min={1} value={form.capacity} onChange={update('capacity')} className="input" /></div>
          </>
        )}

        {step === 3 && (
          <>
            <div><label className="label">Maximum Participants</label><input type="number" min={1} value={form.maxParticipants} onChange={update('maxParticipants')} className="input" /></div>
            <div><label className="label">Eligibility</label><input value={form.eligibility} onChange={update('eligibility')} className="input" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.waitlistEnabled} onChange={update('waitlistEnabled')} /> Enable waitlist when full</label>
          </>
        )}

        {step === 4 && (
          <div><label className="label">Event Banner</label><input type="file" accept="image/*" onChange={update('bannerFile')} className="input" /></div>
        )}

        {step === 5 && (
          <div className="space-y-2 text-sm">
            <p><strong>{form.title}</strong> ({form.eventType})</p>
            <p>{new Date(form.date || Date.now()).toDateString()}, {form.startTime} - {form.endTime}</p>
            <p>{form.venue} · {form.capacity} capacity</p>
            <p>Max participants: {form.maxParticipants} · Waitlist: {form.waitlistEnabled ? 'Enabled' : 'Disabled'}</p>
            <p className="text-slate-500">{form.description}</p>
            <p className="text-xs text-amber-600 mt-3">Submitting will send this event for admin approval before it appears publicly.</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {step > 0 && <button onClick={back} className="btn-secondary flex-1">Back</button>}
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn-primary flex-1">Next</button>
          ) : (
            <button onClick={submit} disabled={submitting} className="btn-primary flex-1">{submitting ? 'Submitting...' : 'Submit for Approval'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
