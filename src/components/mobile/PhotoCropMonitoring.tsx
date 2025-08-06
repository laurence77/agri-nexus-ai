import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Plus, Trash2 } from 'lucide-react';

interface CropPhoto {
  id: string;
  photoUrl: string;
  notes: string;
  timestamp: string;
}

const LOCAL_STORAGE_KEY = 'cropPhotoMonitoring';

export const PhotoCropMonitoring: React.FC = () => {
  const [photos, setPhotos] = useState<CropPhoto[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [newNotes, setNewNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewPhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = () => {
    if (!newPhoto) return;
    const photo: CropPhoto = {
      id: `photo-${Date.now()}`,
      photoUrl: newPhoto,
      notes: newNotes,
      timestamp: new Date().toISOString()
    };
    const updated = [photo, ...photos];
    setPhotos(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    setNewPhoto(null);
    setNewNotes('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeletePhoto = (id: string) => {
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-orange-500" />
          Photo-based Crop Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2 items-center">
          <Input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            className="w-auto"
          />
          <Textarea
            placeholder="Add notes or observations..."
            value={newNotes}
            onChange={e => setNewNotes(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleAddPhoto} disabled={!newPhoto} variant="outline">
            <Plus className="w-4 h-4 mr-1" /> Add Photo
          </Button>
        </div>
        {newPhoto && (
          <div className="mb-4">
            <img src={newPhoto} alt="Preview" className="w-32 h-32 object-cover rounded shadow" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="relative border rounded-lg p-2 bg-white/80">
              <img src={photo.photoUrl} alt="Crop" className="w-full h-32 object-cover rounded mb-2" />
              <div className="text-xs text-gray-700 mb-1">{photo.notes}</div>
              <div className="text-xs text-gray-500 mb-1">{new Date(photo.timestamp).toLocaleString()}</div>
              <Button size="icon" variant="ghost" className="absolute top-1 right-1" onClick={() => handleDeletePhoto(photo.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
        {photos.length === 0 && (
          <div className="text-gray-400 text-sm mt-4">No crop photos yet. Add your first photo above!</div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoCropMonitoring;