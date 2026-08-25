import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { userService } from '../../services/userService';
import EventCard from '../../components/events/EventCard';
import EmptyState from '../../components/ui/EmptyState';
import { GridSkeleton } from '../../components/ui/LoadingSkeleton';

export default function SavedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    userService.bookmarks().then(({ data }) => setEvents(data.events)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Saved Events</h1>
      {loading ? <GridSkeleton count={3} /> : events.length === 0 ? (
        <EmptyState icon={Bookmark} title="Save events to find them quickly later." actionLabel="Discover Events" actionTo="/dashboard/discover" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => <EventCard key={e._id} event={e} onToggleBookmark={load} />)}
        </div>
      )}
    </div>
  );
}
