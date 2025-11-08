import { Button } from './ui/button';
import { Check, Undo2 } from 'lucide-react';

interface ConfirmBarProps {
  wordCount: number;
  hasEdits: boolean;
  onConfirm: () => void;
  onUndo: () => void;
}

export function ConfirmBar({ wordCount, hasEdits, onConfirm, onUndo }: ConfirmBarProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
          {hasEdits && (
            <Button
              size="sm"
              variant="outline"
              onClick={onUndo}
              className="gap-1"
            >
              <Undo2 className="h-3 w-3" />
              Undo changes
            </Button>
          )}
        </div>
        
        <Button
          size="lg"
          onClick={onConfirm}
          className="gap-2"
        >
          <Check className="h-4 w-4" />
          Looks good → Extract terms
        </Button>
      </div>
    </div>
  );
}
