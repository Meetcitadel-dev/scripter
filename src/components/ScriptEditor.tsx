import { useEffect, useMemo, useState } from 'react';
import { Script, ScriptPart } from '@/types/script';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { InspirationPanel } from './InspirationPanel';
import { PartEditor } from './PartEditor';
import { SoundtrackPlayer } from './SoundtrackPlayer';
import { ProjectMoodboard } from './ProjectMoodboard';
import { ArrowLeft, Plus, Layers, FileText, SlidersHorizontal, Columns } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

interface ScriptEditorProps {
  script: Script;
  onBack: () => void;
  onUpdate: (updates: Partial<Script>) => void;
  onAddMoodboardImage: (url: string) => void;
  onRemoveMoodboardImage: (url: string) => void;
  onAddPart: () => void;
  onUpdatePart: (partId: string, updates: Partial<ScriptPart>) => void;
  onDeletePart: (partId: string) => void;
  onAddInspiration: (inspiration: { type: 'link' | 'image'; url: string; title?: string }, partId?: string) => void;
  onRemoveInspiration: (inspirationId: string, partId?: string) => void;
}

export const ScriptEditor = ({
  script,
  onBack,
  onUpdate,
  onAddMoodboardImage,
  onRemoveMoodboardImage,
  onAddPart,
  onUpdatePart,
  onDeletePart,
  onAddInspiration,
  onRemoveInspiration,
}: ScriptEditorProps) => {
  const [title, setTitle] = useState(script.title);
  const [isPartsSplitView, setIsPartsSplitView] = useState(false);

  // Back-compat: migrate single soundtrack fields to list once
  useEffect(() => {
    if (!script.soundtrackUrl) return;
    if (script.soundtracks && script.soundtracks.length > 0) return;
    onUpdate({
      soundtracks: [{ url: script.soundtrackUrl, name: script.soundtrackName }],
      soundtrackUrl: undefined,
      soundtrackName: undefined,
    });
  }, [onUpdate, script.soundtrackName, script.soundtrackUrl, script.soundtracks, script.id]);

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
      // Converting to single mode - preserve parts for later restoration
      const mergedContent = script.parts?.map(p => p.content).join('\n\n') || '';
      const mergedInspirations = script.parts?.flatMap(p => p.inspirations) || [];
      onUpdate({
        isMultiPart: false,
        content: mergedContent,
        inspirations: mergedInspirations,
        preservedParts: script.parts, // Preserve the original parts
      });
    } else {
      // Converting to multi-part mode - check for preserved parts first
      if (script.preservedParts && script.preservedParts.length > 0) {
        // Restore the preserved parts
        onUpdate({
          isMultiPart: true,
          parts: script.preservedParts,
          content: undefined,
          inspirations: undefined,
          preservedParts: undefined,
        });
      } else {
        // No preserved parts, create new part from current content
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

  const tracks = script.soundtracks || [];
  const updateTrackAt = (index: number, url: string | undefined, name: string | undefined) => {
    const next = [...tracks];
    if (!url) {
      // remove track
      next.splice(index, 1);
    } else {
      next[index] = { url, name };
    }
    onUpdate({ soundtracks: next });
  };

  const addEmptyTrack = () => {
    onUpdate({ soundtracks: [...tracks, { url: '', name: '' }] });
  };
  const tracksToRender = useMemo(() => {
    // Always keep at least one empty slot so user can upload quickly
    if (tracks.length === 0) return [{ url: '', name: '' }];
    return tracks;
  }, [tracks]);

  const reorderParts = (fromId: string, toId: string) => {
    const parts = script.parts || [];
    const fromIndex = parts.findIndex(p => p.id === fromId);
    const toIndex = parts.findIndex(p => p.id === toId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const next = [...parts];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onUpdate({ parts: next });
  };

  const renderPartsList = () => (
    <div className="space-y-6">
      {script.parts?.map((part, index) => (
        <div key={part.id}>
          <PartEditor
            part={part}
            partNumber={index + 1}
            canDelete={script.parts!.length > 1}
            advancedMode={!!script.advancedMode}
            onUpdate={(updates) => onUpdatePart(part.id, updates)}
            onDelete={() => onDeletePart(part.id)}
            onAddInspiration={(insp) => onAddInspiration(insp, part.id)}
            onRemoveInspiration={(id) => onRemoveInspiration(id, part.id)}
            scriptId={script.id}
            projectImages={script.moodboard || []}
            onMoveUp={index > 0 ? () => reorderParts(part.id, script.parts![index - 1].id) : undefined}
            onMoveDown={index < (script.parts!.length - 1) ? () => reorderParts(part.id, script.parts![index + 1].id) : undefined}
          />
        </div>
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
  );

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

            {script.isMultiPart && (
              <div className="flex items-center gap-3 bg-secondary/50 rounded-lg px-3 py-2">
                <SlidersHorizontal className={`w-4 h-4 ${script.advancedMode ? 'text-primary' : 'text-muted-foreground'}`} />
                <Switch
                  checked={!!script.advancedMode}
                  onCheckedChange={(checked) => onUpdate({ advancedMode: checked })}
                  id="advanced-mode"
                />
                <Label htmlFor="advanced-mode" className="text-xs text-muted-foreground cursor-pointer">
                  Advanced
                </Label>
              </div>
            )}

            {script.isMultiPart && (
              <Button
                variant={isPartsSplitView ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setIsPartsSplitView(v => !v)}
                className="gap-2"
              >
                <Columns className="w-4 h-4" />
                Split view
              </Button>
            )}
          </div>

          {/* Soundtrack Player */}
          <div className="mt-3">
            <div className="space-y-2">
              {tracksToRender.map((t, idx) => (
                <SoundtrackPlayer
                  key={`${t.url}-${idx}`}
                  scriptId={script.id}
                  soundtrackUrl={t.url}
                  soundtrackName={t.name}
                  onUpdate={(url, name) => updateTrackAt(idx, url, name)}
                />
              ))}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={addEmptyTrack}>
                  + Add track
                </Button>
                <span className="text-xs text-muted-foreground">
                  Multiple soundtracks can play at the same time.
                </span>
              </div>
            </div>
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
            onAddImage={onAddMoodboardImage}
            onRemoveImage={onRemoveMoodboardImage}
          />
        </div>

        {script.isMultiPart ? (
          isPartsSplitView ? (
            <ResizablePanelGroup direction="horizontal" className="rounded-lg border border-border min-h-[70vh]">
              <ResizablePanel defaultSize={50} minSize={30} className="min-h-0">
                <ScrollArea className="h-[calc(100vh-280px)] scrollbar-theme">
                  <div className="p-2">
                    {renderPartsList()}
                  </div>
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={30} className="min-h-0">
                <ScrollArea className="h-[calc(100vh-280px)] scrollbar-theme">
                  <div className="p-2">
                    {renderPartsList()}
                  </div>
                </ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            renderPartsList()
          )
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="glass-card p-5">
                <Textarea
                  value={script.content || ''}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder="Write your script here..."
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
                  projectImages={script.moodboard || []}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
