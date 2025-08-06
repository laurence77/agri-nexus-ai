import { NextRequest } from 'next/server';
import PaystackWebhookHandler from '@/lib/webhooks/paystack-webhook';

const webhookHandler = new PaystackWebhookHandler();

export async function POST(request: NextRequest) {
  return await webhookHandler.handleWebhook(request);
}

export async function GET() {
  return Response.json({ message: 'Paystack webhook endpoint is active' });
}