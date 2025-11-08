import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { Button } from './ui/button';

interface TranscriptBlockProps {
  id: string;
  text: string;
  confidence: number;
  onEdit: (id: string, newText: string) => void;
  index: number;
}

export function TranscriptBlock({ id, text, confidence, onEdit, index }: TranscriptBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditedText(text);
  }, [text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onEdit(id, editedText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`group relative rounded-lg border bg-card p-4 transition-all ${
        isEditing ? 'border-primary ring-2 ring-primary/20' : 'border-border'
      }`}
    >
      {!isEditing ? (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-text"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditing(true)}
          aria-label={`Edit sentence: ${text}`}
        >
          <p className="text-foreground">{text}</p>
          {confidence < 0.9 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {Math.round(confidence * 100)}%
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-muted-foreground">Click to edit</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-background border border-input rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            aria-label="Edit transcript text"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="gap-1"
            >
              <Check className="h-3 w-3" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="gap-1"
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
            <span className="text-xs text-muted-foreground ml-auto self-center">
              Ctrl+Enter to save • Esc to cancel
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
