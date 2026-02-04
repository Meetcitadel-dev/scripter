import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageOverlayProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageOverlay = ({ imageUrl, onClose }: ImageOverlayProps) => {
  if (!imageUrl) return null;

  return (
    <Dialog open={!!imageUrl} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 hover:bg-destructive transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-[90vh] object-contain mx-auto"
        />
      </DialogContent>
    </Dialog>
  );
};
