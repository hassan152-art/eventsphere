import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registrationService, feedbackService } from '../../services/registrationService';
import StatusBadge from '../../components/events/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { RowSkeleton } from '../../components/ui/LoadingSkeleton';
import { ClipboardList, Download, Star, QrCode } from 'lucide-react';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Rating modal state
  const [ratingTarget, setRatingTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const load = () => {
    setLoading(true);
    registrationService.mine()
      .then(({ data }) => setRegistrations(data.registrations))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const cancel = async () => {
    try {
      const { message } = await registrationService.cancel(target._id);
      toast.success(message);
      setTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleDownloadTicket = async (reg) => {
    setDownloadingId(reg._id);
    try {
      const response = await registrationService.downloadTicket(reg._id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ticket_${reg.event?.title.replace(/[^\w]/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Ticket PDF downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download ticket PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!ratingTarget) return;
    setSubmittingRating(true);
    try {
      await feedbackService.submit(ratingTarget.event._id, {
        overallRating: rating,
        comment,
      });
      toast.success('Thank you for rating this event!');
      setRatingTarget(null);
      setComment('');
      setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">My Registrations & Tickets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View bookings, download official PDF passes, and rate events</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}</div>
      ) : registrations.length === 0 ? (
        <EmptyState icon={ClipboardList} title="You haven't registered for any events yet." actionLabel="Discover Events" actionTo="/dashboard/discover" />
      ) : (
        <div className="space-y-3">
          {registrations.map((r) => (
            <div key={r._id} className="card p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1"><StatusBadge status={r.status} /></div>
                <Link to={`/events/${r.event?.slug}`} className="font-bold text-base hover:text-brand-600 transition-colors">
                  {r.event?.title}
                </Link>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  📅 {r.event?.date && new Date(r.event.date).toDateString()} · 📍 {r.event?.venue}
                </p>
                {r.status === 'Waitlisted' && (
                  <p className="text-xs text-amber-600 font-semibold mt-1">Waitlist position: #{r.waitlistPosition}</p>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-2">
                {r.status === 'Confirmed' && (
                  <>
                    <button
                      onClick={() => handleDownloadTicket(r)}
                      disabled={downloadingId === r._id}
                      className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Download size={14} />
                      {downloadingId === r._id ? 'Downloading...' : 'Ticket PDF'}
                    </button>
                    <Link to="/dashboard/attendance" className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5">
                      <QrCode size={14} /> QR Pass
                    </Link>
                  </>
                )}

                {r.status !== 'Cancelled' && (
                  <button
                    onClick={() => setRatingTarget(r)}
                    className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1 text-amber-500 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  >
                    <Star size={14} className="fill-amber-400 text-amber-400" /> Rate Event
                  </button>
                )}

                {r.status !== 'Cancelled' && (
                  <button onClick={() => setTarget(r)} className="btn-danger !py-1.5 !px-3 text-xs">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating & Review Modal */}
      {ratingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-1">Rate "{ratingTarget.event?.title}"</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Share your feedback and experience to help fellow students.</p>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div>
                <label className="label mb-2">Overall Rating</label>
                <div className="flex gap-2 justify-center py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Review / Feedback (Optional)</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you enjoy about this event?"
                  className="input text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingTarget(null)}
                  className="btn-secondary !py-2 !px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="btn-primary !py-2 !px-4 text-xs"
                >
                  {submittingRating ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!target} danger title="Cancel this registration?"
        description={target ? `You'll lose your spot for "${target.event?.title}". If someone is waitlisted, they'll be promoted automatically.` : ''}
        confirmLabel="Cancel Registration" onCancel={() => setTarget(null)} onConfirm={cancel}
      />
    </div>
  );
}

