import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset successfully. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <form onSubmit={submit} className="card p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-extrabold">Set a new password</h1>
        <div>
          <label className="label">New password</label>
          <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Updating...' : 'Update password'}</button>
      </form>
    </div>
  );
}
