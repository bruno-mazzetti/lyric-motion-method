# 02 — Alignment: knowing when each word is sung

This is the part that decides whether the video feels right. Everything below was learned on one real song (English, ~8 min, lead vocal + choir, long instrumental gaps).

## What you start with

- the **exact lyrics** (your reference — never replaced by a transcript),
- the **audio**.

You need, for every lyric word, `start` and `end` in seconds.

## Attempt 1 — forced alignment of the whole song (what *not* to do)

Feed the full lyrics and the full audio to a CTC forced aligner (here: the wav2vec2 model behind `whisperx.align`).

Result on the reference song: 295/295 words "aligned", monotone, average confidence ≈ 0.7. It *looked* healthy. In reality the **first word was placed at 6.4 s while the singer starts at 14.0 s**, and, depending on which later timing you compare against, 22 to 31 words were off by more than 3 s. Forced alignment will always produce a plausible-looking answer: it has no notion of "the singer hasn't started yet". Long instrumental intros, held notes and choir repeats are where it drifts.

Lesson: **a confidence score tells you the aligner is self-consistent, not that it is right.**

## Attempt 2 — listen first, then align (what worked)

```
tools/transcribe.py   Whisper large-v3 transcribes the actual vocal      → data/transcript.json
tools/match.py        fuzzy sequence match transcript ↔ exact lyrics     → data/match.json
tools/retime.py       CTC alignment inside windows anchored by Whisper   → data/words.json
```

1. **Transcribe** (`faster-whisper`, word timestamps, no VAD, no previous-text conditioning, a prompt with the lyrics' rare words). Whisper's *text* is good on sung English; its *word timestamps* are not precise (inside sung passages they can even be non-monotone) — but its **phrase start/end are reliable anchors**.
2. **Match** with a Needleman–Wunsch alignment between transcribed words and lyric words (fuzzy equality). On the reference song: 285/295 lyric words matched, 37 transcribed words had no lyric. Those 37 are the interesting ones: **choir repeats and ad-libs**.
3. **Re-time**: group the transcript into phrases (gap > 0.9 s). For each group, run CTC forced alignment of *only that group's lyric words* inside `[group_start − 0.8 s, group_end + 1.2 s]`. The aligner can no longer wander: it only has to place a few words in a few seconds.

Reproducing the whole chain from scratch on the reference song gave timings within **0.01 s on average** of the production data (models already cached; ≈ 30 s total with a CUDA GPU).

## The part no tool solved: what is *actually sung*

Lyrics sheets describe the song as written. Singers repeat lines, a choir echoes a phrase, a lead comes in after the choir. In the reference song this broke the video three separate times:

| Symptom (as the human reported it) | Cause | Fix |
|---|---|---|
| Three short lines appeared one after another, each *before* it was sung; one of them was shown twice | I had assumed the choir repeated lines; I had also inserted repeats that were not sung | Remove the invented repeats; give each line its own window from the human's timestamps |
| A line appeared at 5:40; the lead sang it at 5:49 | The choir sang the first words of the line at 5:40, the lead sang the full line later | Split into three units: choir fragment, lead line, choir repeat of the end |
| A line displayed 3 s early | A "validated" region of old timings was kept as an override and silently covered one more line than intended | Shorten the override window; assign the line to the right transcript group |

I tried to settle the first case **objectively**: I aligned four competing hypotheses ("one pass", "two passes", Whisper's literal reading, …) in the same window and compared mean CTC scores. They were 0.69, 0.70, 0.71, 0.72 — **indistinguishable**. The score cannot arbitrate between hypotheses that differ by repeated words. Only the human's ear could.

## The override file

`data/overrides.json` (optional) is the escape hatch. It is the *only* place where song-specific knowledge lives.

```json
{
  "first_word_start": 14.5,
  "assign": [{"word": "<a word Whisper misheard>", "at": 142.5}],
  "units": [
    {"text": "<a phrase from your lyrics>", "t0": 312.4, "t1": 316.0},
    {"text": "<first three words of a line the choir sings alone>", "rep": true, "manual": [[340.3,341.1],[341.2,341.9],[342.0,343.2]]},
    {"text": "<last two words of a line the choir repeats>", "rep": true, "t0": 357.0, "t1": 360.6}
  ]
}
```

- `units[].text` — a phrase from the lyrics (matched as a word sequence; `occurrence` selects the nth match).
- `t0`/`t1` — align that phrase by CTC inside this window.
- `manual` — give word timings by hand when CTC scores are very low (choir).
- `rep: true` — the phrase is a **repeat** sung in addition to the written line: duplicated as extra words flagged `rep`, shown in the "echo" world.
- `assign` — force which transcript group a word belongs to (when Whisper misheard it, e.g. it transcribed one word as a different one).
- `first_word_start` — the singer's actual first onset, if you know it better than the aligner.

## Practical advice

- Treat `tools/match.py`'s output as a **to-do list**: every "transcribed words with no lyric" run is a probable choir repeat; every "unmatched lyric words" run is a place to listen.
- Ask the human for `m:ss` where the lyric sheet and the audio disagree. One accurate timestamp is worth more than any amount of re-alignment.
- Keep the old timing file when you re-time. The reference production kept `words_v1_old.json` and compared; mean shift between the first and the final timing was 0.7–1.3 s (depending on the comparison), with 22–31 words off by more than 3 s.
- Re-run the whole alignment after every correction; it takes seconds once models are cached.

## Limits

- English only (the aligner is loaded with `language_code="en"`). Other languages need their own wav2vec2 model.
- No check against ground truth: the final sync was accepted by a human listener, not measured.
- Whisper large-v3 needs a few GB of GPU memory; CPU is possible but slow (untested here).
