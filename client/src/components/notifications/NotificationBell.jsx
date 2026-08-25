import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { notificationService } from '../../services/userService';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const load = async () => {
    try {
      const { data } = await notificationService.mine();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // silent - notification bell shouldn't break the page
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // light polling for "real-time" updates
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markAllRead = async () => {
    await notificationService.markAllRead();
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="btn-ghost !p-2.5 relative" aria-label="Notifications">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-danger text-white text-[10px] grid place-items-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 mt-2 w-80 card p-0 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5">
              <p className="font-semibold text-sm">Notifications</p>
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-brand-600 hover:underline">
                <CheckCheck size={13} /> Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">You're all caught up.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className={`px-4 py-3 border-b border-slate-50 dark:border-white/5 text-sm ${!n.isRead ? 'bg-brand-50/60 dark:bg-brand-900/20' : ''}`}>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{n.message}</p>
                    <p className="text-slate-400 text-[11px] mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
