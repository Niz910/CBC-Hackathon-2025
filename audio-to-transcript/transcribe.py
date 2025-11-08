print("🚀 脚本文件被成功执行")
import os
from openai import OpenAI
from dotenv import load_dotenv

def transcribe_audio(
    input_dir="audio",
    output_path="transcript/transcript.txt"
):
    """
    从 audio/ 文件夹读取音频文件，调用 OpenAI API 转录并写入 transcript/transcript.txt
    """
    load_dotenv()
    client = OpenAI()

    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    for filename in os.listdir(input_dir):
        if not filename.lower().endswith((".wav", ".mp3", ".m4a")):
            continue

        file_path = os.path.join(input_dir, filename)
        print(f"🎧 正在转录: {filename} ...")

        with open(file_path, "rb") as f:
            result = client.audio.transcriptions.create(
                model="gpt-4o-mini-transcribe",
                file=f
            )

        with open(output_path, "a") as out:
            out.write(f"### {filename}\n")
            out.write(result.text + "\n\n")

        print(f"✅ {filename} 转录完成，已写入 {output_path}")

if __name__ == "__main__":
    transcribe_audio()