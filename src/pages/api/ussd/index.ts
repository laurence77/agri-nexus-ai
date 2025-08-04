/**
 * USSD API Endpoint
 * Handles USSD requests from telecommunications providers
 * Supports multiple African languages and agricultural services
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { USSDService, USSDRequest } from '@/services/ussd/ussd-service';

// Initialize USSD service
const ussdService = new USSDService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse USSD request from different providers
    const ussdRequest = parseUSSDRequest(req);
    
    if (!ussdRequest) {
      return res.status(400).json({ error: 'Invalid USSD request format' });
    }

    // Log request for monitoring
    console.log('USSD Request:', {
      sessionId: ussdRequest.sessionId,
      phoneNumber: ussdRequest.phoneNumber.substring(0, 6) + '...',
      text: ussdRequest.text,
      serviceCode: ussdRequest.serviceCode,
      timestamp: new Date().toISOString()
    });

    // Process USSD request
    const response = await ussdService.handleUSSDRequest(ussdRequest);

    // Format response based on provider
    const formattedResponse = formatUSSDResponse(response, req);

    // Log response for monitoring
    console.log('USSD Response:', {
      sessionId: ussdRequest.sessionId,
      continueSession: response.continueSession,
      messageLength: response.message.length,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('USSD API Error:', error);
    
    // Return error response in appropriate format
    const errorResponse = {
      message: 'Service temporarily unavailable. Please try again later.',
      continueSession: false
    };

    return res.status(500).json(formatUSSDResponse(errorResponse, req));
  }
}

/**
 * Parse USSD request from different telecommunications providers
 * Supports Safaricom, Airtel, MTN, and other African providers
 */
function parseUSSDRequest(req: NextApiRequest): USSDRequest | null {
  const { body, query } = req;
  
  // Safaricom format (Kenya)
  if (body.sessionId && body.phoneNumber && body.serviceCode !== undefined) {
    return {
      sessionId: body.sessionId,
      phoneNumber: body.phoneNumber,
      text: body.text || '',
      serviceCode: body.serviceCode
    };
  }

  // MTN format (Multiple countries)
  if (body.SessionID && body.MSISDN && body.ServiceCode !== undefined) {
    return {
      sessionId: body.SessionID,
      phoneNumber: body.MSISDN,
      text: body.InputText || '',
      serviceCode: body.ServiceCode
    };
  }

  // Airtel format
  if (body.session_id && body.phone_number && body.service_code !== undefined) {
    return {
      sessionId: body.session_id,
      phoneNumber: body.phone_number,
      text: body.input_text || '',
      serviceCode: body.service_code
    };
  }

  // Generic format
  if (body.sessionId || body.session_id) {
    return {
      sessionId: body.sessionId || body.session_id,
      phoneNumber: body.phoneNumber || body.phone_number || body.msisdn,
      text: body.text || body.input || body.userInput || '',
      serviceCode: body.serviceCode || body.service_code || body.shortCode
    };
  }

  // URL parameters format (for testing)
  if (query.sessionId && query.phoneNumber) {
    return {
      sessionId: query.sessionId as string,
      phoneNumber: query.phoneNumber as string,
      text: (query.text as string) || '',
      serviceCode: (query.serviceCode as string) || '*123#'
    };
  }

  return null;
}

/**
 * Format USSD response for different telecommunications providers
 */
function formatUSSDResponse(response: any, req: NextApiRequest): any {
  const { body } = req;
  
  // Safaricom format (Kenya)
  if (body.sessionId && body.phoneNumber) {
    return {
      sessionId: body.sessionId,
      phoneNumber: body.phoneNumber,
      text: response.message,
      endSession: !response.continueSession
    };
  }

  // MTN format
  if (body.SessionID && body.MSISDN) {
    return {
      SessionID: body.SessionID,
      MSISDN: body.MSISDN,
      Message: response.message,
      EndSession: !response.continueSession
    };
  }

  // Airtel format
  if (body.session_id && body.phone_number) {
    return {
      session_id: body.session_id,
      phone_number: body.phone_number,
      message: response.message,
      end_session: !response.continueSession
    };
  }

  // Generic format
  return {
    message: response.message,
    continueSession: response.continueSession,
    sessionData: response.sessionData
  };
}

/**
 * Middleware to validate USSD service codes
 */
function validateServiceCode(serviceCode: string): boolean {
  // Define valid service codes for AgriNexus AI
  const validCodes = [
    '*123#',        // Main service
    '*123*1#',      // Farm status
    '*123*2#',      // Weather
    '*123*3#',      // Market prices
    '*123*4#',      // Expert advice
    '*123*5#',      // Record activity
    '*123*99#'      // Test code
  ];

  return validCodes.some(code => serviceCode.startsWith(code.replace('#', '')));
}

/**
 * Rate limiting for USSD requests
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(phoneNumber: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30; // Max 30 requests per minute per phone number

  const key = phoneNumber;
  const current = requestCounts.get(key);

  if (!current || now > current.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (current.count >= maxRequests) {
    return true;
  }

  current.count++;
  return false;
}

/**
 * Clean up expired rate limit entries
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes