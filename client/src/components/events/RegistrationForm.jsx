import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  X,
  User,
  Mail,
  Hash,
  Phone,
  Building2,
  GraduationCap,
  AlertTriangle,
} from 'lucide-react';
import { registrationService } from '../../services/registrationService';
import Select from '../ui/Select';

const DEPARTMENT_OPTIONS = [
  { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Electrical Engineering', label: 'Electrical Engineering' },
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Other', label: 'Other' },
];

const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const n = i + 1;
  const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
  return { value: String(n), label: `${n}${suffix} Semester` };
});

export default function RegistrationForm({ event, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    rollNumber: '',
    phone: '',
    department: '',
    semester: '',
  });

  // Resolve the event ID up front so we can fail fast with a clear message
  // instead of letting the user fill out the whole form before finding out
  // the modal was opened without a valid event. Supports a few common
  // shapes in case the parent passes the raw event, a wrapper object, or
  // just an id string.
  const eventId =
    typeof event === 'string'
      ? event
      : event?._id || event?.id || event?.eventId || event?.event?._id || event?.event?.id;

  // If this modal is ever opened without a resolvable event, that's a bug
  // in whatever rendered <RegistrationForm />, not something the user can
  // fix by filling in the form - so show that plainly and let them close it,
  // rather than accepting input that can never submit successfully.
  if (!eventId) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-white/10 shadow-2xl p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-red-500/10 text-red-400 grid place-items-center mb-4">
            <AlertTriangle size={22} />
          </div>
          <h2 className="text-lg font-bold text-white">Couldn't open this form</h2>
          <p className="text-sm text-slate-400 mt-2">
            No event was passed to the registration form (the <code>event</code> prop is missing or empty).
            This means the component that opened this modal isn't passing the event data - check that call site
            rather than retrying here.
          </p>
          <button onClick={onClose} className="btn-primary w-full mt-5">Close</button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setField = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['fullName', 'email', 'rollNumber', 'phone', 'department', 'semester'];
    const missingField = requiredFields.find((field) => !String(form[field] ?? '').trim());
    if (missingField) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    // Allows +, digits, spaces and hyphens; requires at least 10 digits
    // total so both local (03XXXXXXXXX) and international (+92...) formats
    // are accepted.
    const digitCount = form.phone.replace(/\D/g, '').length;
    const phoneCharsValid = /^[0-9+\-\s]+$/.test(form.phone.trim());
    if (!phoneCharsValid || digitCount < 10 || digitCount > 15) {
      toast.error('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    try {
      await registrationService.register(eventId, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        rollNumber: form.rollNumber.trim(),
        phone: form.phone.trim(),
        department: form.department,
        semester: form.semester,
      });

      toast.success('Registration successful!');
      onSuccess?.();
      onClose?.();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-white/10 shadow-2xl">
        <div className="sticky top-0 z-10 bg-slate-950 border-b border-white/10 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Event Registration</h2>
            <p className="text-sm text-slate-400 mt-1">Register for {event?.title || 'this event'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 w-10 rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white grid place-items-center transition disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text" name="fullName" required value={form.fullName} onChange={handleChange}
                placeholder="Enter your full name" className="input w-full pl-10" disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email" name="email" required value={form.email} onChange={handleChange}
                placeholder="student@example.com" className="input w-full pl-10" disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Roll Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text" name="rollNumber" required value={form.rollNumber} onChange={handleChange}
                placeholder="e.g. 2024-CS-123" className="input w-full pl-10" disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="tel" name="phone" required value={form.phone} onChange={handleChange}
                placeholder="03XXXXXXXXX" className="input w-full pl-10" disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Department <span className="text-red-400">*</span>
            </label>
            <Select
              icon={Building2}
              value={form.department}
              onChange={setField('department')}
              placeholder="Select Department"
              options={DEPARTMENT_OPTIONS}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Semester <span className="text-red-400">*</span>
            </label>
            <Select
              icon={GraduationCap}
              value={form.semester}
              onChange={setField('semester')}
              placeholder="Select Semester"
              options={SEMESTER_OPTIONS}
              disabled={loading}
            />
          </div>

          <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
            <p className="text-sm text-violet-200">
              <span className="text-red-400">*</span> All fields are required to complete your registration.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose} disabled={loading}
              className="flex-1 rounded-xl border border-violet-500/60 px-5 py-3 font-semibold text-violet-200 hover:bg-violet-500/10 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50">
              {loading ? 'Registering...' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
