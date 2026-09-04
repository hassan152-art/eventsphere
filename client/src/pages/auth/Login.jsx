import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, verifyTwoFactor, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Admin two-factor step: once credentials are verified, an OTP is emailed
  // and the user must enter it here before a session is created.
  const [twoFactorEmail, setTwoFactorEmail] = useState(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result.requiresTwoFactor) {
        setTwoFactorEmail(result.email);
        toast.success('Verification code sent to your email');
      } else {
        toast.success('Welcome back!');
        navigate(location.state?.from?.pathname || '/', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const submitTwoFactor = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await verifyTwoFactor(twoFactorEmail, code);
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (twoFactorEmail) {
    return (
      <div className="min-h-[80vh] grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center bg-hero-gradient text-white p-16">
          <span className="h-12 w-12 rounded-2xl bg-white/20 grid place-items-center mb-6"><ShieldCheck size={22} /></span>
          <h2 className="text-3xl font-extrabold leading-tight">Two-factor verification</h2>
          <p className="text-white/80 mt-3 max-w-sm">Admin accounts are protected with an extra verification step to keep the platform secure.</p>
        </div>
        <div className="flex items-center justify-center p-6 sm:p-12">
          <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={submitTwoFactor} className="w-full max-w-sm space-y-5">
            <div>
              <h1 className="text-2xl font-extrabold">Enter verification code</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We sent a 6-digit code to <span className="font-medium">{twoFactorEmail}</span>. It expires in 10 minutes.</p>
            </div>
            <div>
              <label className="label">Verification code</label>
              <input
                required inputMode="numeric" maxLength={6} autoFocus
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="input text-center tracking-[0.5em] text-lg" placeholder="000000"
              />
            </div>
            <button disabled={verifying || code.length !== 6} className="btn-primary w-full">
              {verifying ? 'Verifying...' : 'Verify & Log in'}
            </button>
            <button type="button" onClick={() => { setTwoFactorEmail(null); setCode(''); }} className="text-sm text-slate-500 hover:underline w-full text-center">
              Back to login
            </button>
            <div className="card p-3 text-xs text-slate-500 dark:text-slate-400">
              <p className="font-semibold mb-1">Dev tip</p>
              <p>If email (SMTP) isn't configured, the code is also printed in the server console/terminal logs.</p>
            </div>
          </motion.form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center bg-hero-gradient text-white p-16">
        <span className="h-12 w-12 rounded-2xl bg-white/20 grid place-items-center mb-6"><Sparkles size={22} /></span>
        <h2 className="text-3xl font-extrabold leading-tight">Welcome back to EventSphere</h2>
        <p className="text-white/80 mt-3 max-w-sm">Pick up right where you left off - registrations, certificates, and your next event are all one login away.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-2xl font-extrabold">Log in</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your credentials to continue</p>
          </div>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-0" />
              <input required type="email" name="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input pl-10 relative z-10 bg-transparent" placeholder="you@college.edu" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="label">Password</label>
              <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-0" />
              <input required type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input pl-10 pr-10 relative z-10 bg-transparent" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button disabled={loading} className="btn-primary w-full">{loading ? 'Logging in...' : 'Log in'}</button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account? <Link to="/register" className="text-brand-600 font-semibold hover:underline">Register</Link>
          </p>

          <div className="card p-3 text-xs text-slate-500 dark:text-slate-400">
            <p className="font-semibold mb-1">Demo credentials</p>
            <p>Student: student@eventsphere.com / Student@12345</p>
            <p>Organizer: organizer@eventsphere.com / Organizer@12345</p>
            <p>Admin: admin@eventsphere.com / Admin@12345</p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
