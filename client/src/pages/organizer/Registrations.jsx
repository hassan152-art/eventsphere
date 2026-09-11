import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/events/StatusBadge';
import { Download, CheckCircle, XCircle } from 'lucide-react';

export default function Registrations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(searchParams.get('eventId') || '');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    eventService.list({ mine: true, limit: 50 }).then(({ data }) => {
      setEvents(data.events);
      if (!eventId && data.events[0]) setEventId(data.events[0]._id);
    });
  }, []);

  const fetchRegistrations = () => {
    if (!eventId) return;
    setLoading(true);
    eventService.registrations(eventId)
      .then(({ data }) => setRegistrations(data.registrations))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  const handleExportCSV = async () => {
    if (!eventId) return;
    setExporting(true);
    try {
      const response = await registrationService.exportCSV(eventId);
      const selectedEvent = events.find((e) => e._id === eventId);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Participants_${selectedEvent?.title.replace(/[^\w]/g, '_') || 'Event'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Participant list exported to CSV!');
    } catch (err) {
      toast.error('Failed to export CSV file');
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = async (regId, newStatus) => {
    try {
      await registrationService.updateStatus(regId, newStatus);
      toast.success(`Registration status updated to ${newStatus}`);
      fetchRegistrations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Participant Registrations & Approvals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage student event bookings, approve participants, and export lists.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={eventId}
            onChange={(e) => { setEventId(e.target.value); setSearchParams({ eventId: e.target.value }); }}
            className="input !py-2 text-sm w-64"
          >
            {events.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
          </select>

          <button
            onClick={handleExportCSV}
            disabled={exporting || !eventId || registrations.length === 0}
            className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Download size={14} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="card p-5">
        {loading ? <p className="text-sm text-slate-400">Loading registrations...</p> : (
          <DataTable
            emptyMessage="No registrations for this event yet."
            columns={[
              { key: 'name', label: 'Name', render: (r) => r.walkInDetails?.fullName || r.student?.fullName || 'N/A' },
              { key: 'email', label: 'Email', render: (r) => r.walkInDetails?.email || r.student?.email || 'N/A' },
              { key: 'enrollment', label: 'Enrollment / Roll', render: (r) => r.walkInDetails?.rollNumber || r.student?.enrollmentNumber || 'N/A' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              { key: 'registeredAt', label: 'Registered', render: (r) => new Date(r.registeredAt).toLocaleDateString() },
              {
                key: 'actions',
                label: 'Organizer Actions',
                render: (r) => (
                  <div className="flex items-center gap-1.5">
                    {r.status !== 'Confirmed' && (
                      <button
                        onClick={() => handleStatusChange(r._id, 'Confirmed')}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
                        title="Approve / Confirm Registration"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {r.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleStatusChange(r._id, 'Cancelled')}
                        className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                        title="Cancel Registration"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
            rows={registrations}
          />
        )}
      </div>
    </div>
  );
}

