import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Trash2, Save } from 'lucide-react';

// Optionally import Leaflet if available
let MapContainer, TileLayer, Polygon, Marker;
try {
  // @ts-ignore
  ({ MapContainer, TileLayer, Polygon, Marker } = require('react-leaflet'));
  require('leaflet/dist/leaflet.css');
} catch {}

interface GPSPoint {
  lat: number;
  lng: number;
}

const LOCAL_STORAGE_KEY = 'gpsFieldMapping';

export const GPSFieldMapping: React.FC = () => {
  const [points, setPoints] = useState<GPSPoint[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [currentLocation, setCurrentLocation] = useState<GPSPoint | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setError('Location error: ' + err.message)
      );
    } else {
      setError('Geolocation not supported');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(points));
  }, [points]);

  const addCurrentPoint = () => {
    if (currentLocation) {
      setPoints([...points, currentLocation]);
    }
  };

  const clearMapping = () => {
    setPoints([]);
  };

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          GPS Field Mapping
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2 items-center">
          <Button onClick={addCurrentPoint} disabled={!currentLocation} variant="outline">
            <Plus className="w-4 h-4 mr-1" /> Add Current Location
          </Button>
          <Button onClick={clearMapping} variant="destructive" disabled={points.length === 0}>
            <Trash2 className="w-4 h-4 mr-1" /> Clear
          </Button>
        </div>
        <div className="mb-4 text-xs text-gray-500">
          {currentLocation ? (
            <span>Current: {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}</span>
          ) : (
            <span>Getting current location...</span>
          )}
        </div>
        {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
        <div className="h-64 w-full mb-4">
          {MapContainer && points.length > 0 ? (
            <MapContainer center={points[0]} zoom={17} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polygon positions={points.map(p => [p.lat, p.lng])} color="blue" />
              {points.map((p, i) => (
                <Marker key={i} position={[p.lat, p.lng]} />
              ))}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <span>No field boundary mapped yet.</span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          <div>Points:</div>
          <ul className="list-decimal list-inside">
            {points.map((p, i) => (
              <li key={i}>{p.lat.toFixed(5)}, {p.lng.toFixed(5)}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GPSFieldMapping;