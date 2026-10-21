# 03 — The scene engine

All code is in `src/`. The principle: **a frame is a pure function of song time `t`.** No state, no animation timelines stored in memory, no `requestAnimationFrame`. That gives:

- identical previews and finals (only `--scale` changes),
- cheap, parallel, resumable renders,
- the ability to jump to any second and see exactly what the viewer will see.

## Data flow

```
data/words.json ──► tools/scenes.py ──► data/scenes.json ─┐
data/audio.json (beats, energy 10 Hz) ────────────────────┤
                                                          ▼
                                     src/clip/Full.tsx:  Full({t}) → frame
```

- `scenes.json` — one scene per sung sentence: `{i, section, echo, a, b, n, text}` where `a` = first word start, `b` = last word end, `echo` = parenthesised/second voice.
- A scene lasts from its `a` to the next scene's `a` (so silences belong to the scene before them).
- Scene 0 starts at `t = 0` (the intro plays under it).

## Rendering a frame

`Full({t})` does, in order:

1. find the current scene;
2. choose the world: `echo` voice → **paper** (hand-drawn, ink on cream); main voice → **dark** (instruments, bone on ink);
3. draw the background grid;
4. draw the **scene visual** from `TABLE[sceneIndex]` inside a camera wrapper;
5. draw the words (`Words2`) with one of five entrance modes;
6. draw the transition bar, beat flash, optional "callout" chips, credits, fade.

## The scene context `C`

Every visual receives:

```ts
type C = { t: number;   // song time
           a: number;   // scene start
           b: number;   // scene end (= next scene start)
           e?: number;  // end of the last sung word
           wt: (word:string) => number }  // start time of a word in this scene
```

Anchor events to **sung words** (`c.wt('height')`), not to scene start, whenever a sync matters. Use `c.e` for "right after the sentence is finished".

## Writing a visual

```tsx
export const Ruler: React.FC<{t:number;a:number;b:number}> = ({t,a,b}) => {
  const p = k(t, a, b);                 // 0→1 over the scene
  return <svg>…<rect width={1280*p}/>…</svg>;
};
```

Helpers in `src/lib.ts`: `k(t,a,b)` clamped progress, `ease`, `beatPulse(t)`, `energyAt(t)`, `rnd(i)` deterministic noise, `wordT(word, nearTime)`.

Rules the instruments follow (also in [04-art-direction.md](04-art-direction.md)):
- nothing is random at render time — `rnd(i)` is seeded;
- drawn-on-paper elements use `Ink`/`wob` (wobbly polylines). A module-level counter `J.v` changes 8×/s in paper scenes so hand-drawn lines "boil" like traditional animation;
- everything is positioned in a **1280×720** coordinate system; render with `--scale=3` for 4K.

## The scene table

```ts
const TABLE: Record<number, Entry> = {
  5:  { r: c => <Mountain {...c}/> },
  19: { r: c => <>…<Stamp a={c.e!} …/></>, hits: c => [c.e!, c.e!+.9] },
};
```

- key = scene index in `data/scenes.json`;
- `r` renders the visual;
- `hits` lists instants where the whole frame should **shake** (a stamp landing, an impact).

The shipped table is the reference song's. Replace it. Scenes without an entry render words only.

## Camera

`camera()` cuts to a new framing every ≈ 3.4 s within a scene: scale goes from 0.88–0.97 **up to** 1.0 over the shot (a gentle push-in that *breathes*), origin and a small rotation change at each cut. **The camera never zooms beyond 1.0** — an earlier version zoomed to 1.3–1.46 and cropped objects out of the frame; that was the single most visible defect the human reported. Scenes listed in `PROJECT.continuousRuns` share one camera and join without a cut.

## Text

`Words2` — five entrance modes (slam, slide-skew, letter-drop, blur-rise, flip) chosen per scene, key words in red and larger, a background-coloured text-shadow for legibility, size derived from the sentence length (≈ 2 lines max), and "receding" after the text has been fully shown for ≈ 3 s. Keyword list: `KEY` in `src/styles/instruments.tsx`.

## Intro and ending

- `Genesis` (`objects2.tsx`): a point, a pulse growing with the music's energy, a burst at 42 % of the intro length, particles settling into stars, a horizon and two ridges. It takes the singer's first-word time as its length.
- `Credits`: title (with a fixed red vertical "axis" line) then credit rows, both from `src/project.config.ts`. Extra seconds are added after the audio ends (`creditsSeconds`).

## Adapting to your song

1. `data/words.json`, `data/scenes.json`, `data/audio.json` from your run of `tools/`.
2. `public/song.m4a` (or change `PROJECT.audio`).
3. Edit `src/project.config.ts` (title, credits, continuous runs).
4. Write your own `TABLE`. Start with ~5 reusable instruments (ruler, counter, dial, graph, stamp) before drawing anything bespoke.
5. `npm run studio`, scrub, note problems as `m:ss`, patch.

## Known weaknesses

- Scene visuals are keyed by **index**. If you re-time and the scene list changes, indices shift. (The reference production first keyed by lyric text, then by index; text keys are robust to re-timing but put lyrics into source code — index keys do not. The trade-off was accepted.)
- No automatic check that objects stay inside the frame. After the camera crop incident this should be a bounding-box test; it is not implemented.
- Fonts come from Google Fonts at render time (network needed on first render).
