import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Camera, 
  CameraOff, 
  RotateCcw,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Flashlight,
  FlashlightOff,
  SwitchCamera,
  Maximize,
  Minimize
} from 'lucide-react';

interface QRScanResult {
  id: string;
  data: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  farmerInfo?: {
    farmerId: string;
    name: string;
    phone: string;
    village: string;
  };
  status: 'scanned' | 'processed' | 'error';
}

interface QRScannerProps {
  onScanSuccess?: (result: QRScanResult) => void;
  onScanError?: (error: string) => void;
  autoProcess?: boolean;
  scanMode?: 'farmer' | 'farm' | 'livestock' | 'crop' | 'generic';
}

export function QRScanner({ 
  onScanSuccess, 
  onScanError, 
  autoProcess = false,
  scanMode = 'generic'
}: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasFlash, setHasFlash] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scanResults, setScanResults] = useState<QRScanResult[]>([]);
  const [lastScan, setLastScan] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load previous scan results from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qr_scan_results');
      if (stored) {
        const results = JSON.parse(stored).map((result: any) => ({
          ...result,
          timestamp: new Date(result.timestamp)
        }));
        setScanResults(results);
      }
    } catch (error) {
      console.error('Error loading scan results:', error);
    }
  }, []);

  const saveScanResults = useCallback((results: QRScanResult[]) => {
    try {
      localStorage.setItem('qr_scan_results', JSON.stringify(results));
      setScanResults(results);
    } catch (error) {
      console.error('Error saving scan results:', error);
    }
  }, []);

  const startScanning = useCallback(async () => {
    try {
      setErrorMessage('');
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      // Check for flash capability
      const videoTrack = mediaStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      setHasFlash('torch' in capabilities);

      setIsScanning(true);
      
      // Start QR code detection
      startQRDetection();

    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrorMessage('Unable to access camera. Please check permissions.');
      if (onScanError) {
        onScanError('Camera access denied');
      }
    }
  }, [facingMode, onScanError]);

  const stopScanning = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setFlashEnabled(false);
  }, [stream]);

  const startQRDetection = useCallback(() => {
    const detectQRCode = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(detectQRCode);
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        // Get image data for QR detection
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Try to detect QR code using jsQR (would need to install this library)
        // For now, we'll simulate QR detection with a simple pattern matching
        const qrResult = simulateQRDetection(imageData);
        
        if (qrResult && qrResult !== lastScan) {
          setLastScan(qrResult);
          handleQRDetection(qrResult);
        }
      } catch (error) {
        console.error('Error during QR detection:', error);
      }

      if (isScanning) {
        requestAnimationFrame(detectQRCode);
      }
    };

    requestAnimationFrame(detectQRCode);
  }, [isScanning, lastScan]);

  // Simulate QR detection (in real implementation, use jsQR library)
  const simulateQRDetection = (imageData: ImageData): string | null => {
    // This is a placeholder - in a real implementation you would use jsQR
    // or a similar library to detect QR codes from the image data
    
    // For demo purposes, we'll randomly return a QR code every few seconds
    if (Math.random() < 0.01) { // 1% chance per frame
      const mockQRData = generateMockQRData();
      return mockQRData;
    }
    return null;
  };

  const generateMockQRData = (): string => {
    const mockData = {
      type: scanMode,
      id: `${scanMode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      data: {
        name: `Sample ${scanMode}`,
        location: 'Kaduna, Nigeria',
        ...(scanMode === 'farmer' && {
          phone: '+234' + Math.floor(Math.random() * 10000000000),
          farmSize: Math.floor(Math.random() * 10) + 1
        })
      }
    };
    return JSON.stringify(mockData);
  };

  const handleQRDetection = useCallback(async (qrData: string) => {
    try {
      // Parse QR data
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch {
        // If not JSON, treat as plain text
        parsedData = { data: qrData };
      }

      // Get current location
      const location = await getCurrentLocation();

      const scanResult: QRScanResult = {
        id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        data: qrData,
        timestamp: new Date(),
        location,
        status: 'scanned',
        ...(parsedData.type === 'farmer' && {
          farmerInfo: {
            farmerId: parsedData.id,
            name: parsedData.data.name,
            phone: parsedData.data.phone,
            village: parsedData.data.location
          }
        })
      };

      // Add to results
      const updatedResults = [scanResult, ...scanResults];
      saveScanResults(updatedResults);

      // Process based on scan mode
      if (autoProcess) {
        await processQRData(scanResult);
      }

      // Callback
      if (onScanSuccess) {
        onScanSuccess(scanResult);
      }

      // Visual feedback
      showScanSuccess();

    } catch (error) {
      console.error('Error processing QR scan:', error);
      if (onScanError) {
        onScanError('Error processing QR code');
      }
    }
  }, [scanResults, saveScanResults, autoProcess, onScanSuccess, onScanError]);

  const getCurrentLocation = (): Promise<{latitude: number, longitude: number} | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          resolve(undefined);
        },
        { timeout: 5000 }
      );
    });
  };

  const processQRData = async (scanResult: QRScanResult) => {
    try {
      // Process based on scan mode
      switch (scanMode) {
        case 'farmer':
          await processFarmerQR(scanResult);
          break;
        case 'farm':
          await processFarmQR(scanResult);
          break;
        case 'livestock':
          await processLivestockQR(scanResult);
          break;
        case 'crop':
          await processCropQR(scanResult);
          break;
        default:
          console.log('Generic QR processed:', scanResult);
      }

      // Update status
      const updatedResults = scanResults.map(result => 
        result.id === scanResult.id 
          ? { ...result, status: 'processed' as const }
          : result
      );
      saveScanResults(updatedResults);

    } catch (error) {
      console.error('Error processing QR data:', error);
      
      // Update status to error
      const updatedResults = scanResults.map(result => 
        result.id === scanResult.id 
          ? { ...result, status: 'error' as const }
          : result
      );
      saveScanResults(updatedResults);
    }
  };

  const processFarmerQR = async (scanResult: QRScanResult) => {
    // Process farmer QR code
    console.log('Processing farmer QR:', scanResult);
    // In real implementation, this would sync with farmer database
  };

  const processFarmQR = async (scanResult: QRScanResult) => {
    // Process farm QR code
    console.log('Processing farm QR:', scanResult);
    // In real implementation, this would update farm records
  };

  const processLivestockQR = async (scanResult: QRScanResult) => {
    // Process livestock QR code
    console.log('Processing livestock QR:', scanResult);
    // In real implementation, this would update livestock records
  };

  const processCropQR = async (scanResult: QRScanResult) => {
    // Process crop QR code
    console.log('Processing crop QR:', scanResult);
    // In real implementation, this would update crop records
  };

  const showScanSuccess = () => {
    // Visual feedback for successful scan
    const video = videoRef.current;
    if (video) {
      video.style.filter = 'brightness(1.5)';
      setTimeout(() => {
        video.style.filter = 'none';
      }, 200);
    }
  };

  const toggleFlash = async () => {
    if (!stream || !hasFlash) return;

    try {
      const videoTrack = stream.getVideoTracks()[0];
      await videoTrack.applyConstraints({
        advanced: [{ torch: !flashEnabled }]
      });
      setFlashEnabled(!flashEnabled);
    } catch (error) {
      console.error('Error toggling flash:', error);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isScanning) {
      stopScanning();
      setTimeout(() => startScanning(), 100);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(scanResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr_scan_results_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const clearResults = () => {
    if (window.confirm('Clear all scan results? This cannot be undone.')) {
      setScanResults([]);
      localStorage.removeItem('qr_scan_results');
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanner Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Scanner - {scanMode.charAt(0).toUpperCase() + scanMode.slice(1)} Mode
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isScanning ? "default" : "secondary"}>
                {isScanning ? 'Scanning' : 'Stopped'}
              </Badge>
              {scanMode !== 'generic' && (
                <Badge variant="outline">
                  Auto-process: {autoProcess ? 'ON' : 'OFF'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Video Preview */}
            <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'aspect-video'} bg-gray-900 rounded-lg overflow-hidden`}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              
              {/* Scanning Overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Scanning Frame */}
                    <div className="w-64 h-64 border-2 border-white border-dashed rounded-lg animate-pulse">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
                    </div>
                    {/* Scanning Line */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-1 bg-green-500 animate-ping"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Camera Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                {hasFlash && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleFlash}
                    className="bg-black bg-opacity-50 hover:bg-opacity-70"
                  >
                    {flashEnabled ? (
                      <FlashlightOff className="h-4 w-4" />
                    ) : (
                      <Flashlight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={switchCamera}
                  className="bg-black bg-opacity-50 hover:bg-opacity-70"
                >
                  <SwitchCamera className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="bg-black bg-opacity-50 hover:bg-opacity-70"
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-red-500 text-white p-4 rounded-lg text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden Canvas for QR Detection */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanner Controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              {!isScanning ? (
                <Button onClick={startScanning} className="bg-green-600 hover:bg-green-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanning
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="outline">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Scanning
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scan Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Scan Results ({scanResults.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportResults} disabled={scanResults.length === 0}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={clearResults} disabled={scanResults.length === 0}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {scanResults.length === 0 ? (
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No QR codes scanned yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Start scanning to see results here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scanResults.slice(0, 10).map((result) => (
                <div key={result.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {result.status === 'processed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : result.status === 'error' ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <QrCode className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="font-medium">
                        {result.farmerInfo ? result.farmerInfo.name : 'QR Code'}
                      </span>
                      <Badge variant={
                        result.status === 'processed' ? 'default' :
                        result.status === 'error' ? 'destructive' : 'secondary'
                      }>
                        {result.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Scanned: {result.timestamp.toLocaleString()}</p>
                      {result.farmerInfo && (
                        <>
                          <p>Phone: {result.farmerInfo.phone}</p>
                          <p>Village: {result.farmerInfo.village}</p>
                        </>
                      )}
                      {result.location && (
                        <p>Location: {result.location.latitude.toFixed(6)}, {result.location.longitude.toFixed(6)}</p>
                      )}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Raw Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {result.data}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              ))}

              {scanResults.length > 10 && (
                <div className="text-center pt-4 text-sm text-gray-600">
                  Showing 10 of {scanResults.length} results
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default QRScanner;