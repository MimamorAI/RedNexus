import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query as { q: string };
  const url = `${BACKEND}/exposure/search?q=${encodeURIComponent(q)}`;
  try {
    const backendRes = await fetch(url);
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Backend unreachable' });
  }
}
