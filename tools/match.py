"""Matches Whisper's transcribed words to the exact lyrics (fuzzy Needleman-Wunsch) -> data/match.json + readable diagnostics.
Transcribed words with no lyric = choir repeats / ad-libs. Lyric words left unmatched = words Whisper misheard."""
import json, re, difflib
L = json.load(open("data/lyrics_words.json", encoding="utf8")); T = json.load(open("data/transcript.json", encoding="utf8"))
norm = lambda s: re.sub(r"[^a-z']", "", s.lower().replace("’", "'"))
a = [norm(w["w"]) for w in L]; b = [norm(w["w"]) for w in T]
def sc(x, y):
    if x == y: return 3
    r = difflib.SequenceMatcher(None, x, y).ratio()
    return 2 if r >= .8 else (0.5 if r >= .6 else -2)
n, m = len(a), len(b); G = -1.2
S = [[0]*(m+1) for _ in range(n+1)]; P = [[0]*(m+1) for _ in range(n+1)]
for i in range(1, n+1): S[i][0] = i*G; P[i][0] = 1
for j in range(1, m+1): S[0][j] = j*G; P[0][j] = 2
for i in range(1, n+1):
    for j in range(1, m+1):
        d = S[i-1][j-1] + sc(a[i-1], b[j-1]); u = S[i-1][j] + G; l = S[i][j-1] + G
        S[i][j], P[i][j] = max((d, 0), (u, 1), (l, 2))
i, j = n, m; pair = {}; extras = []
while i > 0 or j > 0:
    p = P[i][j]
    if i > 0 and j > 0 and p == 0:
        if sc(a[i-1], b[j-1]) > 0: pair[i-1] = j-1
        else: extras.append(j-1)
        i -= 1; j -= 1
    elif i > 0 and (j == 0 or p == 1): i -= 1
    else: extras.append(j-1); j -= 1
extras = sorted(extras)
out = [dict(**w, tm=(T[pair[k]]["s"] if k in pair else None), te=(T[pair[k]]["e"] if k in pair else None)) for k, w in enumerate(L)]
json.dump(dict(lyrics=out, extras=[dict(i=e, **T[e]) for e in extras]), open("data/match.json", "w", encoding="utf8"), ensure_ascii=False)
print("matched", len(pair), "/", len(L), "| transcribed words with no lyric:", len(extras), "| first sung word (Whisper):", T[0]["s"])
def runs(ix):
    g = []
    for e in ix:
        if g and e == g[-1][-1]+1: g[-1].append(e)
        else: g.append([e])
    return g
for x in runs(extras): print(f'extra {T[x[0]]["s"]:.1f}-{T[x[-1]]["e"]:.1f}:', ' '.join(T[k]["w"] for k in x))
for x in runs([k for k in range(n) if k not in pair]): print('unmatched lyric words:', ' '.join(L[k]["text"] for k in x))
