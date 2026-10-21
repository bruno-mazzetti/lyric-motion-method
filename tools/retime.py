"""Final lyric re-timing: Whisper anchors (data/match.json) + windowed CTC forced alignment -> data/words.json.
No song-specific values in this file: everything comes from data/overrides.json (optional, see docs/02-alignment.md)."""
import json, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from realign import A, wav
M = json.load(open("data/match.json", encoding="utf8"))["lyrics"]; T = json.load(open("data/transcript.json", encoding="utf8"))
OV = json.load(open("data/overrides.json", encoding="utf8")) if os.path.exists("data/overrides.json") else {}
DUR = len(wav)/16000
norm = lambda s: re.sub(r"[^a-z']", "", s.lower())
# 1) transcribed phrase groups (silence > 0.9 s)
g = [[T[0]]]
for w in T[1:]: (g.append([w]) if w["s"]-g[-1][-1]["e"] > 0.9 else g[-1].append(w))
G = [(x[0]["s"], x[-1]["e"]) for x in g]
def grp(tm):
    for i, (a, b) in enumerate(G):
        if a-0.05 <= tm <= b+0.05: return i
idx_g = [grp(w["tm"]) if w["tm"] is not None else None for w in M]
for k in range(len(M)):                       # unmatched words: group of the previous word...
    if idx_g[k] is None: idx_g[k] = idx_g[k-1] if k > 0 else None
for k in range(len(M)-1, -1, -1):             # ...or of the next one at the start of the song
    if idx_g[k] is None and k+1 < len(M): idx_g[k] = idx_g[k+1]
for a in OV.get("assign", []):                # force a word's group: {"word": "x", "at": 142.5, "occurrence": 0}
    ks = [k for k, w in enumerate(M) if norm(w["w"]) == norm(a["word"])]; idx_g[ks[a.get("occurrence", 0)]] = grp(a["at"])
def find(tokens, occ=0):
    toks = [norm(t) for t in tokens.split()]
    hits = [k for k in range(len(M)) if [norm(M[k+i]["w"]) for i in range(len(toks)) if k+i < len(M)] == toks]
    if len(hits) <= occ: raise SystemExit("not found: " + tokens)
    h = hits[occ]; return list(range(h, h+len(toks)))
# 2) explicit units (choir repeats, passages where automatic alignment fails)
res = {}; extra = []; covered = set(); rid = 1000
for u in OV.get("units", []):
    ks = find(u["text"], u.get("occurrence", 0))
    if "manual" in u: r = [dict(s=s, e=e, sc=0.3) for s, e in u["manual"]]
    else: r = A(" ".join(M[k]["w"] for k in ks), u["t0"], u["t1"])
    if len(r) != len(ks): print("!! unit", u["text"], len(r), len(ks)); continue
    rid += 1
    for k, x in zip(ks, r):
        if not u.get("rep"): res[k] = dict(start=x["s"], end=x["e"], score=x["sc"]); covered.add(k)
        else:
            w = {kk: vv for kk, vv in M[k].items() if kk not in ("tm", "te")}
            w.update(start=x["s"], end=x["e"], score=x["sc"], rep=True, echo=True, line=rid)
            w["text"] = w["text"].rstrip(".,") + ("." if k == ks[-1] else ""); extra.append(w)
# 3) everything else: CTC inside each group's window
groups = {}
for k in range(len(M)):
    if k not in covered: groups.setdefault(idx_g[k], []).append(k)
for gi, ks in groups.items():
    a, b = G[gi]; r = A(" ".join(M[k]["w"] for k in ks), a-0.8, b+1.2)
    if len(r) != len(ks): print("!! group", gi, len(r), "vs", len(ks)); continue
    for k, x in zip(ks, r): res[k] = dict(start=x["s"], end=x["e"], score=x["sc"])
out = []
for k, w in enumerate(M):
    n = {kk: vv for kk, vv in w.items() if kk not in ("tm", "te")}
    n.update(res.get(k, dict(start=w["tm"] or 0, end=(w["te"] or 0), score=0)))
    out.append(n)
out += extra; out.sort(key=lambda w: w["start"])
if "first_word_start" in OV: out[0]["start"] = OV["first_word_start"]
for i in range(1, len(out)):                  # strictly increasing starts
    if out[i]["start"] < out[i-1]["start"]: out[i]["start"] = out[i-1]["start"] + 0.01
    if out[i]["end"] < out[i]["start"]: out[i]["end"] = out[i]["start"] + 0.2
json.dump(dict(duration=DUR, words=out), open("data/words.json", "w", encoding="utf8"), ensure_ascii=False, indent=0)
print("words:", len(out), "| choir repeats added:", len(extra), "| first word:", out[0]["start"], "| audio duration:", round(DUR, 1))
