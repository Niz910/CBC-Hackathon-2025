import { useState } from 'react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Sparkles } from 'lucide-react';

interface KeywordChipProps {
  term: string;
  score: number;
  onClick: () => void;
  isSelected: boolean;
}

export function KeywordChip({ term, score, onClick, isSelected }: KeywordChipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
            aria-label={`View information about ${term}`}
          >
            <Badge
              variant={isSelected ? "default" : "secondary"}
              className={`cursor-pointer transition-all gap-1 ${
                isHovered || isSelected ? 'scale-105' : ''
              }`}
            >
              {term}
              {score > 0.8 && <Sparkles className="h-3 w-3" />}
            </Badge>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            Relevance: {Math.round(score * 100)}% • Click for details
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
