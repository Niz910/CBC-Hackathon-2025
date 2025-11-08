import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface FileDropZoneProps {
  onFileSelected: (file: File, blobUrl: string) => void;
}

export function FileDropZone({ onFileSelected }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/webm'];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(wav|mp3|m4a|webm)$/i)) {
      toast.error('Please upload a valid audio file (.wav, .mp3, .m4a)');
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('File too large. Please upload a file under 50MB.');
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    onFileSelected(file, blobUrl);
    toast.success('File uploaded successfully');
  }, [onFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'
      }`}
    >
      <input
        type="file"
        id="audio-upload"
        accept=".wav,.mp3,.m4a,.webm,audio/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload audio file"
      />
      <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drop an audio file here or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          Supports .wav, .mp3, .m4a (max ~30s recommended)
        </p>
      </div>
    </div>
  );
}
