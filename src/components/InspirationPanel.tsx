import { useState, useRef } from 'react';
import { Inspiration } from '@/types/script';
import { Link2, Image, X, Plus, ExternalLink, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InspirationPanelProps {
  inspirations: Inspiration[];
  onAdd: (inspiration: Omit<Inspiration, 'id'>) => void;
  onRemove: (id: string) => void;
}

export const InspirationPanel = ({ inspirations, onAdd, onRemove }: InspirationPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      onAdd({ type: 'link', url: linkUrl.trim(), title: linkTitle.trim() || undefined });
      setLinkUrl('');
      setLinkTitle('');
      setIsOpen(false);
    }
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      onAdd({ type: 'image', url: imageUrl.trim() });
      setImageUrl('');
      setIsOpen(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('inspirations')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('inspirations')
        .getPublicUrl(filePath);

      onAdd({ type: 'image', url: publicUrl });
      setIsOpen(false);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            onAdd({ type: 'image', url: dataUrl });
          };
          reader.readAsDataURL(blob);
          e.preventDefault();
        }
      }
    }
  };

  return (
    <div className="space-y-3" onPaste={handlePaste}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">Inspiration</h4>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Inspiration</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="link" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="link">
                  <Link2 className="w-4 h-4 mr-2" />
                  Link
                </TabsTrigger>
                <TabsTrigger value="image">
                  <Image className="w-4 h-4 mr-2" />
                  Image
                </TabsTrigger>
              </TabsList>
              <TabsContent value="link" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Paste URL..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                  <Input
                    placeholder="Title (optional)"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddLink} className="w-full" disabled={!linkUrl.trim()}>
                  Add Link
                </Button>
              </TabsContent>
              <TabsContent value="image" className="space-y-4 mt-4">
                <Input
                  placeholder="Paste image URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
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
                      Upload from device
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  You can also paste images directly anywhere on the editor
                </p>
                <Button onClick={handleAddImage} className="w-full" disabled={!imageUrl.trim()}>
                  Add Image URL
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {inspirations.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground">
            No inspiration yet. Add links or paste images.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {inspirations.map((item) => (
            <div
              key={item.id}
              className="group relative bg-secondary/50 rounded-lg overflow-hidden animate-scale-in"
            >
              {item.type === 'image' ? (
                <div className="aspect-video">
                  <img
                    src={item.url}
                    alt="Inspiration"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              ) : (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 hover:bg-secondary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs text-foreground line-clamp-1 flex-1">
                    {item.title || item.url}
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </a>
              )}
              <button
                onClick={() => onRemove(item.id)}
                className="absolute top-1 right-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
