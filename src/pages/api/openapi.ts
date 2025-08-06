import type { NextApiRequest, NextApiResponse } from 'next';
import { getMarketplaceAnalytics } from '@/services/marketplace/marketplace-service';

// Simple API key auth middleware
function requireApiKey(req: NextApiRequest, res: NextApiResponse) {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (!key || key !== process.env.PARTNER_API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
// Simple in-memory rate limiter (for demo, use Redis in prod)
const rateLimitMap = new Map<string, number>();
function rateLimit(req: NextApiRequest, res: NextApiResponse) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const now = Date.now();
  if (rateLimitMap.has(ip as string) && now - (rateLimitMap.get(ip as string) || 0) < 1000) {
    res.status(429).json({ error: 'Too many requests' });
    return false;
  }
  rateLimitMap.set(ip as string, now);
  return true;
}

// Example: Open API for governments, NGOs, partners
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireApiKey(req, res) || !rateLimit(req, res)) return;
  const { method, query } = req;

  switch (method) {
    case 'GET': {
      // e.g. /api/openapi?dashboard=1
      if (query.dashboard) {
        // Return dashboard data (aggregated, sanitized)
        const data = await getMarketplaceAnalytics();
        return res.status(200).json(data);
      }
      // e.g. /api/openapi?subsidy=1
      if (query.subsidy) {
        // Push subsidies (stub)
        return res.status(200).json({ status: 'subsidy pushed' });
      }
      // e.g. /api/openapi?aggregate=1
      if (query.aggregate) {
        // Aggregate data for partners
        return res.status(200).json({ status: 'data aggregated' });
      }
      return res.status(400).json({ error: 'Unknown query' });
    }
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
