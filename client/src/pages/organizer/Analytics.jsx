import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { organizerService } from '../../services/userService';

export default function Analytics() {
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    organizerService.dashboard().then(({ data }) => setCharts(data.charts));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Analytics</h1>
      <div className="card p-5">
        <h2 className="font-bold mb-4">Registrations by event</h2>
        {charts?.registrationTrends?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={charts.registrationTrends}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="event" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="registrations" fill="#9333ea" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-slate-400">No data yet.</p>}
      </div>
    </div>
  );
}
