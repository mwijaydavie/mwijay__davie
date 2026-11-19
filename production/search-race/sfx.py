"""Deterministic original foley; no samples, music or effects from the references."""
import argparse
from array import array
import json
import math
from pathlib import Path
import random
import wave

RATE,FPS=48000,60

def peak(samples):
    return round(20*math.log10(max(1,max(map(abs,samples)))/32768),2)


def save(path,v):
    with wave.open(str(path),'wb') as w:
        w.setparams((1,2,RATE,0,'NONE','not compressed'));w.writeframes(array('h',v).tobytes())


def cue(kind):
    # (duration seconds, start/end hz, noise share, amplitude as dBFS). Soft attack/release.
    return {'tap':(.045,290,160,.34,-29),'send':(.15,393,551,.09,-29),'return':(.16,582,719,.035,-27),
            'late':(.22,434,177,.08,-26),'block':(.105,234,181,.13,-28),'lock':(.145,380,604,.02,-26),
            'offer':(.19,455,661,.023,-28)}[kind]


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('audio',type=Path);a=p.parse_args();d=a.audio
    t=json.loads((d/'timeline.json').read_text());layout=json.loads(Path(__file__).with_name('layout.json').read_text())
    assert t['fps']==FPS and t['frames']==layout['frames'];start={s['shot']:s['start'] for s in t['shots']}
    f=layout['race'];r=layout['repeat']
    score=[('hook',23,'tap','search highlight'),('hook',104,'late','mismatch appears'),
           ('race',f[0],'send','pilau sent'),('race',f[1]-7,'tap','chai typed'),('race',f[1],'send','chai sent'),
           ('race',f[2],'return','chai resolves'),('race',f[3],'late','pilau overwrites'),
           ('fix',102,'tap','new ID'),('fix',221,'lock','guard focus'),
           ('repeat',r[1],'send','send chai again'),('repeat',r[2],'return','chai resolves again'),
           ('repeat',r[3],'block','discard old result'),('repeat',layout['oldError'],'block','separate old-error test'),('cta',49,'offer','resource chip')]
    length=RATE*t['frames']//FPS; fx=[0]*length;events=[];rng=random.Random(4126)
    for shot,offset,kind,anchor in score:
        dur,f0,f1,noise,db=cue(kind);frame=start[shot]+offset; onset=frame*RATE//FPS;n=round(dur*RATE)
        phase=0.;gain=32767*10**(db/20);last=0.
        for i in range(n):
            x=i/n;at=i/RATE;phase+=math.tau*(f0+(f1-f0)*x)/RATE
            # Low noise under resonant taps; fade both ends to avoid hard PCM clicks.
            last=last*.73+.27*rng.uniform(-1,1)
            amp=min(1,at/.007)*math.exp(-2.75*x)*min(1,(1-x)*7)
            fx[onset+i]+=round(gain*amp*((1-noise)*(.82*math.sin(phase)+.18*math.sin(phase*1.51))+noise*last))
        events.append(dict(shot=shot,frame=frame,sec=round(frame/FPS,3),kind=kind,anchor=anchor,durationMs=round(1000*dur)))
    with wave.open(str(d/'reference.wav'),'rb') as w:
        assert (w.getnframes(),w.getframerate(),w.getsampwidth(),w.getnchannels())==(length,RATE,2,1)
        voice=array('h',w.readframes(length))
    mix=[x+y for x,y in zip(voice,fx)];assert peak(fx)<-24 and peak(mix)<-1.4
    save(d/'SFX-Only.wav',fx);save(d/'Voice-and-SFX.wav',mix)
    (d/'sfx-cues.json').write_text(json.dumps(dict(source='Original synthesised taps and soft chirps, no third-party audio',events=events,voice_dBFS=peak(voice),fx_dBFS=peak(fx),mix_dBFS=peak(mix)),indent=2)+'\n')
    print(f'{len(events)} original cues | FX {peak(fx)} dBFS peak | mix {peak(mix)} dBFS peak.')

if __name__=='__main__':main()
