# 07 — Failure log: tooling traps and wrong turns

Real problems hit during the reference production (Windows, Git Bash + PowerShell, Claude Code). Each entry: symptom → cause → what to do.

## Python / GPU

- **`whisperx` silently replaced my CUDA torch with a CPU build.** After `pip install torch --index-url …cu128` then `pip install whisperx`, `torch.cuda.is_available()` was `False`.
  → Install `whisperx` first, then force-reinstall torch + torchaudio **with `--no-deps`** from the CUDA index, pinned to the version whisperx resolved (`2.8.0`). Check `torch.cuda.is_available()` afterwards.
- **`faster-whisper` crashed in `av.open(..., metadata_errors=...)`** (PyAV version incompatibility) when given a file path.
  → Don't pass a path: decode with `whisperx.load_audio()` and give `transcribe()` a NumPy array.
- **Log output from model downloads floods the agent's context.** A progress bar of a 360 MB download printed hundreds of lines.
  → Filter output (`grep -v warn …`) or redirect to a file; print only counts and summaries.

## Rendering / ffmpeg

- **ffmpeg `drawtext` crashed** (access violation, "Cannot load default fontconfig") on this Windows build.
  → Don't label contact-sheet cells with `drawtext`; keep the order implicit (row-major) and say so.
- **One `remotion still` per frame is slow** (a browser launch each).
  → Render the whole song at `--scale=0.5`, then pull frames out with ffmpeg (`-ss t -frames:v 1`) and tile them with `xstack`.
- **"Time remaining" is optimistic** at the beginning of a long render (11 min predicted, 13.5 min real).
- **Fonts**: `@remotion/google-fonts` needs network at render time.

## Shell habits that wasted time

- A long Git Bash command combining several here-documents (`<<'EOF'`) with embedded quotes failed to parse more than once ("unexpected EOF"). Nothing ran.
  → Write files with the editor tool; use short shell commands.
- Large `du` over a venv can exceed the tool's timeout; run it in the background.
- Do **not** start background tasks and poll them; wait for completion notifications.

## Alignment (see [02](02-alignment.md))

- Whole-song forced alignment drifted by 7.6 s at the first word while reporting good scores.
- Whisper word timestamps inside sung passages were non-monotone (e.g. a later word timestamped earlier). Use phrase boundaries, not word times.
- CTC scores can't arbitrate between hypotheses with repeated words (all ≈ 0.7).
- Unmatched lyric words default to the previous word's group — wrong when Whisper misheard a word at the start of a group (fix with `assign`).

## Engine / design

- **Camera zoom > 1.0 crops content.** The camera now only goes from ~0.9 up to 1.0.
- **Refactors silently changed meaning**: `b` ("scene end") was the next scene's start in one version and the last word's end in another, which un-ticked a checklist that the human had validated. Added `e` for "end of last word".
- **Text-keyed scene table** (`'the pulse became'`) was robust to re-timing but put lyrics into source; **index-keyed** doesn't, but shifts when the scene list changes. Choose consciously.
- **Module-level mutable state** (the paper-world "boil" counter `J.v`) is safe in Remotion's one-frame-at-a-time rendering but would break under concurrent rendering of different frames in one process. It worked here; it is a trap.
- **Features added to fix one complaint overshoot** (the red "callout" chips were meant to make long scenes feel alive; they became noise). Add the smallest amount, preview, then add more.
- **Language leakage**: the agent worked in French with the author, and some on-screen labels came out French in an English video. Scan strings.

## Process

- The agent changed many scenes in one pass; the human then judged a different video from the one before. Prefer: one batch of changes → one full preview → one round of notes.
- Declaring something "verified" after viewing stills is wrong for motion and for sync. Say what was checked and what wasn't.
