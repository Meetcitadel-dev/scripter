import { useState, useRef } from 'react';
import { Upload, X, Loader2, ImagePlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MoodboardPanel } from './MoodboardPanel';
import { ImageOverlay } from './ImageOverlay';

interface ProjectMoodboardProps {
  scriptId: string;
  images: string[];
  onAddImage: (url: string) => void;
  onRemoveImage: (url: string) => void;
}

// Fixed dimensions for project moodboard
const MOODBOARD_HEIGHT = 200;

export const ProjectMoodboard = ({
  scriptId,
  images,
  onAddImage,
  onRemoveImage,
}: ProjectMoodboardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const filePath = `projects/${scriptId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('moodboard')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('moodboard')
          .getPublicUrl(filePath);

        onAddImage(publicUrl);
      }
      toast.success('Images added to project moodboard');
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

  const handleSelectFromMoodboard = (url: string) => {
    onAddImage(url);
    setIsDialogOpen(false);
    toast.success('Image added from moodboard');
  };

  const handleImageClick = (url: string) => {
    setOverlayImage(url);
  };

  // Calculate grid columns based on image count to fit in fixed height
  const getGridColumns = () => {
    const count = images.length;
    if (count <= 3) return 3;
    if (count <= 6) return 4;
    if (count <= 10) return 5;
    if (count <= 15) return 6;
    if (count <= 21) return 7;
    return 8;
  };

  const gridCols = getGridColumns();

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <h4 className="text-sm font-medium">Project Moodboard</h4>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <ImagePlus className="w-3.5 h-3.5 mr-1" />
                From Moodboard
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Select from General Moodboard</DialogTitle>
              </DialogHeader>
              <div className="h-[60vh] overflow-auto">
                <MoodboardPanel 
                  selectionMode 
                  onSelectImage={handleSelectFromMoodboard} 
                />
              </div>
            </DialogContent>
          </Dialog>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 mr-1" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>

      <div style={{ height: MOODBOARD_HEIGHT }} className="overflow-hidden">
        {images.length === 0 ? (
          <div 
            className="h-full flex items-center justify-center cursor-pointer hover:bg-secondary/20 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center">
              <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Add images to this project
              </p>
            </div>
          </div>
        ) : (
          <div 
            className="moodboard-grid h-full"
            style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
          >
            {images.map((url, index) => (
              <div
                key={index}
                className="group relative bg-secondary cursor-pointer"
                onClick={() => handleImageClick(url)}
              >
                <img
                  src={url}
                  alt="Project moodboard"
                  className="moodboard-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(url);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
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
