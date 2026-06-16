import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Simulations() {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [assets, setAssets] = useState(''); // comma separated
  const [techniques, setTechniques] = useState(''); // comma separated
  const [health, setHealth] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      description: desc,
      assets: assets.split(',').map(s => s.trim()).filter(Boolean),
      techniques: techniques.split(',').map(s => s.trim()).filter(Boolean),
    };
    const res = await fetch('/api/simulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    router.push(`/evidence/${json.id}`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Run a Simulation</h2>
      {health && (
        <div className="mb-4">
          <p>Running sims: {health.running_simulations}</p>
          <p>Coverage: {health.coverage_score}%</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
        <input className="p-2 rounded bg-gray-800" placeholder="Simulation name" value={name} onChange={e => setName(e.target.value)} required />
        <textarea className="p-2 rounded bg-gray-800" placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} />
        <input className="p-2 rounded bg-gray-800" placeholder="Assets (comma separated)" value={assets} onChange={e => setAssets(e.target.value)} required />
        <input className="p-2 rounded bg-gray-800" placeholder="Techniques (comma separated, e.g. T1078,T1059)" value={techniques} onChange={e => setTechniques(e.target.value)} required />
        <button type="submit" className="px-4 py-2 bg-primary text-black rounded hover:bg-primary/80 transition">
          Submit
        </button>
      </form>
    </div>
  );
}
