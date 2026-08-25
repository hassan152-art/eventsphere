import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import { adminService } from '../../services/userService';
import DataTable from '../../components/ui/DataTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminService.users({ search, role }).then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search, role]);

  const changeRole = async (user, newRole) => {
    await adminService.changeRole(user._id, newRole);
    toast.success('Role updated');
    load();
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    await adminService.changeStatus(user._id, newStatus);
    toast.success(newStatus === 'suspended' ? 'User suspended' : 'User activated');
    load();
  };

  const confirmDelete = async () => {
    await adminService.deleteUser(target._id);
    toast.success('User deleted');
    setTarget(null);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Users</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input pl-9 !py-2 text-sm w-64" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input !py-2 text-sm w-44">
          <option value="">All roles</option>
          <option value="participant">Participant</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="card p-5">
        {loading ? <p className="text-sm text-slate-400">Loading...</p> : (
          <DataTable
            columns={[
              { key: 'fullName', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role', render: (u) => (
                <select value={u.role} onChange={(e) => changeRole(u, e.target.value)} className="input !py-1 !px-2 text-xs w-32">
                  <option value="participant">Participant</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Admin</option>
                </select>
              ) },
              { key: 'status', label: 'Status', render: (u) => (
                <button onClick={() => toggleStatus(u)} className={`badge ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{u.status}</button>
              ) },
              { key: 'actions', label: '', render: (u) => (
                <button onClick={() => setTarget(u)} className="text-danger text-xs font-semibold hover:underline">Delete</button>
              ) },
            ]}
            rows={users}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!target} danger title="Delete this user?"
        description={target ? `This permanently removes ${target.fullName}'s account.` : ''}
        confirmLabel="Delete" onCancel={() => setTarget(null)} onConfirm={confirmDelete}
      />
    </div>
  );
}
