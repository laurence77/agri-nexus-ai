// Minimal Express server for API endpoints (local/dev + deployable)
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import formidable from 'formidable';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Paystack proxy endpoints (server-side secret usage)
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE = 'https://api.paystack.co';

// Korapay proxy
const KORAPAY_SECRET_KEY = process.env.KORAPAY_SECRET_KEY || '';
const KORAPAY_BASE = 'https://api.korapay.com/merchant/api/v1';

// M-Pesa proxy
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const MPESA_BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE || '';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || '';
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || '';
const MPESA_RESULT_URL = process.env.MPESA_RESULT_URL || '';
const MPESA_TIMEOUT_URL = process.env.MPESA_TIMEOUT_URL || '';

// MTN MoMo proxy
const MOMO_ENV = process.env.MOMO_ENV || 'sandbox';
const MOMO_PRIMARY_KEY = process.env.MTN_MOMO_PRIMARY_KEY || process.env.MOMO_PRIMARY_KEY || '';
const MOMO_SECONDARY_KEY = process.env.MTN_MOMO_SECONDARY_KEY || process.env.MOMO_SECONDARY_KEY || '';
const MOMO_USER_ID = process.env.MTN_MOMO_USER_ID || process.env.MOMO_USER_ID || '';
const MOMO_API_KEY = process.env.MTN_MOMO_API_KEY || process.env.MOMO_API_KEY || '';
const MOMO_TARGET_ENV = process.env.MTN_MOMO_TARGET_ENV || process.env.MOMO_TARGET_ENV || 'mtnuganda';
const MOMO_CALLBACK_URL = process.env.MTN_MOMO_CALLBACK_URL || process.env.MOMO_CALLBACK_URL || '';

function requireSecret(res) {
  if (!PAYSTACK_SECRET_KEY) {
    res.status(500).json({ status: false, message: 'Server PAYSTACK_SECRET_KEY not configured' });
    return false;
  }
  return true;
}

app.post('/api/payments/paystack/init', async (req, res) => {
  try {
    if (!requireSecret(res)) return;
    const tx = req.body || {};
    if (!tx.email || !tx.amount) {
      return res.status(400).json({ status: false, message: 'email and amount are required' });
    }
    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference: tx.reference || `agri_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        ...tx,
      }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Paystack init error:', err);
    res.status(500).json({ status: false, message: 'Initialization failed' });
  }
});

app.get('/api/payments/paystack/verify/:reference', async (req, res) => {
  try {
    if (!requireSecret(res)) return;
    const { reference } = req.params;
    const response = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Paystack verify error:', err);
    res.status(500).json({ status: false, message: 'Verification failed' });
  }
});

// Korapay: initialize charge
app.post('/api/payments/korapay/charges/initialize', async (req, res) => {
  try {
    if (!KORAPAY_SECRET_KEY) return res.status(500).json({ status: false, message: 'KORAPAY_SECRET_KEY not set' });
    const response = await fetch(`${KORAPAY_BASE}/charges/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KORAPAY_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body || {}),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Korapay init error:', err);
    res.status(500).json({ status: false, message: 'Korapay init failed' });
  }
});

// Korapay: get charge
app.get('/api/payments/korapay/charges/:reference', async (req, res) => {
  try {
    if (!KORAPAY_SECRET_KEY) return res.status(500).json({ status: false, message: 'KORAPAY_SECRET_KEY not set' });
    const response = await fetch(`${KORAPAY_BASE}/charges/${req.params.reference}`, {
      headers: { Authorization: `Bearer ${KORAPAY_SECRET_KEY}` },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Korapay charge error:', err);
    res.status(500).json({ status: false, message: 'Korapay charge fetch failed' });
  }
});

// Korapay: single disbursement
app.post('/api/payments/korapay/disbursements/single', async (req, res) => {
  try {
    if (!KORAPAY_SECRET_KEY) return res.status(500).json({ status: false, message: 'KORAPAY_SECRET_KEY not set' });
    const response = await fetch(`${KORAPAY_BASE}/disbursements/single`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KORAPAY_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body || {}),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Korapay disbursement error:', err);
    res.status(500).json({ status: false, message: 'Korapay disbursement failed' });
  }
});

// M-Pesa helpers
function mpesaBase() {
  return MPESA_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
}

async function mpesaOAuthToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const resp = await fetch(`${mpesaBase()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!resp.ok) throw new Error(`M-Pesa OAuth failed: ${resp.status}`);
  const data = await resp.json();
  return data.access_token;
}

function mpesaPassword() {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(`${MPESA_BUSINESS_SHORT_CODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
  return { password, timestamp };
}

// M-Pesa: STK Push
app.post('/api/payments/mpesa/stkpush', async (req, res) => {
  try {
    const required = [MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_BUSINESS_SHORT_CODE, MPESA_PASSKEY];
    if (required.some(v => !v)) return res.status(500).json({ status: false, message: 'M-Pesa server env not set' });
    const token = await mpesaOAuthToken();
    const { password, timestamp } = mpesaPassword();
    const { phoneNumber, amount, accountReference, transactionDesc } = req.body || {};
    const payload = {
      BusinessShortCode: MPESA_BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(Number(amount || 0)),
      PartyA: phoneNumber,
      PartyB: MPESA_BUSINESS_SHORT_CODE,
      PhoneNumber: phoneNumber,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: String(accountReference || '').substring(0, 12),
      TransactionDesc: String(transactionDesc || '').substring(0, 13),
    };
    const resp = await fetch(`${mpesaBase()}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    res.status(resp.ok ? 200 : 400).json(data);
  } catch (err) {
    console.error('M-Pesa STK error:', err);
    res.status(500).json({ status: false, message: 'M-Pesa STK failed' });
  }
});

// M-Pesa: status query
app.get('/api/payments/mpesa/status/:checkoutRequestId', async (req, res) => {
  try {
    const token = await mpesaOAuthToken();
    const { password, timestamp } = mpesaPassword();
    const payload = {
      BusinessShortCode: MPESA_BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: req.params.checkoutRequestId,
    };
    const resp = await fetch(`${mpesaBase()}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    res.status(resp.ok ? 200 : 400).json(data);
  } catch (err) {
    console.error('M-Pesa status error:', err);
    res.status(500).json({ status: false, message: 'M-Pesa status failed' });
  }
});

// MTN MoMo helpers
function momoBase() {
  if (MOMO_ENV === 'sandbox') return 'https://sandbox.momodeveloper.mtn.com';
  return 'https://momodeveloper.mtn.com';
}

async function momoToken() {
  const auth = Buffer.from(`${MOMO_USER_ID}:${MOMO_API_KEY}`).toString('base64');
  const resp = await fetch(`${momoBase()}/collection/token/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Ocp-Apim-Subscription-Key': MOMO_PRIMARY_KEY,
      'X-Target-Environment': MOMO_TARGET_ENV,
      'Content-Type': 'application/json',
    },
  });
  if (!resp.ok) throw new Error(`MoMo token failed: ${resp.status}`);
  const data = await resp.json();
  return data.access_token;
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// MTN MoMo: request to pay
app.post('/api/payments/mtn-momo/request', async (req, res) => {
  try {
    const token = await momoToken();
    const { amount, phoneNumber, externalId, payerMessage, payeeNote, metadata } = req.body || {};
    const referenceId = uuidv4();
    const payload = {
      amount: String(amount),
      currency: process.env.MTN_MOMO_CURRENCY || 'UGX',
      externalId: externalId || referenceId,
      payer: { partyIdType: 'MSISDN', partyId: phoneNumber },
      payerMessage: (payerMessage || '').substring(0, 160),
      payeeNote: (payeeNote || '').substring(0, 160),
      metadata,
    };
    const resp = await fetch(`${momoBase()}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': MOMO_TARGET_ENV,
        'Ocp-Apim-Subscription-Key': MOMO_PRIMARY_KEY,
        'Content-Type': 'application/json',
        'X-Callback-Url': MOMO_CALLBACK_URL,
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(400).json({ status: false, message: text });
    }
    res.json({ status: true, referenceId });
  } catch (err) {
    console.error('MoMo request error:', err);
    res.status(500).json({ status: false, message: 'MoMo request failed' });
  }
});

// MTN MoMo: status
app.get('/api/payments/mtn-momo/status/:referenceId', async (req, res) => {
  try {
    const token = await momoToken();
    const resp = await fetch(`${momoBase()}/collection/v1_0/requesttopay/${req.params.referenceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Target-Environment': MOMO_TARGET_ENV,
        'Ocp-Apim-Subscription-Key': MOMO_PRIMARY_KEY,
      },
    });
    const data = await resp.json();
    res.status(resp.ok ? 200 : 400).json(data);
  } catch (err) {
    console.error('MoMo status error:', err);
    res.status(500).json({ status: false, message: 'MoMo status failed' });
  }
});

// Korapay webhook (optional DB updates)
app.post('/webhooks/korapay', async (req, res) => {
  try {
    const signature = req.headers['x-korapay-signature'];
    if (process.env.KORAPAY_WEBHOOK_SECRET && signature) {
      const payload = JSON.stringify(req.body || {});
      const expected = crypto
        .createHmac('sha256', process.env.KORAPAY_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');
      if (expected !== signature) {
        return res.status(401).json({ message: 'Invalid signature' });
      }
    }
    // TODO: Optionally update DB via Supabase service role if configured
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Korapay webhook error:', err);
    return res.status(500).json({ ok: false });
  }
});

// ---------- Billing webhooks ----------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

app.post('/api/billing/webhook', async (req, res) => {
  try {
    const { type, data } = req.body || {};
    if (!supabase) return res.status(500).json({ message: 'Supabase not configured' });

    if (type === 'payment.completed') {
      const reference = data?.reference;
      // Find pending wallet transaction by reference
      const { data: walletTx, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('reference', reference)
        .eq('status', 'pending')
        .single();
      if (!error && walletTx) {
        // Load wallet
        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('id', walletTx.wallet_id)
          .single();
        if (wallet) {
          const newBalance = wallet.balance + Math.abs(Number(walletTx.amount));
          await supabase
            .from('wallets')
            .update({ balance: newBalance, updated_at: new Date().toISOString() })
            .eq('id', walletTx.wallet_id);
        }
        await supabase
          .from('wallet_transactions')
          .update({ status: 'completed', processed_at: new Date().toISOString() })
          .eq('id', walletTx.id);
      }
    } else if (type === 'wallet.topup') {
      // Simple direct topup handler
      const { walletId, amount, currency, reference } = data || {};
      await supabase.from('wallet_transactions').insert({
        wallet_id: walletId,
        transaction_type: 'deposit',
        amount,
        currency,
        description: 'Wallet top-up via webhook',
        reference,
        status: 'completed',
        processed_at: new Date().toISOString(),
      });
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', walletId)
        .single();
      if (wallet) {
        await supabase
          .from('wallets')
          .update({ balance: wallet.balance + Number(amount), updated_at: new Date().toISOString() })
          .eq('id', walletId);
      }
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Billing webhook error:', err);
    return res.status(500).json({ ok: false });
  }
});

// ---------- Automated billing (cron) ----------
app.post('/api/billing/automated', async (req, res) => {
  const auth = req.headers.authorization;
  if (!process.env.BILLING_CRON_TOKEN || auth !== `Bearer ${process.env.BILLING_CRON_TOKEN}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!supabase) return res.status(500).json({ message: 'Supabase not configured' });

  try {
    const { action } = req.body || {};
    if (action === 'process_invoices') {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('status', 'pending')
        .eq('auto_charge', true)
        .lte('due_date', new Date().toISOString());
      for (const inv of invoices || []) {
        // Minimal: mark overdue if due date passed; a real implementation should deduct from wallet
        await supabase
          .from('invoices')
          .update({ status: 'overdue' })
          .eq('id', inv.id);
      }
      return res.json({ ok: true, processed: invoices?.length || 0 });
    }
    if (action === 'send_overdue_notifications') {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const { data: overdue } = await supabase
        .from('invoices')
        .select('*')
        .eq('status', 'overdue')
        .lt('due_date', threeDaysAgo);
      for (const inv of overdue || []) {
        await supabase.from('notifications').insert({
          tenant_id: inv.tenant_id,
          user_id: inv.recipient_id,
          title: 'Overdue Invoice Reminder',
          message: `Your invoice of ${inv.currency} ${inv.amount} is overdue.`,
          type: 'overdue_invoice',
          metadata: { invoice_id: inv.id },
        });
      }
      return res.json({ ok: true, notified: overdue?.length || 0 });
    }
    if (action === 'cleanup_expired_data') {
      const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from('wallet_transactions')
        .delete()
        .eq('status', 'completed')
        .lt('created_at', sixMonthsAgo);
      return res.json({ ok: true });
    }
    return res.status(400).json({ message: 'Invalid action' });
  } catch (err) {
    console.error('Automated billing error:', err);
    return res.status(500).json({ ok: false });
  }
});

// ---------- Voice endpoints (mock) ----------
const voiceSessions = new Map();

app.post('/api/voice/start-session', async (req, res) => {
  const { userId, tenantId, language = 'en-US' } = req.body || {};
  if (!userId || !tenantId) return res.status(400).json({ error: 'Missing userId or tenantId' });
  const sessionId = `vs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  voiceSessions.set(sessionId, { userId, tenantId, language, start: Date.now() });
  return res.json({ success: true, sessionId, language, supported: true });
});

app.post('/api/voice/process-command', async (req, res) => {
  const { sessionId, command } = req.body || {};
  if (!sessionId || !voiceSessions.has(sessionId)) return res.status(400).json({ error: 'Invalid sessionId' });
  const text = command || 'Understood. How can I help further?';
  return res.json({ success: true, response: { text, speech: text, language: 'en-US', actions: [] } });
});

app.post('/api/voice/upload-audio', async (req, res) => {
  const form = formidable({ maxFileSize: 10 * 1024 * 1024, allowEmptyFiles: false });
  const [fields, files] = await form.parse(req);
  const sessionId = Array.isArray(fields.sessionId) ? fields.sessionId[0] : fields.sessionId;
  const audio = Array.isArray(files.audio) ? files.audio[0] : files.audio;
  if (!sessionId || !audio) return res.status(400).json({ error: 'Missing sessionId or audio' });
  // Simple mock: delete file and return generic response
  try { fs.unlinkSync(audio.filepath); } catch {}
  return res.json({ success: true, response: { text: 'Audio received and processed.', speech: 'Audio received.', language: 'en-US' } });
});

app.post('/api/voice/end-session', async (req, res) => {
  const { sessionId } = req.body || {};
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });
  voiceSessions.delete(sessionId);
  return res.json({ success: true, message: 'Session ended successfully' });
});

app.get('/api/voice/status', async (_req, res) => {
  return res.json({ success: true, status: 'operational', activeSessions: voiceSessions.size, supported: true });
});

// ---------- AI crop monitoring endpoints (mock) ----------
app.post('/api/ai/crop-monitoring/detect-diseases', async (req, res) => {
  return res.json({ success: true, detections: [{ disease: 'Leaf Spot', confidence: 0.78 }] });
});

app.post('/api/ai/crop-monitoring/analyze-satellite', async (req, res) => {
  return res.json({ success: true, analysis: { ndviScore: 0.62, vegetationHealth: 'moderate' } });
});

app.post('/api/ai/crop-monitoring/process-sensors', async (req, res) => {
  const sensorData = req.body?.sensorData || [];
  return res.json({ success: true, sensorCount: sensorData.length, insights: { alerts: [], recommendations: [] } });
});

app.post('/api/ai/crop-monitoring/generate-predictions', async (req, res) => {
  const { predictionType } = req.body || {};
  return res.json({ success: true, analytics: { type: predictionType, predictions: [], accuracy: 0.8 } });
});

app.get('/api/ai/crop-monitoring/status', async (_req, res) => {
  return res.json({ success: true, status: 'operational', models: { diseaseModel: 'mock', ndviModel: 'mock', yieldModel: 'mock' } });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
