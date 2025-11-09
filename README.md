# Website link
https://clarifyai.org


# Slide link
https://docs.google.com/presentation/d/1OqkxIs_gCsTLb2UK-plFexVS91qfgxqF/edit?usp=sharing&ouid=117914992394790894094&rtpof=true&sd=true

# Problem statement link
https://docs.google.com/document/d/1_gjvsbZtJV8UomG8_b_Mcuz_J2xPE-08/edit?usp=sharing&ouid=117914992394790894094&rtpof=true&sd=true

# Clarify AI — The Academic Comprehension Companion

Clarify AI helps users truly understand — not just transcribe — academic and technical discussions. It identifies domain-specific terms, explains them in plain language, links to reliable sources, and turns raw recordings into clear, structured knowledge for review and self-learning.

---

## Problem Statement

In professional and academic settings, participants often come from diverse educational backgrounds. When experts use dense, domain-specific language (for example, “transformer fine-tuning” in AI or “genomic sequencing” in biology), many attendees struggle to follow, especially non-technical or international participants.

Common issues:
- Miss key insights during live sessions
- Fail to review effectively afterward
- Lose confidence or motivation to engage in cross-disciplinary discussions

---

## Vision

Clarify AI bridges this comprehension gap by translating, summarizing, and contextualizing technical terms in real time. Whether used live or post-session, Clarify AI transforms recordings into structured knowledge, enabling learners from any background to follow, engage, and grow with confidence.

---

## Market Gap — Limitations of Existing Tools

| Problem | Why Existing Tools Fail |
| --- | --- |
| Inaccurate detection of technical terms | Transcribe speech but do not reliably identify domain vocabulary and abbreviations (e.g., “CRISPR,” “backpropagation,” “tokenization”). |
| No contextual references | Provide text without definitions, Wikipedia links, or academic context. Users must search manually. |
| No personalization by background | MBA students, investors, and PhDs all receive the same explanations; no adaptive depth. |
| Limited accessibility for non-native speakers | Poor handling of heavy accents, fast speech, and multilingual terminology in technical contexts. |
| No post-session learning loop | Cannot easily turn content into a structured glossary or study pack for review. |

In short: today’s AI note-takers hear everything, but understand nothing deeply.

---

## Solution Overview

An AI-powered academic knowledge companion that works during expert meetings, lectures, and conferences.

Core capabilities:
- Real-time or post-session term extraction and explanation
- Reference integration to credible sources (Wikipedia, ArXiv, textbooks)
- Adaptive explanation layer per user background
- Accent-aware, multilingual translation and alignment
- Post-session learning loop: summaries, glossaries, and review packs

---

## Core Features

1. Real-Time or Post-Session Term Extraction and Explanation  
   - Automatically identifies academic or domain-specific terms from speech or transcripts  
   - Provides concise, contextual explanations

2. Reference Integration  
   - Links key terms to credible sources (Wikipedia, ArXiv, textbooks, curated data)  
   - Generates a post-session glossary and learning pack

3. Adaptive Explanation Layer  
   - Adjusts complexity and tone by user profile (MBA, investor, engineer, etc.)

4. Accent-Aware, Multilingual Translation  
   - Supports global users with intelligent translation and semantic alignment

5. Post-Session Learning Loop  
   - Summarizes and organizes content into reviewable study material and flashcards

---

## Customer Personas

- Stella (MBA Student): Attends an LLM training session with CS students; struggles with abbreviations and fast, accented speech. Clarify AI explains key AI terms, provides translated references, and builds a personalized study summary.

- Ben (Investor): Attends a biotech conference; struggles with jargon like “gene editing” or “protein folding.” Clarify AI extracts key concepts and produces plain-language business summaries with sources.

---

## System Architecture (Flow)

1. Input Layer  
   - Users upload or connect audio files, text, or images (slides, screenshots)  
   - Example inputs: lecture recordings, investor calls, conference talks

2. Speech-to-Text Processing  
   - Cloud APIs (e.g., Whisper or Claude API) generate accurate transcripts  
   - Handles multi-accent speech and technical vocabulary

3. Text Analysis and Key Term Extraction  
   - Domain-tuned LLM identifies academic terms, abbreviations, formulas, and key concepts

4. Knowledge Reference Integration  
   - Each extracted term links to reference databases (Wikipedia, ArXiv, textbooks, curated/internal data)

5. Prompt Generation and Contextual Summary  
   - System generates prompts that combine user profile (e.g., MBA background) and field data  
   - Output: personalized glossary, translation, and comprehension summary

6. Web Application Interface  
   - Website and API provide multi-format input and real-time display of definitions during meetings or playback

---

## Tech Stack

- Speech Recognition: Whisper or Claude API
- Knowledge Extraction: Domain-specific LLM prompts/fine-tuning for academic terminology
- Reference Layer: Indexed repository mapping terms to Wikipedia/ArXiv/Textbooks
- Backend: Flask-based REST API
- Front-end: Web application for real-time display and post-session materials

---

## API Endpoints (Backend)

- POST `/upload`  
  Upload an audio file.  
  Form-data: `audio` (wav/mp3/m4a/webm)

- POST `/transcribe`  
  Transcribe all audio files in a folder.  
  JSON: `{ "input_dir": "...", "output_path": "..." }`

- POST `/transcribe-upload`  
  Upload and transcribe a single audio file.  
  Form-data: `audio`

- POST `/extract`  
  Extract domain terms from a transcript text (with optional safety filtering on server).  
  JSON: `{ "transcript": "..." }`

- GET `/health`  
  Health check.

Example curl for `/extract`:
```bash
curl -X POST http://localhost:5001/extract \
  -H "Content-Type: application/json" \
  -d '{"transcript": "In CRISPR gene editing, Cas9 introduces double-strand breaks..."}'
