import { useMemo, useState } from 'react';
import { useScripts } from '@/hooks/useScripts';
import { ScriptCard } from '@/components/ScriptCard';
import { ScriptEditor } from '@/components/ScriptEditor';
import { CreateScriptDialog } from '@/components/CreateScriptDialog';
import { MoodboardPanel } from '@/components/MoodboardPanel';
import { Search, FileText, ImagePlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Index = () => {
  const {
    scripts,
    isLoaded,
    createScript,
    updateScript,
    deleteScript,
    addMoodboardImage,
    removeMoodboardImage,
    moveScript,
    addPart,
    updatePart,
    deletePart,
    addInspiration,
    removeInspiration,
    getScript,
  } = useScripts();

  const [editingScriptId, setEditingScriptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // null means "no upload requested yet" – avoids auto-popup when returning from script screen
  const [moodboardUploadKey, setMoodboardUploadKey] = useState<number | null>(null);

  const editingScript = editingScriptId ? getScript(editingScriptId) : null;

  const filteredScripts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return scripts;
    return scripts.filter((script) => script.title.toLowerCase().includes(q));
  }, [scripts, searchQuery]);

  const handleCreate = (title: string, isMultiPart: boolean) => {
    const newScript = createScript(title, isMultiPart);
    setEditingScriptId(newScript.id);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (editingScript) {
    return (
      <ScriptEditor
        script={editingScript}
        onBack={() => setEditingScriptId(null)}
        onUpdate={(updates) => updateScript(editingScript.id, updates)}
        onAddMoodboardImage={(url) => addMoodboardImage(editingScript.id, url)}
        onRemoveMoodboardImage={(url) => removeMoodboardImage(editingScript.id, url)}
        onAddPart={() => addPart(editingScript.id)}
        onUpdatePart={(partId, updates) => updatePart(editingScript.id, partId, updates)}
        onDeletePart={(partId) => deletePart(editingScript.id, partId)}
        onAddInspiration={(insp, partId) => addInspiration(editingScript.id, insp, partId)}
        onRemoveInspiration={(inspId, partId) => removeInspiration(editingScript.id, inspId, partId)}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border/50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Scripts</h1>
              <p className="text-xs text-muted-foreground">
                {scripts.length} script{scripts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content (fixed split, no resizer) */}
      <main className="py-0">
        <div className="flex gap-0 min-h-[calc(100vh-80px)] w-full">
          {/* Left: scripts */}
          <section className="flex-1 min-w-0 pr-6 py-6 pl-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scripts..."
                  className="pl-10 bg-secondary/30 border-border/50 w-full"
                />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <CreateScriptDialog onCreate={handleCreate} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMoodboardUploadKey((k) => (k ?? 0) + 1)}
                  className="gap-2"
                >
                  <ImagePlus className="w-4 h-4" />
                  Add Images
                </Button>
              </div>
            </div>

            {scripts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-medium mb-2">No scripts yet</h2>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Create your first script to start organizing your content ideas with inspiration.
                </p>
                <CreateScriptDialog onCreate={handleCreate} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 w-full">
                  {filteredScripts.map((script, index) => (
                    <ScriptCard
                      key={script.id}
                      script={script}
                      onClick={() => setEditingScriptId(script.id)}
                      onDelete={() => deleteScript(script.id)}
                      onMoveUp={index > 0 ? () => moveScript(script.id, 'up') : undefined}
                      onMoveDown={index < filteredScripts.length - 1 ? () => moveScript(script.id, 'down') : undefined}
                    />
                  ))}
                </div>

                {filteredScripts.length === 0 && searchQuery && (
                  <div className="text-center py-12 text-muted-foreground">
                    No scripts found matching "{searchQuery}"
                  </div>
                )}
              </>
            )}
          </section>

          {/* Right: moodboard */}
          <aside className="flex-1 min-w-0 border-l border-border/50 py-0">
            <div className="h-[calc(100vh-80px)]">
              <MoodboardPanel
                chrome="none"
                uploadRequestKey={moodboardUploadKey}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Index;
