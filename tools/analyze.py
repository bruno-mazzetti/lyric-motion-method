"""Audio analysis -> data/audio.json (tempo, beats, onsets, energy at 10 Hz)"""
import librosa, json, numpy as np
y,sr=librosa.load(__import__("os").environ.get("SONG","audio/song.flac"),sr=22050,mono=True)
tempo,beats=librosa.beat.beat_track(y=y,sr=sr,units="time")
rms=librosa.feature.rms(y=y,hop_length=2205)[0]; rms=rms/rms.max()
on=librosa.onset.onset_detect(y=y,sr=sr,units="time",backtrack=False)
json.dump(dict(tempo=float(np.atleast_1d(tempo)[0]),beats=[round(float(b),3) for b in beats],onsets=[round(float(o),3) for o in on],energy=[round(float(e),3) for e in rms]),open("data/audio.json","w"))
print("tempo",np.atleast_1d(tempo)[0],"beats",len(beats),"onsets",len(on))
