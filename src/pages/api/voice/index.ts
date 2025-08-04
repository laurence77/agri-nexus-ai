/**
 * Voice API Endpoint
 * Handles voice commands and speech processing for low-literacy farmers
 * Supports multiple African languages and agricultural voice interactions
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { VoiceService } from '@/services/voice/voice-service';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

// Initialize services
const voiceService = new VoiceService();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, url } = req;
    const pathname = url?.split('?')[0] || '';

    // Route to different handlers
    switch (method) {
      case 'POST':
        if (pathname.endsWith('/start-session')) {
          return handleStartSession(req, res);
        } else if (pathname.endsWith('/process-command')) {
          return handleProcessCommand(req, res);
        } else if (pathname.endsWith('/upload-audio')) {
          return handleAudioUpload(req, res);
        } else if (pathname.endsWith('/end-session')) {
          return handleEndSession(req, res);
        }
        break;
      
      case 'GET':
        if (pathname.endsWith('/status')) {
          return handleStatus(req, res);
        }
        break;
    }

    return res.status(404).json({ error: 'Endpoint not found' });
  } catch (error) {
    console.error('Voice API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Start a new voice session
 * POST /api/voice/start-session
 */
async function handleStartSession(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, tenantId, language = 'en-US' } = JSON.parse(req.body);

    if (!userId || !tenantId) {
      return res.status(400).json({ 
        error: 'Missing required parameters: userId and tenantId' 
      });
    }

    // Verify user exists and has access
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, tenant_id, language_preference')
      .eq('id', userId)
      .eq('tenant_id', tenantId)
      .single();

    if (userError || !user) {
      return res.status(403).json({ error: 'User not found or access denied' });
    }

    // Use user's preferred language if available
    const sessionLanguage = user.language_preference || language;

    // Start voice session
    const sessionId = await voiceService.startVoiceSession(
      userId, 
      tenantId, 
      sessionLanguage
    );

    console.log('Voice session started:', {
      sessionId,
      userId,
      tenantId,
      language: sessionLanguage
    });

    return res.status(200).json({
      success: true,
      sessionId,
      language: sessionLanguage,
      supported: voiceService.isVoiceSupported()
    });
  } catch (error) {
    console.error('Start session error:', error);
    return res.status(500).json({ 
      error: 'Failed to start voice session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Process voice command (text input)
 * POST /api/voice/process-command
 */
async function handleProcessCommand(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { sessionId, command } = JSON.parse(req.body);

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    // For text-based commands, we simulate speech processing
    const response = await voiceService.processVoiceCommand(sessionId);

    return res.status(200).json({
      success: true,
      response: {
        text: response.text,
        speech: response.speech,
        language: response.language,
        actions: response.actions,
        followUpQuestion: response.followUpQuestion
      }
    });
  } catch (error) {
    console.error('Process command error:', error);
    return res.status(500).json({ 
      error: 'Failed to process voice command',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Upload and process audio file
 * POST /api/voice/upload-audio
 */
async function handleAudioUpload(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Parse multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      allowEmptyFiles: false,
      filter: ({ mimetype }) => {
        return !!(mimetype && mimetype.includes('audio'));
      }
    });

    const [fields, files] = await form.parse(req);
    
    const sessionId = Array.isArray(fields.sessionId) ? fields.sessionId[0] : fields.sessionId;
    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;

    if (!sessionId || !audioFile) {
      return res.status(400).json({ 
        error: 'Missing sessionId or audio file' 
      });
    }

    // Read audio file
    const audioBuffer = fs.readFileSync(audioFile.filepath);
    const audioBlob = new Blob([audioBuffer], { type: audioFile.mimetype || 'audio/wav' });

    // Process voice command with audio
    const response = await voiceService.processVoiceCommand(sessionId, audioBlob);

    // Clean up temp file
    fs.unlinkSync(audioFile.filepath);

    console.log('Audio processed:', {
      sessionId,
      fileSize: audioBuffer.length,
      mimeType: audioFile.mimetype,
      responseLength: response.text.length
    });

    return res.status(200).json({
      success: true,
      response: {
        text: response.text,
        speech: response.speech,
        language: response.language,
        actions: response.actions,
        followUpQuestion: response.followUpQuestion
      }
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to process audio',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * End voice session
 * POST /api/voice/end-session
 */
async function handleEndSession(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { sessionId } = JSON.parse(req.body);

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    await voiceService.endVoiceSession(sessionId);

    console.log('Voice session ended:', { sessionId });

    return res.status(200).json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('End session error:', error);
    return res.status(500).json({ 
      error: 'Failed to end session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get voice service status
 * GET /api/voice/status
 */
async function handleStatus(req: NextApiRequest, res: NextApiResponse) {
  try {
    const activeSessions = voiceService.getActiveSessionsCount();
    const isSupported = voiceService.isVoiceSupported();

    return res.status(200).json({
      success: true,
      status: 'operational',
      activeSessions,
      supported: isSupported,
      features: {
        speechToText: isSupported,
        textToSpeech: typeof window !== 'undefined' && 'speechSynthesis' in window,
        multiLanguage: true,
        realTimeProcessing: true
      },
      supportedLanguages: [
        { code: 'en-US', name: 'English', region: 'United States' },
        { code: 'sw-KE', name: 'Kiswahili', region: 'Kenya' },
        { code: 'ha-NG', name: 'Hausa', region: 'Nigeria' },
        { code: 'yo-NG', name: 'Yoruba', region: 'Nigeria' },
        { code: 'fr-FR', name: 'Français', region: 'France' }
      ]
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({ 
      error: 'Failed to get status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Validate audio file
 */
function validateAudioFile(file: formidable.File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'audio/wav',
    'audio/mp3', 
    'audio/mpeg',
    'audio/ogg',
    'audio/webm',
    'audio/m4a'
  ];

  if (!allowedTypes.includes(file.mimetype || '')) {
    return { 
      valid: false, 
      error: `Unsupported audio format: ${file.mimetype}. Supported formats: ${allowedTypes.join(', ')}` 
    };
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB
    return { 
      valid: false, 
      error: 'Audio file too large. Maximum size is 10MB.' 
    };
  }

  return { valid: true };
}

/**
 * Rate limiting for voice requests
 */
const voiceRequestCounts = new Map<string, { count: number; resetTime: number }>();

function isVoiceRateLimited(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20; // Max 20 voice requests per minute per user

  const key = userId;
  const current = voiceRequestCounts.get(key);

  if (!current || now > current.resetTime) {
    voiceRequestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (current.count >= maxRequests) {
    return true;
  }

  current.count++;
  return false;
}

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of voiceRequestCounts.entries()) {
    if (now > data.resetTime) {
      voiceRequestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes