import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

import Heatmap from '../components/Heatmap';

export default function Dashboard() {
  const { data, error } = useSWR('/api/health', fetcher, { refreshInterval: 5000 });

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      {error && <div className="text-danger">Failed to load health data.</div>}
      {data ? (
        <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-medium mb-2">Running Simulations</h3>
            <p>{data.running_simulations}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-medium mb-2">Coverage Score</h3>
            <p>{data.coverage_score}%</p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-medium mb-2">Avg. Time‑to‑Evidence</h3>
            <p>{data.avg_tte}s</p>
          </div>
        </div>
        {/* Heatmap */}
        <div className="mt-8">
          <h3 className="text-xl font-medium mb-2">Coverage Heatmap</h3>
          <Heatmap />
        </div>
        {/* Financial Impact */}
        <div className="mt-6">
          <h3 className="text-xl font-medium mb-2">Financial Impact</h3>
          <div className="w-full bg-gray-800 rounded h-4 overflow-hidden">
            <div className="bg-green-600 h-4" style={{ width: `${data?.coverage_score || 0}%` }} />
          </div>
          <p className="mt-1 text-sm">Estimated monthly loss reduction: ${Math.round((data?.coverage_score || 0) * 100)}</p>
        </div>
        </>
      ) : (
        <div className="text-info">Loading...</div>
      )}
      <div className="mt-6">
        <Link href="/simulations" className="text-primary underline">
          Run a new simulation →
        </Link>
      </div>
    </div>
  );
}
