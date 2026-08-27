import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { LogoMark } from '../ui/Logo';

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshops', 'Seminars', 'Competitions'];

export default function Footer() {
  return (
    <footer className="bg-navy text-slate-300 mt-24">
      <div className="container-page py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-white">
            <LogoMark size={32} />
            EventSphere
          </Link>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Your college's central hub for events, competitions, workshops, cultural fests and unforgettable campus experiences.
          </p>
          <div className="flex gap-3 mt-5">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 grid place-items-center rounded-lg bg-white/5 hover:bg-brand-600 transition-colors">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {['Home', 'Events', 'Gallery', 'About', 'Contact', 'FAQ'].map((l) => (
              <li key={l}><Link to={l === 'Home' ? '/' : `/${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Event Categories</h4>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c}><Link to={`/events?category=${c}`} className="hover:text-white transition-colors">{c}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /> Main Campus, College Road</li>
            <li className="flex items-center gap-2"><Mail size={16} /> hello@eventsphere.com</li>
            <li className="flex items-center gap-2"><Phone size={16} /> +1 (555) 010-2030</li>
          </ul>
          <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email" className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
            <button className="btn-primary !px-4 !py-2 text-sm">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} EventSphere. All rights reserved.
      </div>
    </footer>
  );
}
