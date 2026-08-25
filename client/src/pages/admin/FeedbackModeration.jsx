import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';

export default function FeedbackModeration() {
  const [feedback, setFeedback] = useState([]);

  const load = () => {
    api.get('/reports/feedback').then(({ data }) => setFeedback(data.data.rows));
  };
  useEffect(load, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Feedback Moderation</h1>
      {feedback.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No feedback submitted yet" />
      ) : (
        <div className="space-y-3">
          {feedback.map((f, i) => (
            <div key={i} className="card p-4">
              <p className="font-semibold text-sm">{f.event} · {f.student}</p>
              <p className="text-xs text-slate-500 mt-1">Overall rating: {f.overallRating}/5</p>
              {f.comment && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{f.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
