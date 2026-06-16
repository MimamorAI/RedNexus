import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const url = `${BACKEND}/simulations${req.url?.replace('/api/simulations', '') || ''}`;
  try {
    const backendRes = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify(req.body) : undefined,
    });
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Backend unreachable' });
  }
}
