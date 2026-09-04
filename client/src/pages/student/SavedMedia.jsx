import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Image as ImageIcon, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';
import EmptyState from '../../components/ui/EmptyState';
import { GridSkeleton } from '../../components/ui/LoadingSkeleton';

export default function SavedMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  const load = () => {
    setLoading(true);
    userService.savedMedia().then(({ data }) => setMedia(data.media)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const unsave = async (e, mediaId) => {
    e.stopPropagation();
    try {
      const { data } = await userService.toggleSavedMedia(mediaId);
      if (!data.saved) {
        setMedia((prev) => prev.filter((m) => m._id !== mediaId));
        toast.success('Removed from saved media');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Saved Media</h1>
      {loading ? (
        <GridSkeleton count={3} />
      ) : media.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No saved media yet" description="Save your favorite photos and videos from the gallery to find them here." actionLabel="Browse Gallery" actionTo="/gallery" />
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {media.map((m) => (
            <div key={m._id} className="relative block w-full break-inside-avoid rounded-2xl overflow-hidden shadow-soft group">
              <button onClick={() => setLightbox(m)} className="block w-full">
                <img src={m.thumbnailUrl || m.url} alt={m.caption} className="w-full object-cover" />
              </button>
              <button
                onClick={(e) => unsave(e, m._id)}
                title="Remove from saved"
                className="absolute top-2 right-2 h-8 w-8 rounded-full grid place-items-center backdrop-blur bg-brand-600 text-white"
              >
                <Heart size={14} fill="currentColor" />
              </button>
            </div>
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
