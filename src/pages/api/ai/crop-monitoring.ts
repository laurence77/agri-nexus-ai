/**
 * AI Crop Monitoring API Endpoint
 * Provides disease detection, satellite analysis, IoT processing, and predictive analytics
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import CropMonitoringService, { CropImage } from '@/services/ai/crop-monitoring-service';
import formidable from 'formidable';
import fs from 'fs';

// Initialize services
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const monitoringService = new CropMonitoringService();

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
        if (pathname.endsWith('/detect-diseases')) {
          return handleDiseaseDetection(req, res);
        } else if (pathname.endsWith('/analyze-satellite')) {
          return handleSatelliteAnalysis(req, res);
        } else if (pathname.endsWith('/process-sensors')) {
          return handleSensorProcessing(req, res);
        } else if (pathname.endsWith('/generate-predictions')) {
          return handlePredictiveAnalytics(req, res);
        }
        break;
      
      case 'GET':
        if (pathname.endsWith('/status')) {
          return handleStatus(req, res);
        } else if (pathname.endsWith('/field-analysis')) {
          return handleFieldAnalysis(req, res);
        }
        break;
    }

    return res.status(404).json({ error: 'Endpoint not found' });
  } catch (error) {
    console.error('AI Crop Monitoring API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle disease detection from uploaded images
 * POST /api/ai/crop-monitoring/detect-diseases
 */
async function handleDiseaseDetection(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Parse multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      allowEmptyFiles: false,
      filter: ({ mimetype }) => {
        return !!(mimetype && mimetype.includes('image'));
      }
    });

    const [fields, files] = await form.parse(req);
    
    const fieldId = Array.isArray(fields.fieldId) ? fields.fieldId[0] : fields.fieldId;
    const cropType = Array.isArray(fields.cropType) ? fields.cropType[0] : fields.cropType;
    const tenantId = Array.isArray(fields.tenantId) ? fields.tenantId[0] : fields.tenantId;
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!fieldId || !imageFile || !tenantId) {
      return res.status(400).json({ 
        error: 'Missing required parameters: fieldId, tenantId, and image file' 
      });
    }

    // Verify field access
    const { data: field, error: fieldError } = await supabase
      .from('fields')
      .select('id, field_name, tenant_id')
      .eq('id', fieldId)
      .eq('tenant_id', tenantId)
      .single();

    if (fieldError || !field) {
      return res.status(403).json({ error: 'Field not found or access denied' });
    }

    // Read image file
    const imageBuffer = fs.readFileSync(imageFile.filepath);
    const imageData = `data:${imageFile.mimetype};base64,${imageBuffer.toString('base64')}`;

    // Create crop image object
    const cropImage: CropImage = {
      id: `img_${Date.now()}`,
      imageData,
      timestamp: new Date(),
      fieldId,
      cropType: cropType || 'unknown',
      location: undefined, // Could be extracted from EXIF data
      metadata: {
        source: 'upload',
        fileSize: imageFile.size,
        fileName: imageFile.originalFilename,
        mimeType: imageFile.mimetype
      }
    };

    // Run disease detection
    const results = await monitoringService.detectDiseases(cropImage);

    // Clean up temp file
    fs.unlinkSync(imageFile.filepath);

    console.log('Disease detection completed:', {
      fieldId,
      tenantId,
      detectionCount: results.length,
      highestConfidence: results[0]?.confidence || 0
    });

    return res.status(200).json({
      success: true,
      fieldId,
      fieldName: field.field_name,
      detections: results,
      analysisTimestamp: new Date().toISOString(),
      metadata: {
        imageProcessed: true,
        fileSize: imageFile.size,
        processingTime: Date.now() - cropImage.timestamp.getTime()
      }
    });
  } catch (error) {
    console.error('Disease detection error:', error);
    return res.status(500).json({ 
      error: 'Failed to detect diseases',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle satellite imagery analysis
 * POST /api/ai/crop-monitoring/analyze-satellite
 */
async function handleSatelliteAnalysis(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fieldId, tenantId, satelliteData } = req.body;

    if (!fieldId || !tenantId) {
      return res.status(400).json({ 
        error: 'Missing required parameters: fieldId and tenantId' 
      });
    }

    // Verify field access
    const { data: field, error: fieldError } = await supabase
      .from('fields')
      .select('id, field_name, tenant_id')
      .eq('id', fieldId)
      .eq('tenant_id', tenantId)
      .single();

    if (fieldError || !field) {
      return res.status(403).json({ error: 'Field not found or access denied' });
    }

    // Analyze satellite imagery
    const analysis = await monitoringService.analyzeSatelliteImagery(
      fieldId, 
      satelliteData ? Buffer.from(satelliteData, 'base64') : undefined
    );

    console.log('Satellite analysis completed:', {
      fieldId,
      tenantId,
      ndviScore: analysis.ndviScore,
      vegetationHealth: analysis.vegetationHealth
    });

    return res.status(200).json({
      success: true,
      fieldId,
      fieldName: field.field_name,
      analysis,
      analysisTimestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Satellite analysis error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze satellite imagery',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle IoT sensor data processing
 * POST /api/ai/crop-monitoring/process-sensors
 */
async function handleSensorProcessing(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { sensorData, tenantId } = req.body;

    if (!sensorData || !Array.isArray(sensorData)) {
      return res.status(400).json({ 
        error: 'Invalid sensor data format. Expected array of sensor readings.' 
      });
    }

    if (!tenantId) {
      return res.status(400).json({ error: 'Missing tenantId' });
    }

    // Validate sensor data format
    for (const sensor of sensorData) {
      if (!sensor.sensorId || !sensor.fieldId || sensor.value === undefined) {
        return res.status(400).json({ 
          error: 'Invalid sensor data. Each sensor must have sensorId, fieldId, and value.' 
        });
      }
    }

    // Process IoT sensor data
    const insights = await monitoringService.processIoTSensorData(sensorData);

    console.log('Sensor data processed:', {
      tenantId,
      sensorCount: sensorData.length,
      alertCount: insights.alerts.length,
      recommendationCount: insights.recommendations.length
    });

    return res.status(200).json({
      success: true,
      sensorCount: sensorData.length,
      insights,
      processedTimestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sensor processing error:', error);
    return res.status(500).json({ 
      error: 'Failed to process sensor data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle predictive analytics generation
 * POST /api/ai/crop-monitoring/generate-predictions
 */
async function handlePredictiveAnalytics(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fieldId, predictionType, tenantId, historicalData } = req.body;

    if (!fieldId || !predictionType || !tenantId) {
      return res.status(400).json({ 
        error: 'Missing required parameters: fieldId, predictionType, and tenantId' 
      });
    }

    const validPredictionTypes = ['disease_risk', 'yield_forecast', 'optimal_harvest', 'irrigation_schedule'];
    if (!validPredictionTypes.includes(predictionType)) {
      return res.status(400).json({ 
        error: `Invalid prediction type. Must be one of: ${validPredictionTypes.join(', ')}` 
      });
    }

    // Verify field access
    const { data: field, error: fieldError } = await supabase
      .from('fields')
      .select('id, field_name, tenant_id')
      .eq('id', fieldId)
      .eq('tenant_id', tenantId)
      .single();

    if (fieldError || !field) {
      return res.status(403).json({ error: 'Field not found or access denied' });
    }

    // Generate predictive analytics
    const analytics = await monitoringService.generatePredictiveAnalytics(
      fieldId,
      predictionType,
      historicalData
    );

    console.log('Predictive analytics generated:', {
      fieldId,
      tenantId,
      predictionType,
      predictionCount: analytics.predictions.length,
      accuracy: analytics.accuracy
    });

    return res.status(200).json({
      success: true,
      fieldId,
      fieldName: field.field_name,
      analytics,
      generatedTimestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Predictive analytics error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate predictions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get AI service status and model information
 * GET /api/ai/crop-monitoring/status
 */
async function handleStatus(req: NextApiRequest, res: NextApiResponse) {
  try {
    const isInitialized = monitoringService.isInitialized();
    const modelInfo = await monitoringService.getModelInfo();

    return res.status(200).json({
      success: true,
      status: isInitialized ? 'operational' : 'initializing',
      models: modelInfo,
      features: {
        diseaseDetection: modelInfo.diseaseModel,
        satelliteAnalysis: modelInfo.ndviModel,
        yieldPrediction: modelInfo.yieldModel,
        iotIntegration: true,
        predictiveAnalytics: true
      },
      supportedImageFormats: ['image/jpeg', 'image/png', 'image/webp'],
      maxImageSize: '10MB',
      supportedCrops: [
        'maize', 'beans', 'tomatoes', 'onions', 'potatoes', 
        'cassava', 'rice', 'wheat', 'sorghum', 'millet'
      ],
      supportedDiseases: [
        'Gray Leaf Spot', 'Maize Blight', 'Tomato Blight', 
        'Bean Rust', 'Cassava Mosaic Virus'
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
 * Get comprehensive field analysis
 * GET /api/ai/crop-monitoring/field-analysis?fieldId=xxx&tenantId=xxx
 */
async function handleFieldAnalysis(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fieldId, tenantId } = req.query;

    if (!fieldId || !tenantId) {
      return res.status(400).json({ 
        error: 'Missing required parameters: fieldId and tenantId' 
      });
    }

    // Verify field access
    const { data: field, error: fieldError } = await supabase
      .from('fields')
      .select('*')
      .eq('id', fieldId)
      .eq('tenant_id', tenantId)
      .single();

    if (fieldError || !field) {
      return res.status(403).json({ error: 'Field not found or access denied' });
    }

    // Get recent AI analysis data from database
    const [diseaseDetections, satelliteAnalyses, predictions] = await Promise.all([
      supabase
        .from('ai_disease_detections')
        .select('*')
        .eq('field_id', fieldId)
        .order('created_at', { ascending: false })
        .limit(5),
      
      supabase
        .from('ai_satellite_analysis')
        .select('*')
        .eq('field_id', fieldId)
        .order('analysis_date', { ascending: false })
        .limit(5),
      
      supabase
        .from('ai_predictive_analytics')
        .select('*')
        .eq('field_id', fieldId)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    return res.status(200).json({
      success: true,
      field: {
        id: field.id,
        name: field.field_name,
        size: field.field_size,
        location: field.field_location,
        currentCrop: field.current_crop,
        status: field.field_status
      },
      analysis: {
        diseaseDetections: diseaseDetections.data || [],
        satelliteAnalyses: satelliteAnalyses.data || [],
        predictions: predictions.data || []
      },
      summary: {
        lastDiseaseDetection: diseaseDetections.data?.[0]?.created_at || null,
        lastSatelliteAnalysis: satelliteAnalyses.data?.[0]?.analysis_date || null,
        lastPrediction: predictions.data?.[0]?.created_at || null,
        currentNDVI: satelliteAnalyses.data?.[0]?.ndvi_score || null,
        vegetationHealth: satelliteAnalyses.data?.[0]?.vegetation_health || null
      }
    });
  } catch (error) {
    console.error('Field analysis error:', error);
    return res.status(500).json({ 
      error: 'Failed to get field analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Rate limiting for AI requests
 */
const aiRequestCounts = new Map<string, { count: number; resetTime: number }>();

function isAIRateLimited(tenantId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 50; // Max 50 AI requests per minute per tenant

  const key = tenantId;
  const current = aiRequestCounts.get(key);

  if (!current || now > current.resetTime) {
    aiRequestCounts.set(key, { count: 1, resetTime: now + windowMs });
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
  for (const [key, data] of aiRequestCounts.entries()) {
    if (now > data.resetTime) {
      aiRequestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes