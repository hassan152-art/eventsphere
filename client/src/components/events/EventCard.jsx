import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Bookmark } from 'lucide-react';
import StatusBadge from './StatusBadge';
import SeatAvailability from './SeatAvailability';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop';

export default function EventCard({ event, onToggleBookmark }) {
  const { isAuthenticated, user } = useAuth();

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast('Please login to bookmark events');
    try {
      const { data } = await userService.toggleBookmark(event._id);
      toast.success(data.bookmarked ? 'Saved to your bookmarks' : 'Removed from bookmarks');
      onToggleBookmark?.(event._id, data.bookmarked);
    } catch {
      toast.error('Something went wrong');
    }
  };

  const isBookmarked = user?.bookmarkedEvents?.includes(event._id);

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }} className="card overflow-hidden group">
      <Link to={`/events/${event.slug}`}>
        <div className="relative h-44 overflow-hidden">
          <img
            src={event.bannerUrl || FALLBACK_IMG}
            alt={event.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="badge bg-white/90 text-brand-700 backdrop-blur">{event.eventType}</span>
          </div>
          <button
            onClick={handleBookmark}
            className={`absolute top-3 right-3 h-8 w-8 rounded-full grid place-items-center backdrop-blur ${
              isBookmarked ? 'bg-brand-600 text-white' : 'bg-white/90 text-slate-600'
            }`}
          >
            <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </Link>

      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <StatusBadge status={event.computedStatus} />
          {event.averageRating > 0 && (
            <span className="text-xs text-slate-400">★ {event.averageRating.toFixed(1)}</span>
          )}
        </div>

        <Link to={`/events/${event.slug}`}>
          <h3 className="font-bold text-base leading-snug line-clamp-2 hover:text-brand-600 transition-colors">
            {event.title}
          </h3>
        </Link>

        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
          <p className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(event.date).toDateString()}</p>
          <p className="flex items-center gap-1.5"><Clock size={13} /> {event.startTime}</p>
          <p className="flex items-center gap-1.5"><MapPin size={13} /> {event.venue}</p>
          <p className="flex items-center gap-1.5"><User size={13} /> {event.organizer?.fullName || 'EventSphere'}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-white/5">
          <SeatAvailability seatsRemaining={event.seatsRemaining} maxParticipants={event.maxParticipants} waitlistEnabled={event.waitlistEnabled} />
          <Link to={`/events/${event.slug}`} className="btn-primary !px-3 !py-1.5 text-xs">
            {event.seatsRemaining > 0 ? 'Register' : event.waitlistEnabled ? 'Join Waitlist' : 'View'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
