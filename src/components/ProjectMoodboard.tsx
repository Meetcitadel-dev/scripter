import { useState, useRef } from 'react';
import { Image, Upload, X, Loader2, Grid3X3, ImagePlus } from 'lucide-react';
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

interface ProjectMoodboardProps {
  scriptId: string;
  images: string[];
  onAddImage: (url: string) => void;
  onRemoveImage: (url: string) => void;
}

export const ProjectMoodboard = ({
  scriptId,
  images,
  onAddImage,
  onRemoveImage,
}: ProjectMoodboardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  // Grid settings: 5 square tiles per row in a scrollable, fixed-height viewport.
  const MOODBOARD_COLS = 5;
  const MOODBOARD_FIXED_HEIGHT = 220;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-medium">Project Moodboard</h4>
        </div>
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

      <div
        className="w-full overflow-auto scrollbar-theme"
        style={{ height: MOODBOARD_FIXED_HEIGHT }}
      >
        {images.length === 0 ? (
          <div className="border border-dashed border-border flex items-center justify-center text-center h-full">
            <div>
              <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Add images specific to this project
              </p>
            </div>
          </div>
        ) : (
          <div
            className="grid gap-0 w-full"
            style={{ gridTemplateColumns: `repeat(${MOODBOARD_COLS}, 1fr)` }}
          >
            {images.map((url, index) => (
              <div
                key={index}
                className="group relative bg-secondary/50 overflow-hidden cursor-pointer border border-black aspect-square"
                onClick={() => setPreviewUrl(url)}
              >
                <img
                  src={url}
                  alt="Project moodboard"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(url);
                  }}
                  className="absolute top-1 right-1 p-1 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview at original resolution */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 flex items-center justify-center bg-background/95">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
              style={{ imageRendering: 'auto' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
