import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MoodboardImage } from '@/types/script';

const MOODBOARD_STORAGE_KEY = 'general-moodboard';

interface MoodboardPanelProps {
  onSelectImage?: (url: string) => void;
  selectionMode?: boolean;
  /** UI chrome: default shows internal upload button; "none" hides header chrome (home layout uses external buttons). */
  chrome?: 'default' | 'none';
  /** When this counter changes, the panel will open the file picker (used by home Add Images button). */
  uploadRequestKey?: number;
}

export const MoodboardPanel = ({
  onSelectImage,
  selectionMode = false,
  chrome = 'default',
  uploadRequestKey,
}: MoodboardPanelProps) => {
  const [images, setImages] = useState<MoodboardImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  // External trigger from parent (homepage Add Images button)
  // Only react when the key actually changes, so we don't auto-open
  // the file picker when navigating back to the homepage.
  const lastUploadKeyRef = useRef<number | null>(null);
  useEffect(() => {
    if (selectionMode) return;
    if (uploadRequestKey == null) return;

    if (lastUploadKeyRef.current === uploadRequestKey) {
      return;
    }
    lastUploadKeyRef.current = uploadRequestKey;

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [uploadRequestKey, selectionMode]);

  const uploadImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name || 'File'} is not an image`);
      return;
    }

    const fileExtFromName = file.name?.split('.').pop();
    const fileExtFromType = file.type.split('/')[1];
    const fileExt = (fileExtFromName || fileExtFromType || 'png').toLowerCase();
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
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadImageFile(file);
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
    if (selectionMode && onSelectImage) return onSelectImage(url);
    setPreviewUrl(url);
  };

  const gridColsClass = useMemo(() => {
    const count = images.length;
    if (count <= 12) return 'grid-cols-3';
    if (count <= 20) return 'grid-cols-4';
    if (count <= 30) return 'grid-cols-5';
    return 'grid-cols-6';
  }, [images.length]);

  const processClipboardItems = async (items: DataTransferItemList | ClipboardItem[]) => {
    const files: File[] = [];
    // Support both DataTransferItemList (browser paste) and ClipboardItem[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr: any[] = Array.from(items as any);
    for (const item of arr) {
      const type = 'type' in item ? item.type : item.types?.[0];
      if (type && String(type).includes('image')) {
        const file = 'getAsFile' in item ? item.getAsFile() : await (item as ClipboardItem).getType(type);
        if (file) files.push(file as File);
      }
    }
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (const f of files) {
        await uploadImageFile(f);
      }
      toast.success('Image pasted to moodboard');
    } catch (error) {
      console.error('Paste upload error:', error);
      toast.error('Failed to add pasted image');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    await processClipboardItems(e.clipboardData.items);
  };

  // Global paste listener so users can paste even if focus is elsewhere
  useEffect(() => {
    if (selectionMode) return;
    const handler = async (e: ClipboardEvent) => {
      // Ignore if a text input/textarea is focused
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable)) {
        return;
      }
      e.preventDefault();
      // @ts-expect-error types: ClipboardEvent has clipboardData
      await processClipboardItems(e.clipboardData.items);
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [selectionMode]);

  return (
    <div className="h-full flex flex-col" onPaste={handlePaste}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {chrome === 'default' && !selectionMode && (
        <div className="flex items-center justify-end mb-3">
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
      )}

      {images.length === 0 ? (
        <div className="flex-1 flex items-center justify-center border border-dashed border-border">
          <div className="text-center p-6">
            <Image className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Paste or add images to your moodboard
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto scrollbar-theme">
          <div className={`grid ${gridColsClass} gap-0`}>
            {images.map((img) => (
              <div
                key={img.id}
                className={`group relative aspect-square bg-secondary/50 overflow-hidden border border-black ${
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
                    className="absolute top-1 right-1 p-1 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlay preview */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 flex items-center justify-center bg-background/95">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
