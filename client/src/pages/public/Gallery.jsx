import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';

const CATEGORIES = ['Cultural Events', 'Technical Fests', 'Sports Meets', 'Annual Day', 'Workshops', 'Seminars', 'Competitions'];

export default function Gallery() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/media', { params: { category: category || undefined, search: search || undefined } })
      .then(({ data }) => setMedia(data.data.media))
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }, [category, search]);

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
            <motion.button
              key={m._id} onClick={() => setLightbox(m)}
              whileHover={{ scale: 1.02 }}
              className="block w-full break-inside-avoid rounded-2xl overflow-hidden shadow-soft"
            >
              <img src={m.thumbnailUrl || m.url} alt={m.caption} className="w-full object-cover" />
            </motion.button>
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
