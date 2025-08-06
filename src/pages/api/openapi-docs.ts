// OpenAPI/Swagger doc endpoint for partners
import type { NextApiRequest, NextApiResponse } from 'next';

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'AgriNexus Partner API',
    version: '1.0.0',
    description: 'API for governments, NGOs, and partners to access agri-nexus data and features.'
  },
  paths: {
    '/api/openapi': {
      get: {
        summary: 'Get dashboard, subsidy, or aggregate data',
        parameters: [
          { name: 'dashboard', in: 'query', schema: { type: 'boolean' } },
          { name: 'subsidy', in: 'query', schema: { type: 'boolean' } },
          { name: 'aggregate', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: {
          200: { description: 'Success' },
          400: { description: 'Bad Request' }
        }
      }
    }
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(openApiSpec);
}
