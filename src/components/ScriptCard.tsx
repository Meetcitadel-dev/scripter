import { Script } from '@/types/script';
import { FileText, Layers, MoreHorizontal, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ScriptCardProps {
  script: Script;
  onClick: () => void;
  onDelete: () => void;
}

export const ScriptCard = ({ script, onClick, onDelete }: ScriptCardProps) => {
  const partsCount = script.parts?.length || 0;
  const inspirationsCount = script.isMultiPart 
    ? script.parts?.reduce((acc, part) => acc + part.inspirations.length, 0) || 0
    : script.inspirations?.length || 0;

  return (
    <div
      className="group glass-card p-5 cursor-pointer hover-lift animate-fade-in"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {script.isMultiPart ? (
              <Layers className="w-5 h-5 text-primary" />
            ) : (
              <FileText className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-foreground line-clamp-1">
              {script.title || 'Untitled Script'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(script.updatedAt, { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {script.isMultiPart && (
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            {partsCount} parts
          </span>
        )}
        <span className="flex items-center gap-1">
          {inspirationsCount} inspiration{inspirationsCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};
