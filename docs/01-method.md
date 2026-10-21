# 01 — The method

## The loop

```
audio + exact lyrics
      │
      ▼
 (1) analyse  ── tempo/beats/energy (librosa)          tools/analyze.py
 (2) listen   ── Whisper transcript of the real vocal  tools/transcribe.py
 (3) match    ── transcript ↔ exact lyrics             tools/match.py
 (4) re-time  ── windowed forced alignment + overrides tools/retime.py
 (5) scenes   ── one scene per sung sentence           tools/scenes.py
      │
      ▼
 (6) prototype 3 styles on 15–25 s windows → human picks one
 (7) build the scene table (scene index → visual)      src/clip/Full.tsx
 (8) half-resolution preview of the WHOLE song (≈2 min)
 (9) human watches → notes "mm:ss — problem"
(10) patch → go to (8)   (usually 3–5 rounds)
(11) final render at --scale=3 (4K)
```

Steps 1–5 are machine work. Step 6, 9 and the sync judgement of 8 are human work. The method is the discipline of keeping those two roles separate.

## Why this order

- **Alignment before art.** In the reference production the first alignment was wrong by 7.6 s at the very first word, and every visual decision downstream (object timing, camera cuts, stamps hitting on beats) inherited the error. Re-timing later forced re-touching scenes. Do (2)–(5) first and trust them only as far as the human has confirmed.
- **Prototype before building.** The human chose the final style from three very different 15–25 s renders. The chosen style was extended to the full song; the two others were discarded at near-zero cost.
- **Preview the whole song, always.** A half-resolution render of 500 s took ≈1 m 45 s. It is cheap enough to re-run after every batch of fixes, so the human never judges from fragments.
- **Time-coded notes.** The most effective feedback format was `m:ss — what is wrong`. It maps directly onto a scene (lookup by time) and onto a data fix (re-time that phrase).

## Roles

| Task | Agent | Human |
|---|---|---|
| Install, run, debug the toolchain | ✔ | |
| Alignment, scene engine, objects | ✔ | |
| Inspect still frames / contact sheets | ✔ | |
| Judge sync, flow, pacing, taste | | ✔ |
| Say what is sung where, when ambiguous (choir!) | | ✔ |
| Decide scope, rights, publication | | ✔ |

See [docs/05-feedback-log.md](05-feedback-log.md) for what that division looked like in practice.

## What is *not* in the method

No audio generation, no lyric writing, no publication automation. The song, lyrics and upload are inputs/outputs handled by the author.
