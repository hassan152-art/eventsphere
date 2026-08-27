import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../notifications/NotificationBell';
import { LogoMark } from '../ui/Logo';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
];

const dashboardPathFor = (role) =>
  role === 'admin' ? '/admin' : role === 'organizer' ? '/organizer' : '/dashboard';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-[#0B0D22]/80 backdrop-blur-lg shadow-soft border-b border-slate-100 dark:border-white/5'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-page flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
          <LogoMark size={34} />
          <span>
            <span className="bg-gradient-to-r from-brand-700 to-accent-600 dark:from-brand-300 dark:to-accent-400 bg-clip-text text-transparent">
              Event
            </span>
            <span className="bg-gradient-to-r from-accent-600 to-brand-700 dark:from-accent-400 dark:to-brand-300 bg-clip-text text-transparent">
              Sphere
            </span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-slate-50 dark:hover:bg-white/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <button onClick={toggleTheme} className="btn-ghost !p-2.5" aria-label="Toggle dark mode">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <NotificationBell />
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <span className="h-8 w-8 rounded-full bg-hero-gradient text-white grid place-items-center text-sm font-bold">
                    {user?.fullName?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <ChevronDown size={14} />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-52 card p-2"
                    >
                      <p className="px-3 py-2 text-sm font-semibold truncate">{user?.fullName}</p>
                      <p className="px-3 pb-2 text-xs text-slate-400 capitalize">{user?.role}</p>
                      <button
                        onClick={() => { setMenuOpen(false); navigate(dashboardPathFor(user.role)); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </button>
                      <button
                        onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-danger hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>

        <button className="lg:hidden btn-ghost !p-2" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#0B0D22]"
          >
            <div className="container-page py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5">
                  {link.label}
                </NavLink>
              ))}
              <div className="h-px bg-slate-100 dark:bg-white/10 my-2" />
              {isAuthenticated ? (
                <>
                  <button onClick={() => { navigate(dashboardPathFor(user.role)); setMobileOpen(false); }} className="text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5">
                    Dashboard
                  </button>
                  <button onClick={() => { logout(); setMobileOpen(false); navigate('/'); }} className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-danger">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary mx-3 mt-1">Register</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
