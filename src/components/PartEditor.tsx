import { ScriptPart } from '@/types/script';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { InspirationPanel } from './InspirationPanel';
import { Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PartEditorProps {
  part: ScriptPart;
  partNumber: number;
  canDelete: boolean;
  advancedMode?: boolean;
  onUpdate: (updates: Partial<ScriptPart>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAddInspiration: (inspiration: { type: 'link' | 'image'; url: string; title?: string }) => void;
  onRemoveInspiration: (inspirationId: string) => void;
  scriptId?: string;
  projectImages?: string[];
}

export const PartEditor = ({
  part,
  partNumber,
  canDelete,
  advancedMode = false,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddInspiration,
  onRemoveInspiration,
  scriptId,
  projectImages,
}: PartEditorProps) => {
  return (
    <div className="glass-card p-5 space-y-4 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-muted-foreground">
          <div className="flex flex-col items-center justify-center">
            <button
              type="button"
              disabled={!onMoveUp}
              onClick={onMoveUp}
              className="h-3 w-3 flex items-center justify-center disabled:opacity-30"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={!onMoveDown}
              onClick={onMoveDown}
              className="h-3 w-3 flex items-center justify-center disabled:opacity-30"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <GripVertical className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              {partNumber}
            </span>
          </div>
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
        <div className="lg:col-span-2 space-y-4">
          {advancedMode ? (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Scene depiction</label>
                <Textarea
                  value={part.sceneDepiction ?? ''}
                  onChange={(e) => onUpdate({ sceneDepiction: e.target.value })}
                  placeholder="Describe the scene, setting, action..."
                  className="min-h-[120px] bg-secondary/30 border-border/50 resize-none focus-visible:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Dialogue</label>
                <Textarea
                  value={part.content}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder="Write dialogue for this part..."
                  className="min-h-[200px] bg-secondary/30 border-border/50 resize-none focus-visible:ring-primary/50"
                />
              </div>
            </>
          ) : (
            <Textarea
              value={part.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Write your script for this part..."
              className="min-h-[200px] bg-secondary/30 border-border/50 resize-none focus-visible:ring-primary/50"
            />
          )}
        </div>
        <div>
          <InspirationPanel
            inspirations={part.inspirations}
            onAdd={onAddInspiration}
            onRemove={onRemoveInspiration}
            scriptId={scriptId}
            projectImages={projectImages}
          />
        </div>
      </div>
    </div>
  );
};
