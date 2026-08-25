import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || '', contactNumber: user?.contactNumber || '', bio: user?.bio || '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userService.updateProfile(form);
      setUser(data.user);
      localStorage.setItem('es_user', JSON.stringify(data.user));
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-extrabold">Profile</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <span className="h-16 w-16 rounded-full bg-hero-gradient text-white grid place-items-center text-2xl font-bold">{user?.fullName?.[0]}</span>
          <div><p className="font-semibold">{user?.fullName}</p><p className="text-sm text-slate-500">{user?.email}</p></div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Full Name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input" /></div>
          <div><label className="label">Contact Number</label><input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} className="input" /></div>
          <div><label className="label">Bio</label><textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input" /></div>
          <button disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save changes'}</button>
        </form>
      </div>
    </div>
  );
}
