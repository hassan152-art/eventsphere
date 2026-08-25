import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Megaphone } from 'lucide-react';
import { announcementService } from '../../services/userService';
import api from '../../services/api';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', audience: 'Global' });
  const [sending, setSending] = useState(false);

  const load = () => announcementService.list().then(({ data }) => setAnnouncements(data.announcements));
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/admin/announcements', form);
      toast.success('Announcement published');
      setForm({ title: '', message: '', audience: 'Global' });
      load();
    } catch {
      toast.error('Could not publish announcement');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Announcements</h1>

      <form onSubmit={submit} className="card p-5 space-y-3 max-w-lg">
        <div><label className="label">Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" /></div>
        <div><label className="label">Message</label><textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input" /></div>
        <div><label className="label">Audience</label>
          <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="input">
            <option value="Global">Global</option>
            <option value="Students">Students</option>
            <option value="Organizers">Organizers</option>
          </select>
        </div>
        <button disabled={sending} className="btn-primary">{sending ? 'Publishing...' : 'Publish Announcement'}</button>
      </form>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a._id} className="card p-4 flex items-start gap-3">
            <span className="h-9 w-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 grid place-items-center shrink-0"><Megaphone size={16} /></span>
            <div><p className="font-semibold text-sm">{a.title}</p><p className="text-sm text-slate-500">{a.message}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
