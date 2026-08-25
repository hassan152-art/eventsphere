import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ title, links, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarLinks = (
    <nav className="space-y-1">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? 'bg-hero-gradient text-white shadow-soft'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
            }`
          }
        >
          <l.icon size={17} />
          {l.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <h1 className="text-xl font-bold">{title}</h1>
        <button onClick={() => setMobileOpen(true)} className="btn-secondary !p-2.5"><Menu size={18} /></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="card p-3 sticky top-24">
            <h2 className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">{title}</h2>
            {SidebarLinks}
          </div>
        </aside>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)}>
              <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                className="h-full w-72 bg-white dark:bg-[#0B0D22] p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold">{title}</h2>
                  <button onClick={() => setMobileOpen(false)}><X size={20} /></button>
                </div>
                {SidebarLinks}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
