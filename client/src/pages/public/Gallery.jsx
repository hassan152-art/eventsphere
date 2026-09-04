import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Search, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/ui/EmptyState';

const CATEGORIES = ['Cultural Events', 'Technical Fests', 'Sports Meets', 'Annual Day', 'Workshops', 'Seminars', 'Competitions'];

export default function Gallery() {
  const { isAuthenticated } = useAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    api.get('/media', { params: { category: category || undefined, search: search || undefined } })
      .then(({ data }) => setMedia(data.data.media))
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }, [category, search]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSavedIds(new Set());
      return;
    }
    userService.savedMedia()
      .then(({ data }) => setSavedIds(new Set(data.media.map((m) => m._id))))
      .catch(() => {});
  }, [isAuthenticated]);

  const toggleSave = async (e, mediaId) => {
    e.stopPropagation();
    if (!isAuthenticated) return toast('Please login to save media to your profile');
    try {
      const { data } = await userService.toggleSavedMedia(mediaId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (data.saved) next.add(mediaId); else next.delete(mediaId);
        return next;
      });
      toast.success(data.saved ? 'Saved to your profile' : 'Removed from saved media');
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold">Media Gallery</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1">Relive the best moments from campus events</p>

      <div className="flex flex-wrap gap-3 mt-6">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gallery..." className="input pl-9 !py-2 text-sm w-56" />
        </div>
        <button onClick={() => setCategory('')} className={`badge !py-2 !px-3 cursor-pointer ${!category ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-white/5'}`}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`badge !py-2 !px-3 cursor-pointer ${category === c ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-white/5'}`}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 mt-8 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" style={{ height: 160 + (i % 3) * 60 }} />)}
        </div>
      ) : media.length === 0 ? (
        <EmptyState title="No media found" description="Try a different category or search term." />
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 mt-8 space-y-4">
          {media.map((m) => (
            <motion.div
              key={m._id}
              whileHover={{ scale: 1.02 }}
              className="relative block w-full break-inside-avoid rounded-2xl overflow-hidden shadow-soft group"
            >
              <button onClick={() => setLightbox(m)} className="block w-full">
                <img src={m.thumbnailUrl || m.url} alt={m.caption} className="w-full object-cover" />
              </button>
              <button
                onClick={(e) => toggleSave(e, m._id)}
                title={savedIds.has(m._id) ? 'Remove from saved' : 'Save to my profile'}
                className={`absolute top-2 right-2 h-8 w-8 rounded-full grid place-items-center backdrop-blur transition-opacity ${
                  savedIds.has(m._id) ? 'bg-brand-600 text-white opacity-100' : 'bg-white/90 text-slate-600 opacity-0 group-hover:opacity-100'
                }`}
              >
                <Heart size={14} fill={savedIds.has(m._id) ? 'currentColor' : 'none'} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 grid place-items-center p-6" onClick={() => setLightbox(null)}>
            <button className="absolute top-6 right-6 text-white"><X size={28} /></button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={lightbox.url} alt={lightbox.caption} className="max-h-[85vh] rounded-xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
