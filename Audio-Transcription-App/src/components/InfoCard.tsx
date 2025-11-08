import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X, ExternalLink, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useEffect, useRef } from 'react';

interface InfoCardProps {
  term: string;
  summary: string | null;
  url: string | null;
  sourceName: string | null;
  isLoading: boolean;
  onClose: () => void;
}

export function InfoCard({ term, summary, url, sourceName, isLoading, onClose }: InfoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.focus();
    }
  }, []);

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="h-full"
      >
        <div
          ref={cardRef}
          tabIndex={-1}
          role="dialog"
          aria-label={`Information about ${term}`}
          className="h-full"
        >
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{term}</CardTitle>
                {sourceName && (
                  <CardDescription className="mt-1">
                    Source: {sourceName}
                  </CardDescription>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="shrink-0"
                aria-label="Close information card"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : summary ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">{summary}</p>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                  
                  {url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(url, '_blank')}
                      className="gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Read more
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No information available for this term.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
