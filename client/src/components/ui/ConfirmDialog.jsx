import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={onCancel}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-11 w-11 rounded-xl grid place-items-center mb-4 ${danger ? 'bg-red-100 text-danger dark:bg-red-900/30' : 'bg-brand-50 text-brand-600 dark:bg-brand-900/30'}`}>
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-bold text-lg">{title}</h3>
            {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">{description}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
              <button onClick={onConfirm} className={danger ? 'btn-danger flex-1' : 'btn-primary flex-1'}>{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
