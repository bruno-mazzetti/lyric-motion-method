# 05 — Feedback log: what the human caught, and whether a machine could have

Every correction made on the reference production, in order, paraphrased from the author's notes. The last column is the interesting one: it says which defects a better automated check would have found *before* a human had to watch, and which truly need a listener or a viewer.

Legend — **Auto**: could be caught by a script/test. **Ear**: needs someone who hears the song. **Eye**: needs someone who sees the video in motion. **Taste**: a judgement call.

| # | Human report (time-coded) | Root cause | Needs |
|---|---|---|---|
| 1 | "The singing starts at 0:14, the lyrics arrive much earlier." Fill the intro with something that shows the birth of the world. | Whole-song forced alignment drifted (first word at 6.4 s). Intro was empty. | **Ear** for the symptom; **Auto** possible: compare aligner output to a Whisper transcript's first-word time (they differed by 7.6 s). |
| 2 | "Lyrics are quite static, almost no variation." | One text animation for all scenes. | **Taste / Eye** |
| 3 | "2:35 — the image for that line is badly chosen." | Object didn't carry the meaning (a plain map with nothing trapped in it). | **Taste** |
| 4 | "Avoid fixed shots of several seconds — but it must stay readable." | Scenes with one slowly animating object for 10–17 s. | **Auto** (longest period with no cut/event per scene) + **Taste** |
| 5 | "5:08 — *hidden* arrives too late." | Timing of one word inside a long line. | **Ear** |
| 6 | "5:13 — the choir repeats the line, so everything after is shifted; the next line is shown although it is sung later." | Choir repeats not in the lyric sheet. | **Ear** (Whisper flagged extra words, but not *which* repeated) |
| 7 | "Scattered small shifts — you should be able to re-measure." | Alignment inaccuracies. | **Auto** (windowed re-alignment) — done |
| 8 | "Add the credits at the end." | Missing deliverable. | — |
| 9 | "2:10 — the checklist boxes leave the frame." More generally: "objects get cut off for no reason." | Camera zoom of 1.3–1.46 cropped content. | **Auto** — a bounding-box test would have caught it at once |
| 10 | "3:00 — the altar scene has a useless rectangle, is nearly 17 s long and badly filled." | Placeholder object in a long scene. | **Auto** (scene > 10 s with < N moving elements) + **Eye** |
| 11 | "3:35 — the calculator is too schematic." | Under-designed object. | **Taste** |
| 12 | "5:07 — the first of three short parallel lines is shown twice and only the second is sung; the second appears before it is sung; the third appears after it is sung. Redo the whole passage, more sophisticated." | Inserted choir repeats that were not sung; windows too early. | **Ear** |
| 13 | "Newer scenes are more dynamic than older ones." | Upgrades applied scene by scene. | **Eye / Taste** |
| 14 | "2:06 — the checks that used to tick and cross out are gone." | Regression: "end of sentence" meant a different time after a refactor. | **Auto** (a visual regression test on the validated extract) |
| 15 | "2:19 — printed lyrics lead the singing by ~3 s." | A "keep the validated timings" override window was left too wide. | **Ear** |
| 16 | "Some of the small red labels are in French." | The agent worked in French with the user; some on-screen strings leaked it. | **Auto** (scan UI strings for non-target-language characters) |
| 17 | "5:40 — the choir sings the first words of a line; the lead sings the beginning of the full line at 5:49." | Who sings what, when. | **Ear** |
| 18 | "The red labels are too much, everywhere; some words overflow." | Feature overshoot to fix #13. | **Taste** + **Auto** (overflow test) |
| 19 | Credits and a final title added; the first word "appears slightly before it's sung" (0:13–0:14). | Alignment precision at one word. | **Ear** |

## What this says

- **7 of 19** (#1, 5, 6, 12, 15, 17, 19) needed an ear, mostly about the *structure* of what is sung (choir vs lead, repeats), which no confidence score could judge.
- **At least 6 were avoidable by simple automated checks** that did not exist: first-word cross-check (#1), longest-idle detection (#4, #10), bounding boxes (#9), a visual regression on the validated extract (#14), UI-string language scan (#16), overflow (#18). Build them first next time.
- **Taste calls cluster around scene content** (what an object *means*), not engineering.
- **Regressions came from refactors** (#14, #15): when a human has *validated* something, freeze it and test against it.
- The agent's most useful behaviour was to **say what it had not verified** ("I saw stills, not motion; sync is yours to judge"). The human's most useful behaviour was **time-coded notes**.

## A note on trust

Throughout the production the agent reported, after each preview: what it changed, what it saw in still frames, and what it could *not* check. That sentence is not politeness; it is what let the human decide where to spend their limited listening time.
