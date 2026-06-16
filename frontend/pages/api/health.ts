import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple health check that proxies to backend FastAPI health endpoint
  try {
    const backendRes = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/health`);
    const json = await backendRes.json();
    res.status(200).json({
      backend: json.status,
      running_simulations: json.running_simulations || 0,
      coverage_score: json.coverage_score || 0,
      avg_tte: json.avg_tte || 0,
    });
  } catch (e) {
    res.status(500).json({ error: 'backend unreachable' });
  }
}
