import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { UserCheck, Clock, CheckCircle, XCircle, RefreshCw, Search, AlertCircle } from 'lucide-react';
import { registrationService } from '../../services/registrationService';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/events/StatusBadge';

export default function RegistrationApprovals() {
  const [registrations, setRegistrations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    registrationService
      .getPending()
      .then((res) => {
        // res = { success, message, data: { registrations: [...] } }
        const data = res?.data?.registrations || [];
        setRegistrations(data);
        setFiltered(data);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Failed to load pending registrations';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFiltered(registrations);
      return;
    }
    setFiltered(
      registrations.filter(
        (r) =>
          r.student?.fullName?.toLowerCase().includes(q) ||
          r.student?.email?.toLowerCase().includes(q) ||
          r.event?.title?.toLowerCase().includes(q) ||
          r.event?.venue?.toLowerCase().includes(q)
      )
    );
  }, [search, registrations]);

  const handleAction = async (reg, newStatus) => {
    setUpdatingId(reg._id);
    try {
      await registrationService.updateStatus(reg._id, newStatus);
      toast.success(
        newStatus === 'Confirmed'
          ? `✅ Approved: ${reg.student?.fullName || 'Student'}`
          : `❌ Rejected: ${reg.student?.fullName || 'Student'}`
      );
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <UserCheck size={24} className="text-indigo-500" />
            Student Registration Approvals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and approve or reject pending student event registration requests.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="btn-secondary !py-2 !px-4 text-xs flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats + Search Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <Clock size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
            <p className="text-2xl font-bold">{registrations.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3 sm:col-span-3">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student name, email, event title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input !pl-9 w-full text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card p-10 text-center">
          <div className="inline-block w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading pending registrations...</p>
        </div>
      ) : error ? (
        <div className="card p-8 text-center border border-rose-200 dark:border-rose-800">
          <AlertCircle size={36} className="text-rose-400 mx-auto mb-3" />
          <p className="font-semibold text-rose-600 dark:text-rose-400">Failed to load data</p>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
          <button onClick={load} className="btn-primary !py-2 !px-5 text-sm mt-4">
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title={search ? 'No matching registrations found' : 'All caught up! 🎉'}
          description={
            search
              ? 'Try clearing the search or different keywords.'
              : 'There are no pending student registration requests right now.'
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Student</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Event</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Event Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Submitted</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((reg) => (
                  <tr
                    key={reg._id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Student */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                        {reg.student?.fullName || reg.walkInDetails?.fullName || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {reg.student?.email || reg.walkInDetails?.email || '—'}
                      </p>
                      {(reg.student?.enrollmentNumber || reg.walkInDetails?.rollNumber) && (
                        <p className="text-xs text-slate-400">
                          #{reg.student?.enrollmentNumber || reg.walkInDetails?.rollNumber}
                        </p>
                      )}
                    </td>

                    {/* Event */}
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="font-medium text-slate-700 dark:text-slate-200 leading-tight truncate">
                        {reg.event?.title || 'N/A'}
                      </p>
                      {reg.event?.venue && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{reg.event.venue}</p>
                      )}
                    </td>

                    {/* Event Date */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap">
                      {reg.event?.date
                        ? new Date(reg.event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    {/* Submitted */}
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {reg.registeredAt || reg.createdAt
                        ? new Date(reg.registeredAt || reg.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={reg.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAction(reg, 'Confirmed')}
                          disabled={updatingId === reg._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                            bg-emerald-50 text-emerald-700 border border-emerald-200
                            hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300
                            dark:border-emerald-800 dark:hover:bg-emerald-900/50
                            transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Approve Registration"
                        >
                          {updatingId === reg._id ? (
                            <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle size={13} />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(reg, 'Cancelled')}
                          disabled={updatingId === reg._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                            bg-rose-50 text-rose-700 border border-rose-200
                            hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300
                            dark:border-rose-800 dark:hover:bg-rose-900/50
                            transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Reject Registration"
                        >
                          {updatingId === reg._id ? (
                            <div className="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <XCircle size={13} />
                          )}
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-xs text-slate-400">
              Showing {filtered.length} of {registrations.length} pending request{registrations.length !== 1 ? 's' : ''}
              {search && ` · filtered by "${search}"`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
