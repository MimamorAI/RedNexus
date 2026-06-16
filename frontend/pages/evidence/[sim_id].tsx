import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function EvidencePage() {
  const router = useRouter();
  const { sim_id } = router.query as { sim_id: string };
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!sim_id) return;
    fetch(`/api/evidence/${sim_id}`)
      .then(r => {
        if (!r.ok) throw new Error('Network response not ok');
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, [sim_id]);

  if (!sim_id) return <div className="p-6 text-gray-100">Loading...</div>;
  if (error) return <div className="p-6 text-danger">Failed to load evidence.</div>;
  if (!data) return <div className="p-6 text-info">Loading evidence...</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Evidence for Simulation {sim_id}</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-2 text-left">Technique</th>
            <th className="p-2 text-left">Raw Log</th>
            <th className="p-2 text-left">Sigma Rule</th>
            <th className="p-2 text-left">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item: any, idx: number) => (
            <tr key={idx} className="border-b border-gray-800">
              <td className="p-2">{item.technique}</td>
              <td className="p-2 break-all">{item.raw_log}</td>
              <td className="p-2">{item.sigma_rule}</td>
              <td className="p-2">{item.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
