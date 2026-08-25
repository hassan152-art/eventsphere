import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="text-xl font-extrabold">Reset your password</h1>
        {sent ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
            If an account exists for <strong>{email}</strong>, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" />
              </div>
            </div>
            <button disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send reset link'}</button>
          </form>
        )}
        <Link to="/login" className="block text-center text-sm text-brand-600 mt-5 hover:underline">Back to login</Link>
      </div>
    </div>
  );
}
