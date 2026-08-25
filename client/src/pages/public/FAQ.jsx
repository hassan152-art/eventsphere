import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  { q: 'Who can register for events?', a: 'Any student with a valid college email can create an account and register for events, subject to eligibility rules.' },
  { q: 'What happens if an event is full?', a: 'If waitlisting is enabled, you\'ll join the waitlist and be promoted automatically if a spot opens up.' },
  { q: 'How does QR attendance work?', a: 'A unique QR pass is generated once your registration is confirmed. Organizers scan it at check-in.' },
  { q: 'How do I download my certificate?', a: 'Go to your dashboard\'s Certificates tab once the organizer has issued it after the event.' },
  { q: 'Can I cancel my registration?', a: 'Yes - cancel anytime before the event from My Registrations. Your seat is released to the waitlist.' },
  { q: 'Who approves new events?', a: 'All events submitted by organizers require admin approval before they appear publicly.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="text-3xl font-extrabold text-center">Frequently Asked Questions</h1>
      <div className="space-y-3 mt-10">
        {FAQS.map((f, i) => (
          <div key={f.q} className="card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
              <span className="font-semibold text-sm">{f.q}</span>
              <ChevronDown size={16} className={`transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <p className="px-5 pb-4 text-sm text-slate-500 dark:text-slate-400">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
