import { useState, useEffect } from 'react';

export default function Exposure() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setData(null);
    try {
      const res = await fetch(`/api/exposure/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(true);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Exposure Intelligence (HIBP‑like)</h2>
      <div className="bg-gray-800 p-4 rounded mb-6 text-center">
        <p className="text-lg mb-2">Discover compromised credentials before attackers do.</p>
        <a href="https://rednexus.io/request-demo" className="inline-block px-4 py-2 bg-primary text-black rounded hover:bg-primary/80 transition">Request a Free Demo</a>
      </div>
      <form onSubmit={handleSearch} className="mb-4">
        <input className="p-2 rounded bg-gray-800 mr-2" placeholder="email, username, domain…" value={query} onChange={e => setQuery(e.target.value)} required />
        <button className="px-4 py-2 bg-info text-black rounded hover:bg-info/80 transition" type="submit">Search</button>
      </form>
      {error && <div className="text-danger">Error fetching results.</div>}
      {data && (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-2 text-left">Indicator</th>
              <th className="p-2 text-left">Sources</th>
              <th className="p-2 text-left">Last Seen</th>
              <th className="p-2 text-left">Confidence</th>
              <th className="p-2 text-left">Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, idx: number) => (
              <tr key={idx} className="border-b border-gray-800">
                <td className="p-2">{row.indicator}</td>
                <td className="p-2">{row.sources.join(', ')}</td>
                <td className="p-2">{row.last_seen}</td>
                <td className="p-2">{row.confidence}</td>
                <td className="p-2">{row.risk_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
