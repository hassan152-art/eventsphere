import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { lookupService } from '../../services/eventService';

const initialForm = {
  fullName: '', email: '', contactNumber: '', department: '', enrollmentNumber: '',
  password: '', confirmPassword: '',
};

// Defined at module scope (not inside Register) so it's the same component
// type across re-renders. Defining it inside Register recreates the function
// on every keystroke, causing React to unmount/remount the <input> and drop
// focus after a single character - that was the bug.
function Field({ label, type = 'text', value, error, onChange, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children || <input type={type} value={value} onChange={onChange} className="input" />}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
    lookupService.departments().then(({ data }) => setDepartments(data.departments)).catch(() => {});
  }, [isAuthenticated]);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.contactNumber.trim()) errs.contactNumber = 'Contact number is required';
    if (!form.department) errs.department = 'Select a department';
    if (!form.enrollmentNumber.trim()) errs.enrollmentNumber = 'Enrollment number is required';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to EventSphere.');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center bg-hero-gradient text-white p-16">
        <span className="h-12 w-12 rounded-2xl bg-white/20 grid place-items-center mb-6"><Sparkles size={22} /></span>
        <h2 className="text-3xl font-extrabold leading-tight">Join thousands of students on EventSphere</h2>
        <p className="text-white/80 mt-3 max-w-sm">Register for events, track your certificates, and never miss a campus moment again.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="w-full max-w-md space-y-4">
          <div>
            <h1 className="text-2xl font-extrabold">Create your account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">It only takes a minute</p>
          </div>

          <Field label="Full Name" value={form.fullName} error={errors.fullName} onChange={update('fullName')} />
          <Field label="Email" type="email" value={form.email} error={errors.email} onChange={update('email')} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact Number" value={form.contactNumber} error={errors.contactNumber} onChange={update('contactNumber')} />
            <Field label="Enrollment Number" value={form.enrollmentNumber} error={errors.enrollmentNumber} onChange={update('enrollmentNumber')} />
          </div>
          <Field label="Department" error={errors.department}>
            <select value={form.department} onChange={update('department')} className="input">
              <option value="">Select department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Password" type="password" value={form.password} error={errors.password} onChange={update('password')} />
            <Field label="Confirm Password" type="password" value={form.confirmPassword} error={errors.confirmPassword} onChange={update('confirmPassword')} />
          </div>

          <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating account...' : 'Create Account'}</button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Log in</Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
