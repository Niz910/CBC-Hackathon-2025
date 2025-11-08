# Flask Backend API

This Flask backend provides audio transcription and keyword extraction services.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure your `.env` file in the project root contains:
```
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Running the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. POST /transcribe

Transcribes audio files from a directory.

**Request:**
```json
{
  "input_dir": "path/to/audio/files",
  "output_path": "path/to/output/transcript.txt"
}
```

**Response:**
```json
{
  "transcript": "transcribed text content...",
  "output_path": "path/to/output/transcript.txt"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/transcribe \
  -H "Content-Type: application/json" \
  -d '{"input_dir": "../audio-to-transcript/audio", "output_path": "output/transcript.txt"}'
```

### 2. POST /extract

Extracts biological keywords from a transcript.

**Request:**
```json
{
  "transcript": "Your transcript text here..."
}
```

**Response:**
```json
{
  "keyword": ["keyword1", "keyword2", "keyword3"],
  "total_count": 3
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/extract \
  -H "Content-Type: application/json" \
  -d '{"transcript": "The CRISPR gene editing technique modifies DNA sequences..."}'
```

### 3. GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad Request (missing or invalid parameters)
- 404: Not Found (input directory doesn't exist)
- 500: Internal Server Error

Error responses include an `error` field with details:
```json
{
  "error": "Error message description"
}
```
