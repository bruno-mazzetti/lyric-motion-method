# examples

`make_demo.py` regenerates the zero-rights demo used by the default build:
a synthetic test tone (kick every 0.6 s + pad, no vocals) and four hand-timed lines of William Blake's *The Tyger* (1794, public domain).
It writes `public/song.m4a`, `data/words.json`, `data/audio.json`, `data/scenes.json`.

```bash
python examples/make_demo.py      # needs ffmpeg and librosa
npm run studio
```
The demo exercises: the intro, both worlds (dark/paper), three of the reference scene visuals (table entries 0–3), the camera, text modes and the title/credits sequence. It does not exercise alignment (there are no vocals).
