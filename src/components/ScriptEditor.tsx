import { useState, useEffect } from 'react';
import { Script, ScriptPart } from '@/types/script';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { InspirationPanel } from './InspirationPanel';
import { PartEditor } from './PartEditor';
import { AIBrainstormPanel } from './AIBrainstormPanel';
import { SoundtrackPlayer } from './SoundtrackPlayer';
import { ProjectMoodboard } from './ProjectMoodboard';
import { ArrowLeft, Plus, Layers, FileText, Sparkles } from 'lucide-react';

interface ScriptEditorProps {
  script: Script;
  onBack: () => void;
  onUpdate: (updates: Partial<Script>) => void;
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
  onAddPart,
  onUpdatePart,
  onDeletePart,
  onAddInspiration,
  onRemoveInspiration,
}: ScriptEditorProps) => {
  const [title, setTitle] = useState(script.title);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  // Get current script content for AI context
  const getCurrentContent = () => {
    if (script.isMultiPart) {
      return script.parts?.map(p => `## ${p.title}\n${p.content}`).join('\n\n') || '';
    }
    return script.content || '';
  };

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

  const handleSoundtrackUpdate = (url: string | undefined, name: string | undefined) => {
    onUpdate({ soundtrackUrl: url, soundtrackName: name });
  };

  const handleMoodboardAdd = (url: string) => {
    onUpdate({ moodboard: [...(script.moodboard || []), url] });
  };

  const handleMoodboardRemove = (url: string) => {
    onUpdate({ moodboard: (script.moodboard || []).filter(u => u !== url) });
  };

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

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAIPanelOpen(true)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Brainstorm
            </Button>
          </div>

          {/* Soundtrack Player */}
          <div className="mt-3">
            <SoundtrackPlayer
              scriptId={script.id}
              soundtrackUrl={script.soundtrackUrl}
              soundtrackName={script.soundtrackName}
              onUpdate={handleSoundtrackUpdate}
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
          <div className="space-y-6">
            {script.parts?.map((part, index) => (
              <PartEditor
                key={part.id}
                part={part}
                partNumber={index + 1}
                canDelete={script.parts!.length > 1}
                onUpdate={(updates) => onUpdatePart(part.id, updates)}
                onDelete={() => onDeletePart(part.id)}
                onAddInspiration={(insp) => onAddInspiration(insp, part.id)}
                onRemoveInspiration={(id) => onRemoveInspiration(id, part.id)}
                scriptId={script.id}
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
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Brainstorm Panel */}
      <AIBrainstormPanel
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
        scriptContent={getCurrentContent()}
      />
    </div>
  );
};
