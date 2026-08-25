import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { eventService, lookupService } from '../../services/eventService';
import EventCard from '../../components/events/EventCard';
import StatusBadge from '../../components/events/StatusBadge';
import SeatAvailability from '../../components/events/SeatAvailability';
import { GridSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { Link } from 'react-router-dom';

const EVENT_TYPES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Annual Day', 'Intercollegiate'];
const STATUSES = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

let debounceTimer;

export default function EventDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    eventType: searchParams.get('eventType') || '',
    category: searchParams.get('category') || '',
    department: searchParams.get('department') || '',
    status: searchParams.get('status') || '',
    sort: '-date',
  });

  useEffect(() => {
    lookupService.categories().then(({ data }) => setCategories(data.categories)).catch(() => {});
    lookupService.departments().then(({ data }) => setDepartments(data.departments)).catch(() => {});
  }, []);

  const fetchEvents = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries({ ...filters, page, limit: 9 }).filter(([, v]) => v));
    eventService
      .list(params)
      .then(({ data }) => { setEvents(data.events); setTotal(data.total); })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchEvents, 350);
    return () => clearTimeout(debounceTimer);
  }, [fetchEvents]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">Discover Events</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{total} event{total !== 1 ? 's' : ''} found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters */}
        <aside className={`lg:w-64 shrink-0 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="card p-4 space-y-5 sticky top-24">
            <div>
              <label className="label">Search</label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} placeholder="Search events..." className="input pl-9 !py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="label">Status</label>
              <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className="input !py-2 text-sm">
                <option value="">All</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Event Type</label>
              <select value={filters.eventType} onChange={(e) => updateFilter('eventType', e.target.value)} className="input !py-2 text-sm">
                <option value="">All types</option>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Category</label>
              <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} className="input !py-2 text-sm">
                <option value="">All categories</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Department</label>
              <select value={filters.department} onChange={(e) => updateFilter('department', e.target.value)} className="input !py-2 text-sm">
                <option value="">All departments</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Sort by</label>
              <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="input !py-2 text-sm">
                <option value="-date">Date (soonest)</option>
                <option value="date">Date (latest)</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setFiltersOpen((v) => !v)} className="btn-secondary lg:hidden !py-2 text-sm">
              <SlidersHorizontal size={15} /> Filters
            </button>
            <div className="ml-auto flex gap-1 bg-slate-100 dark:bg-white/5 rounded-lg p-1">
              <button onClick={() => setView('grid')} className={`p-1.5 rounded-md ${view === 'grid' ? 'bg-white dark:bg-white/10 shadow-soft' : ''}`}><LayoutGrid size={15} /></button>
              <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-white dark:bg-white/10 shadow-soft' : ''}`}><List size={15} /></button>
            </div>
          </div>

          {loading ? (
            <GridSkeleton count={6} />
          ) : events.length === 0 ? (
            <EmptyState title="No events match your filters" description="Try adjusting your search or filters to see more results." />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((e) => <EventCard key={e._id} event={e} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((e) => (
                <Link key={e._id} to={`/events/${e.slug}`} className="card p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
                  <img src={e.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=200&auto=format&fit=crop'} className="h-16 w-16 rounded-xl object-cover shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1"><StatusBadge status={e.computedStatus} /></div>
                    <p className="font-semibold truncate">{e.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(e.date).toDateString()} · {e.venue}</p>
                  </div>
                  <SeatAvailability seatsRemaining={e.seatsRemaining} maxParticipants={e.maxParticipants} waitlistEnabled={e.waitlistEnabled} />
                </Link>
              ))}
            </div>
          )}

          {total > 9 && (
            <div className="flex justify-center gap-2 mt-10">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary !px-4 !py-2 text-sm">Previous</button>
              <span className="px-4 py-2 text-sm text-slate-500">Page {page} of {Math.ceil(total / 9)}</span>
              <button disabled={page >= Math.ceil(total / 9)} onClick={() => setPage((p) => p + 1)} className="btn-secondary !px-4 !py-2 text-sm">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
