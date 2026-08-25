import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] grid place-items-center text-center px-4">
      <div>
        <p className="text-7xl font-extrabold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">404</p>
        <h1 className="text-2xl font-bold mt-3">Page not found</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
      </div>
    </div>
  );
}
