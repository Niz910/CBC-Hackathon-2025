import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import re
import json
from datetime import datetime

# Add parent directory to path to import the existing modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from anthropic import Anthropic
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration for file uploads
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'audio')
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'm4a', 'webm'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

# Template for keyword extraction
KEYWORD_EXTRACTION_TEMPLATE = """You are tasked with extracting biological terminology from a conference transcript. Your goal is to identify and catalog scientific terms specifically related to biology, genetics, molecular biology, and related fields.

Here is the conference transcript to analyze:

<transcript>
{{TRANSCRIPT}}
</transcript>

## What Qualifies as a Biological Term

Include terms that fall into these categories:
- Gene names (e.g., p53, BRCA1, myc)
- Protein names (e.g., hemoglobin, insulin, collagen)
- Biological processes (e.g., transcription, translation, mitosis)
- Cellular components (e.g., mitochondria, ribosome, nucleus)
- Organisms and species names (e.g., E. coli, Drosophila, Homo sapiens)
- Biological molecules (e.g., DNA, RNA, ATP)
- Medical/biological conditions (e.g., diabetes, cancer, mutation)
- Biological techniques and methods (e.g., PCR, CRISPR, sequencing)
- Anatomical terms (e.g., liver, neuron, tissue)

## What to Exclude

Do not include:
- General scientific terms that aren't specifically biological (like "data", "analysis", "significant")
- Common words that aren't technical terminology
- General laboratory equipment or basic scientific concepts

## Extraction Requirements

1. **Preserve exact formatting**: Capture each term exactly as it appears in the transcript - maintain original spelling, capitalization, and formatting
2. **Include variants**: If both abbreviated forms (like "PCR") and full forms (like "polymerase chain reaction") appear, include both
3. **Include all nomenclature**: Capture species names in both common and scientific formats
4. **No duplicates**: List each unique term only once, even if it appears multiple times
5. **Focus on technical terms**: Prioritize specialized biological terminology over general words

## Analysis Process

Before providing your final answer, work through the transcript systematically in <term_extraction> tags inside your thinking block:

1. Scan through the entire transcript and quote all potential biological terms exactly as they appear in the text. It's OK for this section to be quite long.
2. For each quoted term, evaluate whether it qualifies based on the criteria above, noting your reasoning for including or excluding each term
3. Create a running list of accepted terms, preserving their exact formatting and capitalization
4. Check for and eliminate any duplicates from your accepted terms list
5. Verify that your final list is sorted alphabetically while maintaining exact formatting

## Output Format

Provide your final answer as a JSON object with this exact structure:

```json
{
  "biological_terms": [
    "first_term_exactly_as_appears",
    "second_term_exactly_as_appears",
    "third_term_exactly_as_appears"
  ],
  "total_count": number_of_unique_terms
}
```

The biological_terms array should:
- Be sorted alphabetically
- Preserve exact capitalization, spelling, and formatting from the original transcript
- Contain only unique terms

Your final output should contain only the JSON object and should not duplicate or rehash any of the extraction work you did in the thinking block."""


def transcribe_audio_files(input_dir, output_path):
    """
    Transcribe audio files from input_dir using OpenAI API
    and write results to output_path.
    """
    client = OpenAI()

    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    transcript_text = ""

    for filename in os.listdir(input_dir):
        if not filename.lower().endswith((".wav", ".mp3", ".m4a")):
            continue

        file_path = os.path.join(input_dir, filename)
        print(f"🎧 Transcribing: {filename} ...")

        with open(file_path, "rb") as f:
            result = client.audio.transcriptions.create(
                model="gpt-4o-mini-transcribe",
                file=f
            )

        filtered_text = filter(result.text)
        with open(output_path, "a") as out:
            out.write(f"### {filename}\n")
            out.write(filtered_text + "\n\n")

        transcript_text += f"### {filename}\n{filtered_text}\n\n"
        print(f"✅ {filename} transcription completed")

    return transcript_text


def filter(transcript):
    template = "You will be cleaning and formatting a transcript about technical topics. Here is the transcript to process:\n\n<transcript>\n{{TRANSCRIPT}}\n</transcript>\n\nYour task is to clean and format this transcript by applying the following filters and improvements:\n\n**Content Cleaning Rules:**\n- Remove all filler words such as \"um,\" \"uh,\" \"like,\" \"you know,\" \"so,\" \"well,\" \"actually,\" and similar verbal hesitations\n- Fix grammatical errors and improve sentence structure for clarity\n- Correct run-on sentences by breaking them into shorter, more readable sentences\n- Fix subject-verb agreement and other grammatical issues\n\n**Technical Accuracy Requirements:**\n- Keep all technical terms, jargon, and specialized vocabulary exactly as intended\n- Preserve the meaning and technical accuracy of all statements\n- Do not change or simplify technical concepts\n\n**Formatting and Structure:**\n- Maintain any existing structural elements (numbered lists, sections, etc.)\n- Preserve the logical flow and organization of ideas\n- Standardize capitalization - avoid ALL CAPS for emphasis unless it's a technical acronym or absolutely necessary\n- Ensure consistent punctuation and formatting\n\n**Readability Improvements:**\n- Improve sentence flow and transitions between ideas\n- Ensure paragraphs are well-structured and coherent\n- Make the text more professional and polished while keeping the original meaning intact\n\n**Output Requirements:**\n- Present the cleaned transcript in a clear, professional format\n- Maintain the same overall structure and organization as the original\n- Ensure the final result reads smoothly while preserving all important information\n\nProvide your cleaned and formatted transcript inside <cleaned_transcript> tags."
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=20000,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": template.replace("{{TRANSCRIPT}}", transcript)
                    }
                ]
            }
        ]
    )
    clean_transcript = re.search(r"<cleaned_transcript>(.*?)</cleaned_transcript>", message.content[0].text, re.DOTALL).group(1).strip()
    return clean_transcript


# def extract_keywords(transcript):
#     """
#     Extract biological keywords from transcript using Anthropic API.
#     Returns dict with 'keyword' and 'total_count' fields.
#     """
#     message = client.messages.create(
#         model='claude-3-5-haiku-20241022',
#         max_tokens=1024,
#         temperature=0,
#         messages=[
#             {
#                 "role": "user",
#                 "content": [
#                     {
#                         "type": "text",
#                         "text": KEYWORD_EXTRACTION_TEMPLATE.replace('{{TRANSCRIPT}}', transcript)
#                     }
#                 ]
#             }
#         ]
#     )

#     match = re.search(r"```json\s*([\s\S]+?)\s*```", message.content[0].text)

#     if match:
#         json_string = match.group(1)

#         try:
#             data = json.loads(json_string)
#             # Transform to match expected output format
#             return {
#                 "keyword": data.get("biological_terms", []),
#                 "total_count": data.get("total_count", 0)
#             }

#         except json.JSONDecodeError as e:
#             return {"error": f"Error decoding JSON: {str(e)}"}, 500
#     else:
#         return {"error": "No JSON found in response"}, 500
def extract_keywords(transcript):
    """
    Extract biological keywords from transcript using Anthropic API.
    Returns dict with 'keyword' and 'total_count' fields.
    """
    message = client.messages.create(
        model='claude-3-5-haiku-20241022',
        max_tokens=1024,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": KEYWORD_EXTRACTION_TEMPLATE.replace('{{TRANSCRIPT}}', transcript)
                    }
                ]
            }
        ]
    )

    match = re.search(r"```json\s*([\s\S]+?)\s*```", message.content[0].text)

    if match:
        json_string = match.group(1)

        try:
            data = json.loads(json_string)
            data['biological_terms2'] = []
            for term in data['biological_terms']:
                term2 = f'**{term}**: {explain_terms([term])[term]}'
                data['biological_terms2'].append(term2)
            # Transform to match expected output format
            return {
                "keyword": data.get("biological_terms2", []),
                "total_count": data.get("total_count", 0)
            }

        except json.JSONDecodeError as e:
            return {"error": f"Error decoding JSON: {str(e)}"}, 500
    else:
        return {"error": "No JSON found in response"}, 500


def explain_terms(terms):
    template = "You will be explaining a biological term in a clear, concise manner. Here is the term you need to explain:\n\n<biological_term>\n{{BIOLOGICAL_TERM}}\n</biological_term>\n\nYour task is to provide a brief explanation of this biological term that would be understandable to someone with a basic high school level understanding of biology. Your explanation should:\n\n- Be one sentence long\n- Define what the term means in clear, simple language\n- Include the key function or significance of the concept when relevant\n- Avoid unnecessary jargon, but include essential scientific terminology when needed\n- Be accurate and scientifically sound\n\nIf the term has multiple meanings or applications in biology, focus on the most common or fundamental definition.\n\nWrite your explanation inside <explanation> tags."
    
    dic = {}
    for term in terms:
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=1024,
            temperature=0,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": template.replace('{{BIOLOGICAL_TERM}}', term)
                        }
                    ]
                }
            ]
        )
        dic[term] = re.search(r"<explanation>(.*?)</explanation>", message.content[0].text, re.DOTALL).group(1).strip()
    return dic


@app.route('/transcribe', methods=['POST'])
def transcribe():
    """
    Endpoint to transcribe audio files.
    Input: JSON with 'input_dir' and 'output_path'
    Output: Transcript text
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        input_dir = data.get('input_dir')
        output_path = data.get('output_path')

        if not input_dir or not output_path:
            return jsonify({"error": "Both 'input_dir' and 'output_path' are required"}), 400

        if not os.path.exists(input_dir):
            return jsonify({"error": f"Input directory '{input_dir}' does not exist"}), 404

        # Perform transcription
        transcript = transcribe_audio_files(input_dir, output_path)

        return jsonify({
            "transcript": transcript,
            "output_path": output_path
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/extract', methods=['POST'])
def extract():
    """
    Endpoint to extract biological keywords from transcript.
    Input: JSON with 'transcript' field
    Output: JSON with 'keyword' (list of strings) and 'total_count' (integer)
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        transcript = data.get('transcript')

        if not transcript:
            return jsonify({"error": "'transcript' field is required"}), 400

        # Extract keywords
        result = extract_keywords(transcript)

        if isinstance(result, tuple):
            # Error case
            return jsonify(result[0]), result[1]

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/upload', methods=['POST'])
def upload_audio():
    """
    Endpoint to upload audio files and save them to the audio directory.
    Input: multipart/form-data with 'audio' file
    Output: JSON with saved file path and filename
    """
    try:
        # Check if audio file is in request
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        file = request.files['audio']

        # Check if file was selected
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Check if file type is allowed
        if not allowed_file(file.filename):
            return jsonify({"error": f"File type not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        original_filename = secure_filename(file.filename)
        name, ext = os.path.splitext(original_filename)
        filename = f"{name}_{timestamp}{ext}"

        # Save file to audio directory
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        return jsonify({
            "message": "File uploaded successfully",
            "filename": filename,
            "filepath": filepath,
            "size": os.path.getsize(filepath)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/transcribe-upload', methods=['POST'])
def transcribe_upload():
    """
    Uploads and transcribes a single audio file (any format).
    Frontend can send .webm, .mp4, .m4a, etc.
    This endpoint will auto-convert to .wav before sending to OpenAI.
    """
    import subprocess
    import traceback

    try:
        print("🟡 [transcribe-upload] Incoming request")
        print("📦 request.files:", list(request.files.keys()))

        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        file = request.files['audio']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Save uploaded file
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        original_filename = secure_filename(file.filename)
        name, ext = os.path.splitext(original_filename)
        filename = f"{name}_{timestamp}{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file.save(filepath)
        print(f"✅ Saved file: {filepath} ({os.path.getsize(filepath)} bytes)")

        # --- Convert to .wav for OpenAI ---
        converted_path = os.path.splitext(filepath)[0] + ".wav"
        print(f"🔄 Converting to WAV: {converted_path}")
        try:
            subprocess.run(
                [
                    "ffmpeg", "-y", "-i", filepath,
                    "-ar", "44100", "-ac", "2", "-c:a", "pcm_s16le",
                    converted_path
                ],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            print(f"✅ Conversion successful: {converted_path}")
        except subprocess.CalledProcessError as e:
            print("❌ ffmpeg conversion failed:")
            print(e.stderr.decode())
            return jsonify({"error": "ffmpeg conversion failed"}), 500

        # --- Call OpenAI transcription API ---
        from openai import OpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            return jsonify({"error": "Missing OPENAI_API_KEY"}), 500

        client = OpenAI(api_key=api_key)
        print(f"🎧 Transcribing {converted_path} ...")

        with open(converted_path, "rb") as f:
            result = client.audio.transcriptions.create(
                model="gpt-4o-mini-transcribe",
                file=f,
                language="en"
            )

        print("✅ Transcription complete")
        cleaned_text = filter(result.text)
        return jsonify({
            "transcript": cleaned_text,
            "filename": filename,
            "converted_path": converted_path
        }), 200

    except Exception as e:
        print("❌ Exception in /transcribe-upload:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200


if __name__ == '__main__':
    # Ensure upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5001)

# @app.route('/explain', methods=['POST'])
# def explain():
#     """
#     Explain a single biological term.
#     Input: {"term": "INS"}
#     Output: {"term": "INS", "summary": "...", "sourceName": "...", "url": null}
#     """
#     try:
#         data = request.get_json()
#         term = data.get('term')

#         if not term or not isinstance(term, str):
#             return jsonify({"error": "'term' must be a string"}), 400

#         # 调用已有的 explain_terms()，只解释一个词
#         result = explain_terms([term])
#         explanation = result.get(term, "No explanation available.")

#         return jsonify({
#             "term": term,
#             "summary": explanation,
#             "sourceName": "Claude 3.5 Sonnet",
#             "url": None
#         }), 200

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return jsonify({"error": str(e)}), 500
