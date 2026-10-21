# AGENTS.md — conventions for AI coding agents working in this repo

Read `docs/01-method.md` and `docs/05-feedback-log.md` first. They are short and explain why the rules below exist.

## Non-negotiables

1. **You cannot hear the song.** Never state that audio/lyrics are in sync. Say what you inspected (still frames, transcripts, numbers) and what the human must judge.
2. **Time is the only input.** `Full({t})` must be a pure function of `t`. No timers, no `Math.random()` (use `rnd(i)` from `src/lib.ts`), no mutable state that depends on render order. (The `J.v` jitter counter is a known exception: set once per frame before children render.)
3. **Nothing leaves the frame.** Composition is 1280×720. Camera scale must stay ≤ 1.0. Keep objects within an 70 px margin unless an object is intentionally full-bleed (rulers, waves).
4. **Text must stay legible.** ≤ ≈ 2 lines, size derived from sentence length, above objects, with a background-coloured halo.
5. **Respect the art-direction rules** in `docs/04-art-direction.md` (every object is an instrument of measurement/control; one accent colour with a meaning; two worlds for two voices).
6. **On-screen strings are in English** (or the target language of the video). Scan for stray languages before every preview.
7. **Don't touch validated work.** If a human has signed off a passage, freeze its timings and add a test/preview that proves it is unchanged. Two regressions in the reference production came from refactors.
8. **One batch → one full preview → one round of notes.** Don't stack many unrelated changes between previews.

## Workflow

- Typecheck: `npm run typecheck`.
- Preview the whole song at half resolution: `npm run preview` (`out/preview.mp4`).
- Review sheets: extract frames with ffmpeg (`-ss t -frames:v 1`) and tile with `xstack`. Do **not** use `drawtext` (crashes on some Windows builds).
- Alignment chain: `tools/lyrics.py → analyze.py → transcribe.py → match.py → retime.py → scenes.py`. Song-specific knowledge goes only in `data/overrides.json`.
- Keep the scene table keyed by scene index and document each entry with a short comment naming the visual idea, not the lyric text.

## Do not

- Commit the song, its lyrics, transcripts or alignment data (they are in `.gitignore`).
- Publish, push or upload anything without the author's explicit go-ahead.
- Claim a render is "verified" after looking at stills only; say what you saw.
- Add decorative elements to "make things livelier" without previewing: the red callout chips in the reference production overshot and had to be cut back.

## Useful numbers

Half-resolution full-song preview ≈ 2 min; 4K final ≈ 13.5 min for 8.5 min of video on the reference machine (timings vary with hardware). See `docs/06-numbers.md`.
