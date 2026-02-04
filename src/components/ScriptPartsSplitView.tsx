import { ScriptPart } from '@/types/script';
import { PartEditor } from './PartEditor';

interface ScriptPartsSplitViewProps {
  parts: ScriptPart[];
  isAdvancedMode: boolean;
  onUpdatePart: (partId: string, updates: Partial<ScriptPart>) => void;
  onDeletePart: (partId: string) => void;
  onAddInspiration: (inspiration: { type: 'link' | 'image'; url: string; title?: string }, partId: string) => void;
  onRemoveInspiration: (inspirationId: string, partId: string) => void;
  scriptId: string;
  dragState: { draggingId: string | null; dragOverId: string | null };
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDrop: (id: string) => void;
}

export const ScriptPartsSplitView = ({
  parts,
  isAdvancedMode,
  onUpdatePart,
  onDeletePart,
  onAddInspiration,
  onRemoveInspiration,
  scriptId,
  dragState,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: ScriptPartsSplitViewProps) => {
  return (
    <div className="flex gap-1 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Left panel */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {parts.map((part, index) => (
          <PartEditor
            key={part.id}
            part={part}
            partNumber={index + 1}
            canDelete={parts.length > 1}
            isAdvancedMode={isAdvancedMode}
            onUpdate={(updates) => onUpdatePart(part.id, updates)}
            onDelete={() => onDeletePart(part.id)}
            onAddInspiration={(insp) => onAddInspiration(insp, part.id)}
            onRemoveInspiration={(id) => onRemoveInspiration(id, part.id)}
            scriptId={scriptId}
            isDragging={dragState.draggingId === part.id}
            isDragOver={dragState.dragOverId === part.id}
            onDragStart={() => onDragStart(part.id)}
            onDragOver={(e) => onDragOver(e, part.id)}
            onDragEnd={onDragEnd}
            onDrop={() => onDrop(part.id)}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-px bg-border flex-shrink-0" />

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto pl-2 space-y-4">
        {parts.map((part, index) => (
          <PartEditor
            key={`${part.id}-right`}
            part={part}
            partNumber={index + 1}
            canDelete={parts.length > 1}
            isAdvancedMode={isAdvancedMode}
            onUpdate={(updates) => onUpdatePart(part.id, updates)}
            onDelete={() => onDeletePart(part.id)}
            onAddInspiration={(insp) => onAddInspiration(insp, part.id)}
            onRemoveInspiration={(id) => onRemoveInspiration(id, part.id)}
            scriptId={scriptId}
            isDragging={dragState.draggingId === part.id}
            isDragOver={dragState.dragOverId === part.id}
            onDragStart={() => onDragStart(part.id)}
            onDragOver={(e) => onDragOver(e, part.id)}
            onDragEnd={onDragEnd}
            onDrop={() => onDrop(part.id)}
          />
        ))}
      </div>
    </div>
  );
};
