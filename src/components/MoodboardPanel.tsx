import { useState, useRef, useEffect } from 'react';
import { Image, Upload, X, Loader2, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MoodboardImage } from '@/types/script';

const MOODBOARD_STORAGE_KEY = 'general-moodboard';

interface MoodboardPanelProps {
  onSelectImage?: (url: string) => void;
  selectionMode?: boolean;
}

export const MoodboardPanel = ({ onSelectImage, selectionMode = false }: MoodboardPanelProps) => {
  const [images, setImages] = useState<MoodboardImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(MOODBOARD_STORAGE_KEY);
    if (stored) {
      setImages(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(MOODBOARD_STORAGE_KEY, JSON.stringify(images));
  }, [images]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
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

        const newImage: MoodboardImage = {
          id: Math.random().toString(36).substring(2, 15),
          url: publicUrl,
          createdAt: new Date(),
        };

        setImages(prev => [...prev, newImage]);
      }
      toast.success('Images uploaded successfully');
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

  const handleRemove = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleImageClick = (url: string) => {
    if (selectionMode && onSelectImage) {
      onSelectImage(url);
    }
  };

  // Calculate grid columns based on image count for 3x4 base grid
  const getGridClass = () => {
    const count = images.length;
    if (count <= 12) return 'grid-cols-3'; // 3 columns for up to 12 images
    if (count <= 20) return 'grid-cols-4'; // 4 columns for up to 20 images
    if (count <= 30) return 'grid-cols-5'; // 5 columns for up to 30 images
    return 'grid-cols-6'; // 6 columns for more
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-primary" />
          <h3 className="font-medium">General Moodboard</h3>
        </div>
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
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Add Images
            </>
          )}
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-lg">
          <div className="text-center p-6">
            <Image className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Upload images to your moodboard
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className={`grid ${getGridClass()} gap-2`}>
            {images.map((img) => (
              <div
                key={img.id}
                className={`group relative aspect-square bg-secondary/50 rounded-lg overflow-hidden ${
                  selectionMode ? 'cursor-pointer hover:ring-2 hover:ring-primary' : ''
                }`}
                onClick={() => handleImageClick(img.url)}
              >
                <img
                  src={img.url}
                  alt="Moodboard"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                {!selectionMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(img.id);
                    }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
