# 06 — Numbers (measured on the reference production)

Hardware: one consumer Windows PC with a CUDA-capable NVIDIA GPU. Exact specifications are deliberately not listed: treat every timing below as indicative.
Software: Node 24.15, Remotion 4.0.537, React 19, Python 3.12.10, torch 2.8.0+cu128, whisperx 3.8.6, faster-whisper 1.2.1, ctranslate2 4.8.3, librosa 1.0.0, ffmpeg 8.1.

## The video

| Item | Value |
|---|---|
| Song length | 500.8 s (8 min 21 s) |
| Final length | 513.8 s (+13 s title/credits) |
| Final format | 3840×2160, 30 fps, H.264 CRF 16, AAC 320 kbit/s |
| Final file size | ≈ 512 MB |
| Frames | 15 415 |
| Scenes | 60 (≈ 8.3 s average) |
| Lyric words | 295 sung + 8 choir-repeat words |
| Source code | ≈ 1 000 lines (engine, objects, tools) |

## Time

| Task | Time |
|---|---|
| 90 frames at 4K (test, before full build) | 7.4 s (≈ 12 fps incl. start-up) |
| Whole song at 640×360 (preview) | ≈ 1 min 45 s |
| Whole song at 4K, final | **13 min 30 s** (≈ 19 fps average) |
| 39 s demo at 640×360 | ≈ 22 s |
| Full alignment chain from scratch (models cached): analyse + transcribe + match + re-time + scenes | **≈ 30 s** |
| Remotion's "time remaining" at start of the 4K render | 11 min 40 s (the true total was ≈ 13.5 min: it was optimistic) |

## Disk (reference setup)

| Item | Size |
|---|---|
| Python venv (torch CUDA + whisperx + librosa …) | 8.1 GB |
| `node_modules` | 857 MB |
| Hugging Face cache (whole machine, shared with other uses; Whisper large-v3 is part of it) | 8.6 GB total (not isolated) |
| wav2vec2 alignment model (torch hub cache) | 361 MB |

## Alignment quality (reference song, English, lead + choir)

| Measure | Value |
|---|---|
| Whisper-transcript words matched to lyric words | 285 / 295 |
| Transcribed words with no lyric (choir/ad-lib) | 37 |
| First sung word: whole-song CTC vs. truth | 6.4 s vs 14.0 s (**7.6 s early**) |
| Mean difference first vs. final timing | 0.7 – 1.3 s |
| Words differing by > 3 s | 22 – 31 of 295 |
| Reproduction from scratch vs. production data | 0.01 s mean difference, 0 words > 1 s |
| CTC mean scores of 4 competing choir hypotheses | 0.69 / 0.70 / 0.71 / 0.72 (not discriminating) |

## What was not measured

Token or monetary cost of the AI sessions; GPU memory peaks; Whisper's CPU-only speed; the first-run model download times; sync error against ground truth.
