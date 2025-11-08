print("🚀 Script successfully executed")
import os
from openai import OpenAI
from dotenv import load_dotenv

def transcribe_audio(
    input_dir="audio",
    output_path="transcript/transcript.txt"
):
    """
    Read audio files from the 'audio/' folder, 
    transcribe them using the OpenAI API, 
    and write the results to 'transcript/transcript.txt'.
    """
    load_dotenv()
    client = OpenAI()

    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

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

        with open(output_path, "a") as out:
            out.write(f"### {filename}\n")
            out.write(result.text + "\n\n")

        print(f"✅ {filename} transcription completed and saved to {output_path}")

if __name__ == "__main__":
    transcribe_audio()
