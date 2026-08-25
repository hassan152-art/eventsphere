import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-[70vh] grid place-items-center text-center px-4">
      <div>
        <div className="mx-auto h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 grid place-items-center mb-5">
          <ShieldAlert size={28} className="text-danger" />
        </div>
        <h1 className="text-2xl font-bold">Access restricted</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">You don't have permission to view this page.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
      </div>
    </div>
  );
}
