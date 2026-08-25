import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { adminService } from '../../services/userService';
import EmptyState from '../../components/ui/EmptyState';
import { Image as ImageIcon } from 'lucide-react';

export default function GalleryModeration() {
  const [media, setMedia] = useState([]);

  const load = () => {
    api.get('/media', { params: { category: undefined } }).then(({ data }) => setMedia(data.data.media));
  };
  useEffect(load, []);

  const moderate = async (id, moderationStatus) => {
    await api.patch(`/admin/media/${id}/moderate`, { moderationStatus });
    toast.success(`Media ${moderationStatus.toLowerCase()}`);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Gallery Moderation</h1>
      {media.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No media uploads yet" />
      ) : (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((m) => (
            <div key={m._id} className="card overflow-hidden">
              <img src={m.url} className="h-32 w-full object-cover" alt={m.caption} />
              <div className="p-3">
                <p className="text-xs font-medium truncate">{m.caption || m.category}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => moderate(m._id, 'Approved')} className="btn-primary !py-1 !px-2 text-[11px] flex-1">Approve</button>
                  <button onClick={() => moderate(m._id, 'Rejected')} className="btn-danger !py-1 !px-2 text-[11px] flex-1">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
