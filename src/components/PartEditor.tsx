import { ScriptPart } from '@/types/script';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { InspirationPanel } from './InspirationPanel';
import { Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PartEditorProps {
  part: ScriptPart;
  partNumber: number;
  canDelete: boolean;
  onUpdate: (updates: Partial<ScriptPart>) => void;
  onDelete: () => void;
  onAddInspiration: (inspiration: { type: 'link' | 'image'; url: string; title?: string }) => void;
  onRemoveInspiration: (inspirationId: string) => void;
}

export const PartEditor = ({
  part,
  partNumber,
  canDelete,
  onUpdate,
  onDelete,
  onAddInspiration,
  onRemoveInspiration,
}: PartEditorProps) => {
  return (
    <div className="glass-card p-5 space-y-4 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <GripVertical className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">
            Part {partNumber}
          </span>
        </div>
        <div className="flex-1">
          <Input
            value={part.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Part title..."
            className="h-8 bg-transparent border-none px-0 text-sm font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Textarea
            value={part.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Write your script for this part..."
            className="min-h-[200px] bg-secondary/30 border-border/50 resize-none focus-visible:ring-primary/50"
          />
        </div>
        <div>
          <InspirationPanel
            inspirations={part.inspirations}
            onAdd={onAddInspiration}
            onRemove={onRemoveInspiration}
          />
        </div>
      </div>
    </div>
  );
};
