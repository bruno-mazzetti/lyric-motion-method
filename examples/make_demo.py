"""Regenerates the zero-rights demo: a synthetic test tone (no vocals) + hand-timed public-domain words
(William Blake, "The Tyger", 1794) -> public/song.m4a, data/words.json, data/audio.json, data/scenes.json.
Run from the repo root:  python examples/make_demo.py   (needs ffmpeg; librosa for the beat analysis)."""
import json, subprocess, os, re, sys
os.makedirs("public", exist_ok=True); os.makedirs("data", exist_ok=True); os.makedirs("audio", exist_ok=True)
# 1) test tone: kick every 0.6 s (100 BPM) + a soft pad, 24 s
expr = "0.8*sin(2*PI*55*t)*exp(-9*mod(t,0.6))+0.18*sin(2*PI*220*t)*exp(-2*mod(t,2.4))+0.08*sin(2*PI*330*t)"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"aevalsrc='{expr}':d=24:s=44100", "-c:a", "aac", "-b:a", "128k", "public/song.m4a"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "public/song.m4a", "audio/song.wav"], check=True)
# 2) words with hand-written timings (start, end) ; echo = second voice (rendered in the "paper" world)
LINES = [
    (False, [("Tyger", 6.0, 6.5), ("Tyger,", 6.6, 7.2), ("burning", 7.3, 7.9), ("bright,", 8.0, 8.9)]),
    (True,  [("In", 10.0, 10.3), ("the", 10.35, 10.6), ("forests", 10.7, 11.3), ("of", 11.4, 11.6), ("the", 11.7, 11.9), ("night;", 12.0, 12.9)]),
    (False, [("What", 14.0, 14.3), ("immortal", 14.4, 15.1), ("hand", 15.2, 15.6), ("or", 15.7, 15.9), ("eye,", 16.0, 16.9)]),
    (True,  [("Could", 18.0, 18.3), ("frame", 18.4, 18.8), ("thy", 18.9, 19.2), ("fearful", 19.3, 20.0), ("symmetry?", 20.1, 21.2)]),
]
words = []
for n, (echo, ws) in enumerate(LINES, 1):
    for text, s, e in ws:
        words.append(dict(text=text, w=re.sub(r"[^\w']", "", text), section="Verse 1", line=n, echo=echo, start=s, end=e, score=1.0))
json.dump(dict(duration=24.0, words=words), open("data/words.json", "w", encoding="utf8"), ensure_ascii=False, indent=0)
# 3) audio analysis + scenes
env = dict(os.environ, SONG="audio/song.wav")
subprocess.run([sys.executable, "tools/analyze.py"], check=True, env=env)
subprocess.run([sys.executable, "tools/scenes.py"], check=True)
