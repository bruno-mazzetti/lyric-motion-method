"""Splits data/words.json into scenes (same section + same voice, cut at each end of sentence) -> data/scenes.json"""
import json
W=json.load(open("data/words.json"))["words"]
sc=[];cur=None
for w in W:
    key=(w["section"],w["echo"])
    if cur and cur["key"]==key and not cur["done"]: cur["words"].append(w)
    else: cur={"key":key,"words":[w],"done":False}; sc.append(cur)
    cur["done"]=w["text"].rstrip(")").endswith((".","?"))
out=[dict(i=i,section=s["key"][0],echo=s["key"][1],a=s["words"][0]["start"],b=s["words"][-1]["end"],n=len(s["words"]),
          text=" ".join(x["text"] for x in s["words"])) for i,s in enumerate(sc)]
json.dump(out,open("data/scenes.json","w",encoding="utf8"),ensure_ascii=False,indent=1)
for s in out: print(s["i"],round(s["a"],1),round(s["b"],1),"E" if s["echo"] else "M",s["text"][:62])
