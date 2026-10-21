# 08 — Reproduce it with your own song

Tested path: Windows, NVIDIA GPU with CUDA, Node ≥ 22, Python 3.12, ffmpeg on PATH. Linux/macOS should work for the Node part; the GPU alignment part is untested outside the reference machine.

## 0. Prerequisites

Hardware requirements and measured memory figures are in the README's *Requirements* table.


- Node.js ≥ 22, npm
- ffmpeg + ffprobe on PATH
- Chrome/Chromium (Remotion downloads a headless one on first render if needed)
- Python 3.12 and, for alignment, preferably an NVIDIA GPU with a recent driver (CPU works: set `DEVICE=cpu` and a smaller model such as `WHISPER_MODEL=small`; tested on a 40 s excerpt only)
- A song you have the rights to use, and its **exact lyrics**

## 1. Zero-rights demo (no Python needed)

```bash
npm install
npm run studio          # or: npm run preview
```

## 2. Python environment for alignment

Order matters (see [07-pitfalls.md](07-pitfalls.md): `whisperx` replaces torch with a CPU build).

```bash
python -m venv .venv
.venv\Scripts\activate                      # Linux/macOS: source .venv/bin/activate
pip install whisperx librosa soundfile
pip install --force-reinstall --no-deps torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cu128
python -c "import torch; print(torch.__version__, torch.cuda.is_available())"   # must print True
```

Versions of the reference run: whisperx 3.8.6, faster-whisper 1.2.1, torch 2.8.0+cu128, librosa 1.0.0. If whisperx resolves another torch version on your machine, use that version in the second command.

First run downloads models (Whisper large-v3 and a 361 MB wav2vec2 aligner; several GB in total).

## 3. Your inputs

```
audio/song.flac            your song (any format ffmpeg/librosa read; or set env SONG=path)
data/lyrics.txt            exact lyrics, one lyric line per line, [Section] headers,
                           "(" … ")" around lines sung by the second/choir voice
data/prompt.txt            optional: a few rare words from the lyrics, comma separated (helps Whisper)
public/song.m4a            the audio the render uses:  ffmpeg -i audio/song.flac -c:a aac -b:a 320k public/song.m4a
```

## 4. Align, in this order

```bash
python tools/lyrics.py       # lyrics.txt  -> data/lyrics_words.json
python tools/analyze.py      # audio       -> data/audio.json (tempo, beats, energy)
python tools/transcribe.py   # audio       -> data/transcript.json (Whisper)
python tools/match.py        # read its output: extras = probable choir repeats; unmatched = listen here
python tools/retime.py       # -> data/words.json
python tools/scenes.py       # -> data/scenes.json (prints the scene list)
```

Windows PowerShell with a different file: `$env:SONG="C:\path\song.wav"; python tools/transcribe.py`.

**Now listen.** Compare `tools/scenes.py`'s printed list with the audio at those timestamps. Wherever it is wrong, write `data/overrides.json` ([02-alignment.md](02-alignment.md)) and re-run `retime.py` and `scenes.py`. Repeat until the human is satisfied. Do not start drawing before this.

## 5. Make it yours

1. `src/project.config.ts` — title, credits, `continuousRuns`.
2. `src/clip/Full.tsx` — replace the `TABLE` (it contains the reference song's scene indices). Start with 5–10 scenes; the rest render as text only.
3. Optional: add instruments in `src/clip/objects*.tsx` following [03-scene-engine.md](03-scene-engine.md).
4. `npm run typecheck`.

## 6. Preview → notes → patch

```bash
npm run studio                                   # scrub interactively
npm run preview                                  # whole song, 640×360, out/preview.mp4
```

Watch it, note `m:ss — what's wrong`, patch, re-render. Cheap stills for a review sheet:

```bash
ffmpeg -ss 125 -i out/preview.mp4 -frames:v 1 -vf scale=320:180 s1.png      # one frame
```

## 7. Final render

```bash
npm run render4k            # 3840×2160 @ 30 fps, CRF 16, AAC 320k   (≈ 13.5 min for 8.5 min on the reference machine)
```

For 1080p use `--scale=1.5`. The composition is 1280×720 and 30 fps (`FPS` in `src/lib.ts`).

## 8. Checklist before publishing

- [ ] A human listened to the whole preview and signed off the sync.
- [ ] Nothing leaves the frame (look for edge cases around full-width objects and big zooms).
- [ ] No unwanted language on screen.
- [ ] Credits and rights are correct ([09-legal.md](09-legal.md)).
- [ ] The final file's resolution, duration and audio track checked with `ffprobe`.
