import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, MapPin, Users, Bookmark, Share2, CalendarPlus,
  Facebook, Linkedin, Mail, MessageCircle, Twitter, Star,
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import StatusBadge from '../../components/events/StatusBadge';
import SeatAvailability from '../../components/events/SeatAvailability';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200&auto=format&fit=crop';

export default function EventDetails() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = () => {
    eventService.getBySlug(slug).then(({ data }) => {
      setEvent(data.event);
      eventService.feedback(data.event._id).then(({ data: fd }) => setFeedback(fd.feedback)).catch(() => {});
    }).catch(() => setEvent(null)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [slug]);

  const handleRegister = async () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/events/${slug}` } } });
    setRegistering(true);
    try {
      const { message } = await registrationService.register(event._id);
      toast.success(message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return toast('Please login to bookmark events');
    const { data } = await userService.toggleBookmark(event._id);
    toast.success(data.bookmarked ? 'Saved to your bookmarks' : 'Removed from bookmarks');
  };

  const shareText = event ? encodeURIComponent(`Check out "${event.title}" on EventSphere!`) : '';
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><div className="h-10 w-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" /></div>;
  if (!event) return <div className="container-page py-24 text-center">Event not found.</div>;

  return (
    <div>
      <div className="relative h-72 sm:h-96">
        <img src={event.bannerUrl || FALLBACK_IMG} className="h-full w-full object-cover" alt={event.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container-page pb-8 text-white">
          <div className="flex items-center gap-2 mb-3"><StatusBadge status={event.computedStatus} /><span className="badge bg-white/20 backdrop-blur">{event.eventType}</span></div>
          <h1 className="text-2xl sm:text-4xl font-extrabold max-w-2xl">{event.title}</h1>
        </div>
      </div>

      <div className="container-page py-10 grid lg:grid-cols-[1fr_340px] gap-10">
        <div className="space-y-8 min-w-0">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <p className="flex items-center gap-2"><Calendar size={16} className="text-brand-600" /> {new Date(event.date).toDateString()}</p>
            <p className="flex items-center gap-2"><Clock size={16} className="text-brand-600" /> {event.startTime} - {event.endTime}</p>
            <p className="flex items-center gap-2"><MapPin size={16} className="text-brand-600" /> {event.venue}</p>
            <p className="flex items-center gap-2"><Users size={16} className="text-brand-600" /> {event.department?.name}</p>
          </div>

          <section>
            <h2 className="text-lg font-bold mb-2">About this event</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{event.description}</p>
          </section>

          {event.rules && (
            <section>
              <h2 className="text-lg font-bold mb-2">Rules & Guidelines</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{event.rules}</p>
            </section>
          )}

          {event.schedule?.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Schedule</h2>
              <div className="space-y-3">
                {event.schedule.map((s, i) => (
                  <div key={i} className="flex gap-4 card p-4">
                    <span className="text-brand-600 font-semibold text-sm shrink-0">{s.time}</span>
                    <div><p className="font-medium text-sm">{s.title}</p><p className="text-xs text-slate-500">{s.description}</p></div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-bold mb-2">Organizer</h2>
            <div className="card p-4 flex items-center gap-3">
              <span className="h-11 w-11 rounded-full bg-hero-gradient text-white grid place-items-center font-bold">{event.organizer?.fullName?.[0]}</span>
              <div><p className="font-semibold text-sm">{event.organizer?.fullName}</p><p className="text-xs text-slate-500">{event.organizer?.email}</p></div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              Reviews {event.ratingCount > 0 && <span className="text-sm text-slate-400 font-normal">({event.averageRating.toFixed(1)} · {event.ratingCount} reviews)</span>}
            </h2>
            {feedback.length === 0 ? (
              <p className="text-sm text-slate-400">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {feedback.map((f) => (
                  <div key={f._id} className="card p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{f.student?.fullName}</p>
                      <span className="flex items-center gap-1 text-amber-500 text-xs"><Star size={13} fill="currentColor" /> {f.overallRating}</span>
                    </div>
                    {f.comment && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">{f.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card p-5 sticky top-24">
            <SeatAvailability seatsRemaining={event.seatsRemaining} maxParticipants={event.maxParticipants} waitlistEnabled={event.waitlistEnabled} />
            <p className="text-xs text-slate-400 mt-1">Registration closes {new Date(event.registrationDeadline).toDateString()}</p>

            <button
              onClick={() => setConfirmOpen(true)}
              disabled={registering || event.computedStatus === 'Completed' || event.computedStatus === 'Cancelled' || (event.seatsRemaining <= 0 && !event.waitlistEnabled)}
              className="btn-primary w-full mt-4"
            >
              {event.seatsRemaining > 0 ? 'Register Now' : event.waitlistEnabled ? 'Join Waitlist' : 'Registration Full'}
            </button>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <button onClick={handleBookmark} className="btn-secondary !px-0 !py-2 text-xs flex-col gap-1"><Bookmark size={15} /> Save</button>
              <a href={`/api/calendar/${event._id}.ics`} className="btn-secondary !px-0 !py-2 text-xs flex-col gap-1"><CalendarPlus size={15} /> Calendar</a>
              <button onClick={() => navigator.share ? navigator.share({ title: event.title, url: window.location.href }) : toast('Use the icons below to share')} className="btn-secondary !px-0 !py-2 text-xs flex-col gap-1"><Share2 size={15} /> Share</button>
            </div>

            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noreferrer" className="h-9 w-9 grid place-items-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-emerald-100"><MessageCircle size={15} /></a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="h-9 w-9 grid place-items-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-blue-100"><Facebook size={15} /></a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noreferrer" className="h-9 w-9 grid place-items-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-blue-100"><Linkedin size={15} /></a>
              <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noreferrer" className="h-9 w-9 grid place-items-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200"><Twitter size={15} /></a>
              <a href={`mailto:?subject=${shareText}&body=${shareUrl}`} className="h-9 w-9 grid place-items-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200"><Mail size={15} /></a>
            </div>
          </div>

          {event.rulebookUrl && (
            <a href={event.rulebookUrl} target="_blank" rel="noreferrer" className="card p-4 flex items-center justify-between text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5">
              Download Rulebook <span>→</span>
            </a>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={event.seatsRemaining > 0 ? 'Confirm registration' : 'Join the waitlist?'}
        description={event.seatsRemaining > 0 ? `You're about to register for "${event.title}".` : `This event is full. You'll be added to the waitlist and notified if a spot opens up.`}
        confirmLabel={event.seatsRemaining > 0 ? 'Register' : 'Join Waitlist'}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); handleRegister(); }}
      />
    </div>
  );
}
