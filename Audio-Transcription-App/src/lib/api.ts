// Real API functions for backend communication

const API_BASE_URL = 'http://localhost:5001';

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

/**
 * Convert Blob URL to File object
 */
async function blobUrlToFile(blobUrl: string, filename: string): Promise<File> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

/**
 * Transcribe audio by uploading to backend
 */
export async function transcribeAudio(blobUrl: string, filename: string = 'recording.webm'): Promise<TranscriptBlock[]> {
  try {
    // Convert blob URL to file
    const file = await blobUrlToFile(blobUrl, filename);

    // Create FormData and append the audio file
    const formData = new FormData();
    formData.append('audio', file);

    // Send to backend
    const response = await fetch(`${API_BASE_URL}/transcribe-upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Convert the transcript text into blocks
    // Split by sentences for better UX
    const sentences = data.transcript.match(/[^.!?]+[.!?]+/g) || [data.transcript];

    return sentences.map((sentence: string, index: number) => ({
      id: String(index + 1),
      text: sentence.trim(),
      confidence: 0.95, // Backend doesn't provide confidence scores yet
      timestamps: { start: index * 5, end: (index + 1) * 5 }
    }));

  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

/**
 * Upload audio file without transcribing
 */
export async function uploadAudio(blobUrl: string, filename: string = 'recording.webm'): Promise<string> {
  try {
    // Convert blob URL to file
    const file = await blobUrlToFile(blobUrl, filename);

    // Create FormData and append the audio file
    const formData = new FormData();
    formData.append('audio', file);

    // Send to backend
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.filepath;

  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Extract biological keywords from transcript
 */
export async function extractKeywords(text: string): Promise<Keyword[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript: text }),
    });

    if (!response.ok) {
      throw new Error(`Keyword extraction failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform backend response to frontend format
    const keywords = data.keyword || [];
    return keywords.map((term: string, index: number) => ({
      term,
      score: 0.9 - (index * 0.02), // Generate scores based on order
      offsetRanges: [{ start: 0, end: term.length }] // Placeholder
    }));

  } catch (error) {
    console.error('Keyword extraction error:', error);
    throw error;
  }
}

/**
 * Mock explainer fetching - can be replaced with real API later
 */
export async function fetchExplainer(term: string): Promise<Explainer> {
  // For now, return a Google search URL
  // This can be replaced with a real explainer API in the future
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    summary: `${term} is a biological term. Click the link below to learn more.`,
    url: `https://www.google.com/search?q=${encodeURIComponent(term + ' biology')}`,
    sourceName: 'Search Online'
  };
}
