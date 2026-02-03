import { Script } from '@/types/script';
import { ScriptCard } from './ScriptCard';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface SplitScriptViewProps {
  scripts: Script[];
  onScriptClick: (id: string) => void;
  onScriptDelete: (id: string) => void;
}

export const SplitScriptView = ({ scripts, onScriptClick, onScriptDelete }: SplitScriptViewProps) => {
  // Split scripts into two halves
  const midpoint = Math.ceil(scripts.length / 2);
  const leftScripts = scripts.slice(0, midpoint);
  const rightScripts = scripts.slice(midpoint);

  const renderScriptList = (scriptList: Script[]) => (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {scriptList.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No scripts in this panel
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {scriptList.slice(0, 3).map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onClick={() => onScriptClick(script.id)}
              onDelete={() => onScriptDelete(script.id)}
            />
          ))}
        </div>
      )}
      {scriptList.length > 3 && (
        <div className="text-center text-xs text-muted-foreground">
          +{scriptList.length - 3} more scripts
        </div>
      )}
    </div>
  );

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[400px] rounded-lg border border-border">
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full bg-secondary/20">
          {renderScriptList(leftScripts)}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full bg-secondary/20">
          {renderScriptList(rightScripts)}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
