import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sim_id } = req.query as { sim_id: string };
  const url = `${BACKEND}/evidence/${sim_id}`;
  try {
    const backendRes = await fetch(url);
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Backend unreachable' });
  }
}
