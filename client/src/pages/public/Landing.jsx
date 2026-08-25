import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Calendar, Bell, QrCode, Award, BellRing, BarChart3,
  Cpu, Music, Trophy, Wrench, Presentation, Medal, PartyPopper, Globe,
  ChevronDown, MapPin, Users2,
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import EventCard from '../../components/events/EventCard';
import { GridSkeleton } from '../../components/ui/LoadingSkeleton';

const CATEGORY_ICONS = {
  Technical: Cpu, Cultural: Music, Sports: Trophy, Workshops: Wrench,
  Seminars: Presentation, Competitions: Medal, 'Annual Day': PartyPopper, 'Intercollegiate Events': Globe,
};

const WHY_ITEMS = [
  { icon: Calendar, title: 'Easy Registration', desc: 'Register for any event in a couple of taps, with instant confirmation.' },
  { icon: BarChart3, title: 'Real-Time Availability', desc: 'Live seat counts so you always know exactly where you stand.' },
  { icon: QrCode, title: 'QR Attendance', desc: 'Skip the paper sign-in sheets - just scan and go.' },
  { icon: Award, title: 'Digital Certificates', desc: 'Download verified certificates the moment they are issued.' },
  { icon: BellRing, title: 'Event Notifications', desc: 'Reminders, schedule changes, and waitlist updates, instantly.' },
  { icon: Users2, title: 'Smart Analytics', desc: 'Organizers and admins get real dashboards, not spreadsheets.' },
];

const STATS = [
  { label: 'Events Hosted', value: 500, suffix: '+' },
  { label: 'Students', value: 10000, suffix: '+' },
  { label: 'Organizers', value: 50, suffix: '+' },
  { label: 'Departments', value: 25, suffix: '+' },
];

const FAQS = [
  { q: 'Who can register for events?', a: 'Any student with a valid college email can create an account and register for events, subject to each event\'s eligibility rules.' },
  { q: 'What happens if an event is full?', a: 'If waitlisting is enabled, you\'ll be added to the waitlist and automatically promoted if a confirmed participant cancels.' },
  { q: 'How does QR attendance work?', a: 'Once your registration is confirmed, a unique QR pass is generated. Organizers scan it at the venue to mark your attendance instantly.' },
  { q: 'How do I get my certificate?', a: 'After the event, eligible participants can download their certificate directly from the Certificates tab in their dashboard.' },
];

function AnimatedNumber({ value, suffix }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const duration = 1400;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setN(Math.floor(progress * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{n.toLocaleString()}{suffix}</span>;
}

export default function Landing() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    eventService
      .list({ sort: '-date', limit: 6, status: 'Upcoming' })
      .then(({ data }) => setFeatured(data.events))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-gradient text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="container-page relative py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1]">
              Discover. Participate. <span className="text-white/80">Experience.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 text-lg text-white/85 max-w-lg">
              Your college's central hub for events, competitions, workshops, cultural fests and unforgettable campus experiences.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex flex-wrap gap-3">
              <Link to="/events" className="btn bg-white text-brand-700 px-6 py-3 hover:bg-slate-50 shadow-lg">
                Explore Events <ArrowRight size={16} />
              </Link>
              <Link to="/register" className="btn border border-white/40 text-white px-6 py-3 hover:bg-white/10">
                Create an Account
              </Link>
            </motion.div>
          </div>

          <div className="relative hidden lg:block h-96">
            <motion.div animate={{ y: [0, -14, 0] }} transition={{ repeat: Infinity, duration: 5 }}
              className="absolute top-4 left-4 w-64 card !bg-white/95 p-4">
              <p className="text-xs font-semibold text-brand-600 mb-1">Upcoming Event</p>
              <p className="font-bold text-navy">CodeStorm 2026</p>
              <p className="text-xs text-slate-500 mt-1">24hr Hackathon · 120 seats</p>
            </motion.div>
            <motion.div animate={{ y: [0, 14, 0] }} transition={{ repeat: Infinity, duration: 6, delay: 0.5 }}
              className="absolute bottom-8 right-0 w-60 card !bg-white/95 p-4 flex items-center gap-3">
              <span className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center"><Bell size={16} /></span>
              <div>
                <p className="text-xs font-semibold text-navy">Registration confirmed!</p>
                <p className="text-[11px] text-slate-500">Rhythms - Cultural Night</p>
              </div>
            </motion.div>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4.5, delay: 1 }}
              className="absolute bottom-24 left-16 w-52 card !bg-white/95 p-4 text-center">
              <p className="text-2xl font-extrabold text-brand-700">10,482</p>
              <p className="text-[11px] text-slate-500">students registered this term</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Featured Events</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Handpicked events happening across campus</p>
          </div>
          <Link to="/events" className="btn-secondary hidden sm:inline-flex">View all</Link>
        </div>
        {loading ? <GridSkeleton count={6} /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((e) => <EventCard key={e._id} event={e} />)}
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="bg-slate-50 dark:bg-white/[0.02] py-16">
        <div className="container-page">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center">Event Categories</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mt-1">Something for every interest</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {Object.entries(CATEGORY_ICONS).map(([name, Icon]) => (
              <Link key={name} to={`/events?eventType=${encodeURIComponent(name)}`}
                className="card p-6 text-center hover:-translate-y-1 transition-transform group">
                <div className="mx-auto h-12 w-12 rounded-xl bg-card-gradient grid place-items-center mb-3 group-hover:bg-hero-gradient transition-colors">
                  <Icon size={22} className="text-brand-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-semibold">{name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY EVENTSPHERE */}
      <section className="container-page py-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center">Why EventSphere?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {WHY_ITEMS.map((item) => (
            <div key={item.title} className="card p-6">
              <div className="h-11 w-11 rounded-xl bg-card-gradient grid place-items-center mb-4">
                <item.icon size={20} className="text-brand-600" />
              </div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-navy text-white py-16">
        <div className="container-page grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold text-brand-300"><AnimatedNumber value={s.value} suffix={s.suffix} /></p>
              <p className="text-sm text-slate-400 mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Moments from Campus</h2>
          <Link to="/gallery" className="btn-secondary hidden sm:inline-flex">Browse gallery</Link>
        </div>
        <div className="columns-2 sm:columns-3 gap-4 space-y-4">
          {[
            'photo-1540575467063-178a50c2df87', 'photo-1511578314322-379afb476865', 'photo-1523580494863-6f3031224c94',
            'photo-1517457373958-b7bdd4587205', 'photo-1531482615713-2afd69097998', 'photo-1475721027785-f74eccf877e2',
          ].map((id, i) => (
            <img key={id} src={`https://images.unsplash.com/${id}?q=80&w=500&auto=format&fit=crop`}
              className="rounded-2xl w-full break-inside-avoid shadow-soft" style={{ height: i % 2 === 0 ? 220 : 160 }} alt="Campus event" />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 dark:bg-white/[0.02] py-16">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={f.q} className="card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="font-semibold text-sm">{f.q}</span>
                  <ChevronDown size={16} className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-4 text-sm text-slate-500 dark:text-slate-400">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SITEMAP */}
      <section className="container-page py-16 border-t border-slate-100 dark:border-white/5">
        <h2 className="text-xl font-bold text-center mb-8">Site Map</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm text-center">
          {[
            { label: 'Discover Events', to: '/events' },
            { label: 'Media Gallery', to: '/gallery' },
            { label: 'About Us', to: '/about' },
            { label: 'Contact', to: '/contact' },
            { label: 'FAQ', to: '/faq' },
            { label: 'Login', to: '/login' },
            { label: 'Register', to: '/register' },
            { label: 'Student Dashboard', to: '/dashboard' },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="text-slate-500 dark:text-slate-400 hover:text-brand-600 flex items-center justify-center gap-1">
              <MapPin size={12} /> {l.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
