import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, FileText, Layers } from 'lucide-react';

interface CreateScriptDialogProps {
  onCreate: (title: string, isMultiPart: boolean) => void;
}

export const CreateScriptDialog = ({ onCreate }: CreateScriptDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isMultiPart, setIsMultiPart] = useState(false);

  const handleCreate = () => {
    onCreate(title || 'Untitled Script', isMultiPart);
    setTitle('');
    setIsMultiPart(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 glow-primary">
          <Plus className="w-4 h-4" />
          New Script
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Script</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter script title..."
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          <div className="space-y-3">
            <Label>Script Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsMultiPart(false)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  !isMultiPart
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-border/80'
                }`}
              >
                <FileText className={`w-5 h-5 mb-2 ${!isMultiPart ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="font-medium text-sm">Single Script</p>
                <p className="text-xs text-muted-foreground mt-1">
                  One continuous script
                </p>
              </button>
              <button
                onClick={() => setIsMultiPart(true)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isMultiPart
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-border/80'
                }`}
              >
                <Layers className={`w-5 h-5 mb-2 ${isMultiPart ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="font-medium text-sm">Multi-Part</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Break into sections
                </p>
              </button>
            </div>
          </div>

          <Button onClick={handleCreate} className="w-full">
            Create Script
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
