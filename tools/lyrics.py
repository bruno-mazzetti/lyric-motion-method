"""Reads data/lyrics.txt -> data/lyrics_words.json (one record per word, no timings).
File format: lyric lines; [Section] on its own line; an opening "(" marks the "echo/choir" voice until the closing ")"."""
import re, json
words = []; sec = None; inparen = False; line = 0
for raw in open("data/lyrics.txt", encoding="utf8"):
    raw = raw.strip()
    if not raw: continue
    m = re.fullmatch(r"\[(.+)\]", raw)
    if m: sec = m.group(1); continue
    line += 1
    for tok in raw.replace("—", " — ").split():
        if tok == "—": continue
        if tok.startswith("("): inparen = True
        w = re.sub(r"[^\w'’]", "", tok)
        if w: words.append(dict(text=tok.strip("()"), w=w, section=sec, line=line, echo=inparen))
        if tok.endswith(")") or tok.endswith(")."): inparen = False
json.dump(words, open("data/lyrics_words.json", "w", encoding="utf8"), ensure_ascii=False, indent=0)
print(len(words), "words")
