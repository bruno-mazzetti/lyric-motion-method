"""Transcribes the actual vocal with Whisper -> data/transcript.json (words + times).
Used to re-time the lyrics and to spot choir repeats.

Environment variables (all optional):
  SONG           path to the audio file            (default audio/song.flac)
  DEVICE         "cuda" or "cpu"                   (default: cuda if available, else cpu)
  WHISPER_MODEL  model name                        (default large-v3; use "small" or "medium" on CPU)
"""
import json, os
import torch, whisperx
from faster_whisper import WhisperModel

AUDIO = os.environ.get("SONG", "audio/song.flac")
DEVICE = os.environ.get("DEVICE") or ("cuda" if torch.cuda.is_available() else "cpu")
MODEL = os.environ.get("WHISPER_MODEL", "large-v3")
print(f"device={DEVICE} model={MODEL}")
m = WhisperModel(MODEL, device=DEVICE, compute_type="float16" if DEVICE == "cuda" else "int8")
prompt = open("data/prompt.txt", encoding="utf8").read().strip() if os.path.exists("data/prompt.txt") else None   # rare words of the lyrics (helps decoding)
segs, info = m.transcribe(whisperx.load_audio(AUDIO), language="en", word_timestamps=True, vad_filter=False,
                          condition_on_previous_text=False, initial_prompt=prompt, beam_size=5, temperature=0.0)
out = []
for s in segs:
    for w in s.words: out.append(dict(w=w.word.strip(), s=round(w.start, 2), e=round(w.end, 2), p=round(w.probability, 2)))
json.dump(out, open("data/transcript.json", "w", encoding="utf8"), ensure_ascii=False)
print("words:", len(out))
