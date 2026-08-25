import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const submit = (e) => {
    e.preventDefault();
    toast.success('Thanks! Your message has been sent.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container-page py-16 grid lg:grid-cols-2 gap-12">
      <div>
        <h1 className="text-3xl font-extrabold">Get in touch</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-3">Questions about an event or the platform? We'd love to hear from you.</p>
        <div className="space-y-4 mt-8">
          <p className="flex items-center gap-3 text-sm"><MapPin size={18} className="text-brand-600" /> Main Campus, College Road</p>
          <p className="flex items-center gap-3 text-sm"><Mail size={18} className="text-brand-600" /> hello@eventsphere.com</p>
          <p className="flex items-center gap-3 text-sm"><Phone size={18} className="text-brand-600" /> +1 (555) 010-2030</p>
        </div>
      </div>
      <form onSubmit={submit} className="card p-6 space-y-4">
        <div><label className="label">Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
        <div><label className="label">Email</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></div>
        <div><label className="label">Message</label><textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input" /></div>
        <button className="btn-primary w-full">Send message</button>
      </form>
    </div>
  );
}
