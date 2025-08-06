import type { NextApiRequest, NextApiResponse } from 'next';
import b2bService from '@/services/marketplace/b2b-service';

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

// Example: API endpoints for B2B features (RFQ, instant offers, escrow)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireApiKey(req, res) || !rateLimit(req, res)) return;
  const { method, query, body } = req;

  switch (method) {
    case 'GET': {
      // e.g. /api/b2b?type=aggregators
      if (query.type === 'aggregators') {
        const aggregators = await b2bService.getAggregators();
        return res.status(200).json(aggregators);
      }
      if (query.type === 'offtakers') {
        const offtakers = await b2bService.getOffTakers();
        return res.status(200).json(offtakers);
      }
      if (query.type === 'input-providers') {
        const providers = await b2bService.getInputProviders();
        return res.status(200).json(providers);
      }
      return res.status(400).json({ error: 'Unknown type' });
    }
    case 'POST': {
      // e.g. create RFQ, instant offer, escrow
      if (body.action === 'rfq') {
        const result = await b2bService.createRFQ(body.data);
        return res.status(201).json(result);
      }
      if (body.action === 'offer') {
        const result = await b2bService.createInstantOffer(body.data);
        return res.status(201).json(result);
      }
      if (body.action === 'escrow') {
        const result = await b2bService.createEscrow(body.data);
        return res.status(201).json(result);
      }
      return res.status(400).json({ error: 'Unknown action' });
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
