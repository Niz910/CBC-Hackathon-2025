# CBC-Hackathon-2025
An advanced program can provide explanations for unfamiliar terms encountered in the biological field. It accepts text, image, and voice input.

conda env create -f environment.yml

npm run dev # in Audio-Transcription-App

python flask/app.py

curl -X POST http://localhost:5001/extract \
    -H "Content-Type: application/json" \
    -d '{"transcript": "In type 1 diabetes, the marker gene INS is significantly reduced in pancreatic beta cells."}'

curl -X POST http://localhost:5001/transcribe \
    -H "Content-Type: application/json" \
    -d '{"input_dir": "../audio-to-transcript/audio", "output_path":
  "output/transcript.txt"}'