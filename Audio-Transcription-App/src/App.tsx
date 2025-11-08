import { useState, useEffect } from 'react';
import { AudioCaptureButton } from './components/AudioCaptureButton';
import { FileDropZone } from './components/FileDropZone';
import { TranscriptBlock } from './components/TranscriptBlock';
import { ConfirmBar } from './components/ConfirmBar';
import { KeywordChip } from './components/KeywordChip';
import { InfoCard } from './components/InfoCard';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { Skeleton } from './components/ui/skeleton';
import { Toaster } from './components/ui/sonner';
import { ArrowLeft, FileAudio } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { mockTranscribeAudio, mockExtractKeywords, mockFetchExplainer } from './lib/mockApi';

type AppState = 'landing' | 'processing' | 'transcription' | 'extracting' | 'keywords';

interface TranscriptBlock {
  id: string;
  text: string;
  confidence: number;
  timestamps: { start: number; end: number };
}

interface Keyword {
  term: string;
  score: number;
  offsetRanges: Array<{ start: number; end: number }>;
}

interface Explainer {
  summary: string;
  url: string;
  sourceName: string;
}

export default function App() {
  const [state, setState] = useState<AppState>('landing');
  const [audioSource, setAudioSource] = useState<{ type: 'mic' | 'upload'; url: string; duration: number } | null>(null);
  const [transcriptBlocks, setTranscriptBlocks] = useState<TranscriptBlock[]>([]);
  const [originalBlocks, setOriginalBlocks] = useState<TranscriptBlock[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [explainer, setExplainer] = useState<Explainer | null>(null);
  const [isLoadingExplainer, setIsLoadingExplainer] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handle recording complete
  const handleRecordingComplete = async (blobUrl: string, duration: number) => {
    setAudioSource({ type: 'mic', url: blobUrl, duration });
    setState('processing');
    await processAudio();
  };

  // Handle file upload
  const handleFileSelected = async (file: File, blobUrl: string) => {
    const audio = new Audio(blobUrl);
    audio.addEventListener('loadedmetadata', async () => {
      setAudioSource({ type: 'upload', url: blobUrl, duration: audio.duration });
      setState('processing');
      await processAudio();
    });
  };

  // Process audio and transcribe
  const processAudio = async () => {
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const blocks = await mockTranscribeAudio(audioSource?.url || '');
      setTranscriptBlocks(blocks);
      setOriginalBlocks(JSON.parse(JSON.stringify(blocks)));
      setProgress(100);
      clearInterval(progressInterval);
      
      setTimeout(() => {
        setState('transcription');
        toast.success('Transcription complete');
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      toast.error('Transcription failed');
      setState('landing');
    }
  };

  // Handle transcript edit
  const handleTranscriptEdit = (id: string, newText: string) => {
    setTranscriptBlocks(prev =>
      prev.map(block => (block.id === id ? { ...block, text: newText } : block))
    );
  };

  // Handle undo
  const handleUndo = () => {
    setTranscriptBlocks(JSON.parse(JSON.stringify(originalBlocks)));
    toast.success('Changes undone');
  };

  // Calculate word count
  const wordCount = transcriptBlocks.reduce(
    (acc, block) => acc + block.text.split(/\s+/).filter(w => w.length > 0).length,
    0
  );

  // Check if there are edits
  const hasEdits = JSON.stringify(transcriptBlocks) !== JSON.stringify(originalBlocks);

  // Confirm and extract keywords
  const handleConfirm = async () => {
    setState('extracting');
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 15, 90));
    }, 150);

    try {
      const fullText = transcriptBlocks.map(b => b.text).join(' ');
      const extractedKeywords = await mockExtractKeywords(fullText);
      setKeywords(extractedKeywords);
      setProgress(100);
      clearInterval(progressInterval);

      setTimeout(() => {
        setState('keywords');
        if (extractedKeywords.length === 0) {
          toast.info('No tricky terms found—want a summary instead?');
        } else {
          toast.success(`Extracted ${extractedKeywords.length} key terms`);
        }
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      toast.error('Keyword extraction failed');
      setState('transcription');
    }
  };

  // Handle keyword click
  const handleKeywordClick = async (term: string) => {
    if (selectedKeyword === term) {
      setSelectedKeyword(null);
      setExplainer(null);
      return;
    }

    setSelectedKeyword(term);
    setExplainer(null);
    setIsLoadingExplainer(true);

    try {
      const explanation = await mockFetchExplainer(term);
      setExplainer(explanation);
    } catch (error) {
      toast.error('Failed to fetch explanation');
    } finally {
      setIsLoadingExplainer(false);
    }
  };

  // Reset to landing
  const handleReset = () => {
    setState('landing');
    setAudioSource(null);
    setTranscriptBlocks([]);
    setOriginalBlocks([]);
    setKeywords([]);
    setSelectedKeyword(null);
    setExplainer(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* Landing Page */}
      {state === 'landing' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl">Meeting Transcriber</h1>
              <p className="text-muted-foreground">
                Tell me what the meeting's about… or drop a short recording.
              </p>
            </div>

            <div className="py-8">
              <AudioCaptureButton onRecordingComplete={handleRecordingComplete} />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or upload</span>
              </div>
            </div>

            <FileDropZone onFileSelected={handleFileSelected} />

            <p className="text-xs text-muted-foreground">
              Privacy note: Audio is processed locally for demonstration purposes.
            </p>
          </div>
        </div>
      )}

      {/* Processing State */}
      {(state === 'processing' || state === 'extracting') && (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="max-w-md w-full space-y-6 text-center">
            <FileAudio className="h-16 w-16 mx-auto text-primary animate-pulse" />
            <div className="space-y-2">
              <h2 className="text-2xl">
                {state === 'processing' ? 'Transcribing audio...' : 'Extracting key terms...'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {state === 'processing'
                  ? 'Converting speech to text'
                  : 'Analyzing transcript for important concepts'}
              </p>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>
      )}

      {/* Transcription View */}
      {state === 'transcription' && (
        <div className="min-h-screen pb-24">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h2 className="font-semibold">Transcript</h2>
                <p className="text-sm text-muted-foreground">Click any sentence to edit</p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto p-8">
            <div className="space-y-4">
              {transcriptBlocks.map((block, index) => (
                <TranscriptBlock
                  key={block.id}
                  {...block}
                  onEdit={handleTranscriptEdit}
                  index={index}
                />
              ))}
            </div>
          </div>

          <ConfirmBar
            wordCount={wordCount}
            hasEdits={hasEdits}
            onConfirm={handleConfirm}
            onUndo={handleUndo}
          />
        </div>
      )}

      {/* Keywords View */}
      {state === 'keywords' && (
        <div className="min-h-screen">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <div className="max-w-6xl mx-auto p-4 flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState('transcription')}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to transcript
              </Button>
              <div>
                <h2 className="font-semibold">Key Terms</h2>
                <p className="text-sm text-muted-foreground">
                  Hover for relevance • Click for details
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <KeywordChip
                        key={keyword.term}
                        term={keyword.term}
                        score={keyword.score}
                        onClick={() => handleKeywordClick(keyword.term)}
                        isSelected={selectedKeyword === keyword.term}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No tricky terms found—want a summary instead?</p>
                  </div>
                )}

                {/* Original Transcript */}
                <div className="border-t pt-6 mt-8">
                  <h3 className="text-sm font-medium mb-4">Original Transcript</h3>
                  <div className="space-y-2">
                    {transcriptBlocks.map((block) => (
                      <p key={block.id} className="text-sm text-muted-foreground leading-relaxed">
                        {block.text}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info Card Sidebar */}
              {selectedKeyword && (
                <div className="lg:sticky lg:top-20 h-fit">
                  <InfoCard
                    term={selectedKeyword}
                    summary={explainer?.summary || null}
                    url={explainer?.url || null}
                    sourceName={explainer?.sourceName || null}
                    isLoading={isLoadingExplainer}
                    onClose={() => {
                      setSelectedKeyword(null);
                      setExplainer(null);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
