import { useState } from 'react';
import { Inspiration } from '@/types/script';
import { Link2, Image, X, Plus, ExternalLink } from 'lucide-react';
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
                <p className="text-xs text-muted-foreground">
                  You can also paste images directly anywhere on the editor
                </p>
                <Button onClick={handleAddImage} className="w-full" disabled={!imageUrl.trim()}>
                  Add Image
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
