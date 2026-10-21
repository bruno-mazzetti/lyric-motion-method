"""Windowed CTC forced alignment: A(text,t0,t1) -> words with start/end/score inside the window [t0,t1] of the song (env SONG, default audio/song.flac)."""
import os, re, whisperx, torch
DEVICE = os.environ.get('DEVICE') or ('cuda' if torch.cuda.is_available() else 'cpu')
AUDIO = os.environ.get('SONG', 'audio/song.flac')
wav = whisperx.load_audio(AUDIO)
model, meta = whisperx.load_align_model(language_code="en", device=DEVICE)
def A(text, t0, t1):
    s=int(max(0,t0)*16000); e=int(t1*16000)
    r=whisperx.align([{"text":text,"start":0.0,"end":(e-s)/16000}], model, meta, wav[s:e], DEVICE, return_char_alignments=False)
    return [dict(w=x["word"],s=round(x["start"]+max(0,t0),2),e=round(x["end"]+max(0,t0),2),sc=round(x.get("score",0),2)) for x in r["word_segments"] if "start" in x]
