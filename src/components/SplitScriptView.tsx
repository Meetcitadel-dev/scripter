import { Script } from '@/types/script';
import { ScriptCard } from './ScriptCard';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';

const SPLIT_VIEW_HEIGHT = 480;

interface SplitScriptViewProps {
  scripts: Script[];
  onScriptClick: (id: string) => void;
  onScriptDelete: (id: string) => void;
}

export const SplitScriptView = ({ scripts, onScriptClick, onScriptDelete }: SplitScriptViewProps) => {
  // Same full list in both panels (VSCode-style); each panel has its own scroll
  const renderScriptList = () => (
    <div className="p-4 space-y-4">
      {scripts.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No scripts yet
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {scripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onClick={() => onScriptClick(script.id)}
              onDelete={() => onScriptDelete(script.id)}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <ResizablePanelGroup direction="horizontal" className="rounded-lg border border-border" style={{ height: SPLIT_VIEW_HEIGHT }}>
      <ResizablePanel defaultSize={50} minSize={30} className="min-h-0">
        <div className="h-full bg-secondary/20">
          <ScrollArea className="h-full scrollbar-theme">
            {renderScriptList()}
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30} className="min-h-0">
        <div className="h-full bg-secondary/20">
          <ScrollArea className="h-full scrollbar-theme">
            {renderScriptList()}
          </ScrollArea>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
