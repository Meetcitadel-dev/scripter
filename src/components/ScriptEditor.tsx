import { useState, useEffect, useCallback } from 'react';
import { Script, ScriptPart, Soundtrack } from '@/types/script';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { InspirationPanel } from './InspirationPanel';
import { PartEditor } from './PartEditor';
import { MultiSoundtrackPlayer } from './MultiSoundtrackPlayer';
import { ProjectMoodboard } from './ProjectMoodboard';
import { ScriptPartsSplitView } from './ScriptPartsSplitView';
import { ArrowLeft, Plus, Layers, FileText, Columns, Settings2 } from 'lucide-react';

interface ScriptEditorProps {
  script: Script;
  onBack: () => void;
  onUpdate: (updates: Partial<Script>) => void;
  onAddPart: () => void;
  onUpdatePart: (partId: string, updates: Partial<ScriptPart>) => void;
  onDeletePart: (partId: string) => void;
  onAddInspiration: (inspiration: { type: 'link' | 'image'; url: string; title?: string }, partId?: string) => void;
  onRemoveInspiration: (inspirationId: string, partId?: string) => void;
  onReorderParts?: (newParts: ScriptPart[]) => void;
}

export const ScriptEditor = ({
  script,
  onBack,
  onUpdate,
  onAddPart,
  onUpdatePart,
  onDeletePart,
  onAddInspiration,
  onRemoveInspiration,
  onReorderParts,
}: ScriptEditorProps) => {
  const [title, setTitle] = useState(script.title);
  const [isSplitView, setIsSplitView] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [dragState, setDragState] = useState<{ draggingId: string | null; dragOverId: string | null }>({
    draggingId: null,
    dragOverId: null,
  });

  useEffect(() => {
    setTitle(script.title);
  }, [script.title]);

  const handleTitleBlur = () => {
    if (title !== script.title) {
      onUpdate({ title });
    }
  };

  const toggleMode = () => {
    if (script.isMultiPart) {
      const mergedContent = script.parts?.map(p => p.content).join('\n\n') || '';
      const mergedInspirations = script.parts?.flatMap(p => p.inspirations) || [];
      onUpdate({
        isMultiPart: false,
        content: mergedContent,
        inspirations: mergedInspirations,
        preservedParts: script.parts,
      });
    } else {
      if (script.preservedParts && script.preservedParts.length > 0) {
        onUpdate({
          isMultiPart: true,
          parts: script.preservedParts,
          content: undefined,
          inspirations: undefined,
          preservedParts: undefined,
        });
      } else {
        onUpdate({
          isMultiPart: true,
          parts: [{
            id: Math.random().toString(36).substring(2, 15),
            title: 'Part 1',
            content: script.content || '',
            inspirations: script.inspirations || [],
          }],
          content: undefined,
          inspirations: undefined,
        });
      }
    }
  };

  const handleSoundtracksUpdate = (soundtracks: Soundtrack[]) => {
    onUpdate({ soundtracks });
  };

  const handleMoodboardAdd = (url: string) => {
    onUpdate({ moodboard: [...(script.moodboard || []), url] });
  };

  const handleMoodboardRemove = (url: string) => {
    onUpdate({ moodboard: (script.moodboard || []).filter(u => u !== url) });
  };

  // Drag and drop handlers
  const handleDragStart = useCallback((partId: string) => {
    setDragState({ draggingId: partId, dragOverId: null });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, partId: string) => {
    e.preventDefault();
    setDragState(prev => ({ ...prev, dragOverId: partId }));
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState({ draggingId: null, dragOverId: null });
  }, []);

  const handleDrop = useCallback((targetId: string) => {
    if (!script.parts || !dragState.draggingId || dragState.draggingId === targetId) {
      handleDragEnd();
      return;
    }

    const newParts = [...script.parts];
    const dragIndex = newParts.findIndex(p => p.id === dragState.draggingId);
    const dropIndex = newParts.findIndex(p => p.id === targetId);

    if (dragIndex !== -1 && dropIndex !== -1) {
      const [draggedPart] = newParts.splice(dragIndex, 1);
      newParts.splice(dropIndex, 0, draggedPart);
      
      if (onReorderParts) {
        onReorderParts(newParts);
      } else {
        onUpdate({ parts: newParts });
      }
    }

    handleDragEnd();
  }, [script.parts, dragState.draggingId, onReorderParts, onUpdate, handleDragEnd]);

  // Get soundtracks, with backward compatibility
  const soundtracks: Soundtrack[] = script.soundtracks || 
    (script.soundtrackUrl ? [{ id: 'legacy', url: script.soundtrackUrl, name: script.soundtrackName || 'Track' }] : []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-9 w-9 p-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Untitled Script"
                className="text-xl font-semibold bg-transparent border-none px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Advanced Mode Toggle */}
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
              <Settings2 className={`w-4 h-4 ${isAdvancedMode ? 'text-primary' : 'text-muted-foreground'}`} />
              <Switch
                checked={isAdvancedMode}
                onCheckedChange={setIsAdvancedMode}
                id="advanced-mode"
              />
              <Label htmlFor="advanced-mode" className="text-xs text-muted-foreground cursor-pointer">
                Advanced
              </Label>
            </div>

            {/* Split View Toggle (only for multi-part) */}
            {script.isMultiPart && (
              <Button
                variant={isSplitView ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setIsSplitView(!isSplitView)}
                className="gap-2"
              >
                <Columns className="w-4 h-4" />
                Split View
              </Button>
            )}

            <div className="flex items-center gap-3 bg-secondary/50 rounded-lg px-3 py-2">
              <FileText className={`w-4 h-4 ${!script.isMultiPart ? 'text-primary' : 'text-muted-foreground'}`} />
              <Switch
                checked={script.isMultiPart}
                onCheckedChange={toggleMode}
                id="multi-part-mode"
              />
              <Layers className={`w-4 h-4 ${script.isMultiPart ? 'text-primary' : 'text-muted-foreground'}`} />
              <Label htmlFor="multi-part-mode" className="text-xs text-muted-foreground cursor-pointer">
                {script.isMultiPart ? 'Multi-part' : 'Single'}
              </Label>
            </div>
          </div>

          {/* Soundtrack Player */}
          <div className="mt-3">
            <MultiSoundtrackPlayer
              scriptId={script.id}
              soundtracks={soundtracks}
              onUpdate={handleSoundtracksUpdate}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Project Moodboard */}
        <div className="mb-6">
          <ProjectMoodboard
            scriptId={script.id}
            images={script.moodboard || []}
            onAddImage={handleMoodboardAdd}
            onRemoveImage={handleMoodboardRemove}
          />
        </div>

        {script.isMultiPart ? (
          isSplitView ? (
            <ScriptPartsSplitView
              parts={script.parts || []}
              isAdvancedMode={isAdvancedMode}
              onUpdatePart={onUpdatePart}
              onDeletePart={onDeletePart}
              onAddInspiration={onAddInspiration}
              onRemoveInspiration={onRemoveInspiration}
              scriptId={script.id}
              dragState={dragState}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          ) : (
            <div className="space-y-6">
              {script.parts?.map((part, index) => (
                <PartEditor
                  key={part.id}
                  part={part}
                  partNumber={index + 1}
                  canDelete={script.parts!.length > 1}
                  isAdvancedMode={isAdvancedMode}
                  onUpdate={(updates) => onUpdatePart(part.id, updates)}
                  onDelete={() => onDeletePart(part.id)}
                  onAddInspiration={(insp) => onAddInspiration(insp, part.id)}
                  onRemoveInspiration={(id) => onRemoveInspiration(id, part.id)}
                  scriptId={script.id}
                  isDragging={dragState.draggingId === part.id}
                  isDragOver={dragState.dragOverId === part.id}
                  onDragStart={() => handleDragStart(part.id)}
                  onDragOver={(e) => handleDragOver(e, part.id)}
                  onDragEnd={handleDragEnd}
                  onDrop={() => handleDrop(part.id)}
                />
              ))}
              
              <Button
                variant="outline"
                onClick={onAddPart}
                className="w-full border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Part
              </Button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {isAdvancedMode && (
                <div className="glass-card p-5">
                  <label className="text-xs text-muted-foreground mb-2 block">Scene Depiction</label>
                  <Textarea
                    value={script.sceneDepiction || ''}
                    onChange={(e) => onUpdate({ sceneDepiction: e.target.value })}
                    placeholder="Describe the scene, visuals, settings..."
                    className="min-h-[150px] bg-transparent border-none resize-none text-base leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                  />
                </div>
              )}
              <div className="glass-card p-5">
                {isAdvancedMode && (
                  <label className="text-xs text-muted-foreground mb-2 block">Dialogue / Script</label>
                )}
                <Textarea
                  value={script.content || ''}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder={isAdvancedMode ? "Write your dialogue here..." : "Write your script here..."}
                  className="min-h-[500px] bg-transparent border-none resize-none text-base leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="glass-card p-5 sticky top-24">
                <InspirationPanel
                  inspirations={script.inspirations || []}
                  onAdd={(insp) => onAddInspiration(insp)}
                  onRemove={(id) => onRemoveInspiration(id)}
                  scriptId={script.id}
                />
              </div>
            </div>
          </div>
        )}

        {/* Add Part button for split view */}
        {script.isMultiPart && isSplitView && (
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={onAddPart}
              className="w-full border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Part
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};
