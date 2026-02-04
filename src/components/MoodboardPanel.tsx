import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, Loader2, Plus, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MoodboardImage } from '@/types/script';
import { ImageOverlay } from './ImageOverlay';

const MOODBOARD_STORAGE_KEY = 'general-moodboard';

interface MoodboardPanelProps {
  onSelectImage?: (url: string) => void;
  selectionMode?: boolean;
}

export const MoodboardPanel = ({ onSelectImage, selectionMode = false }: MoodboardPanelProps) => {
  const [images, setImages] = useState<MoodboardImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(MOODBOARD_STORAGE_KEY);
    if (stored) {
      setImages(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(MOODBOARD_STORAGE_KEY, JSON.stringify(images));
  }, [images]);

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} is not an image`);
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `general/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('moodboard')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('moodboard')
      .getPublicUrl(filePath);

    // Get image dimensions
    return new Promise<MoodboardImage>((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          id: Math.random().toString(36).substring(2, 15),
          url: publicUrl,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          createdAt: new Date(),
        });
      };
      img.onerror = () => {
        resolve({
          id: Math.random().toString(36).substring(2, 15),
          url: publicUrl,
          createdAt: new Date(),
        });
      };
      img.src = publicUrl;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImages: MoodboardImage[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadImage(file);
        if (result) newImages.push(result);
      }
      setImages(prev => [...prev, ...newImages]);
      if (newImages.length > 0) {
        toast.success('Images uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          setIsUploading(true);
          try {
            const result = await uploadImage(blob);
            if (result) {
              setImages(prev => [...prev, result]);
              toast.success('Image pasted and uploaded');
            }
          } catch (error) {
            console.error('Paste error:', error);
            toast.error('Failed to upload pasted image');
          } finally {
            setIsUploading(false);
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleImageClick = (img: MoodboardImage) => {
    if (selectionMode && onSelectImage) {
      onSelectImage(img.url);
    } else {
      setOverlayImage(img.url);
    }
  };

  // Calculate grid columns based on image count
  const getGridColumns = () => {
    const count = images.length;
    if (count <= 12) return 3;
    if (count <= 20) return 4;
    if (count <= 30) return 5;
    if (count <= 42) return 6;
    if (count <= 56) return 7;
    return 8;
  };

  const gridCols = getGridColumns();

  return (
    <div 
      ref={containerRef}
      className="h-full flex flex-col bg-background"
    >
      {/* Action buttons at top */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImagePlus className="w-4 h-4" />
              Add Images
            </>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">
          or paste directly
        </span>
      </div>

      {/* Moodboard grid */}
      <div className="flex-1 overflow-hidden">
        {images.length === 0 ? (
          <div 
            className="h-full flex items-center justify-center cursor-pointer hover:bg-secondary/20 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center p-6">
              <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Click to add or paste images
              </p>
            </div>
          </div>
        ) : (
          <div 
            className="moodboard-grid h-full"
            style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
          >
            {images.map((img) => (
              <div
                key={img.id}
                className={`group relative bg-secondary cursor-pointer ${
                  selectionMode ? 'hover:ring-2 hover:ring-primary hover:ring-inset' : ''
                }`}
                onClick={() => handleImageClick(img)}
              >
                <img
                  src={img.url}
                  alt="Moodboard"
                  className="moodboard-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                {!selectionMode && (
                  <button
                    onClick={(e) => handleRemove(e, img.id)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ImageOverlay 
        imageUrl={overlayImage} 
        onClose={() => setOverlayImage(null)} 
      />
    </div>
  );
};
