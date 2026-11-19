"""Original quiet tactile accents, printed separately for owner VO."""
import argparse
from array import array
import json
import math
from pathlib import Path
import random
import wave

RATE,FPS=48000,60


def save(path,data):
    with wave.open(str(path),'wb') as w:
        w.setparams((1,2,RATE,0,'NONE','not compressed'));w.writeframes(array('h',data).tobytes())


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('audio',type=Path);a=p.parse_args();d=a.audio
    t=json.loads((d/'timeline.json').read_text());layout=json.loads(Path(__file__).with_name('layout.json').read_text());start={s['shot']:s['start'] for s in t['shots']}
    locale=t.get('locale','sw');edition=json.loads(Path(__file__).with_name('editions.json').read_text())[locale]
    if locale=='en':layout.update(layout['english'])
    spec={'key':(.046,595,272,.48,-31.5),'tap':(.06,420,258,.33,-29.5),'open':(.18,304,588,.08,-27.8),
          'result':(.136,515,640,.055,-28.6),'swipe':(.19,340,183,.68,-31.8),'offer':(.24,451,609,.06,-27.8)}
    root=Path(__file__).resolve().parents[2];opening=json.loads((root/'.agents/skills/altraware-search-reels/examples'/edition['plan']).read_text())['beats']
    keys=[opening['typing']+round((opening['typed']-opening['typing'])*x) for x in (.01,.30,.56,.92)]
    actions=[*(('search',f,'key') for f in keys),('search',opening['submit'],'tap'),('search',opening['ready'],'result'),('search',opening['click'],'open'),
      ('link',153,'tap'),('own',layout['ownRows'][0],'result'),('own',layout['ownRows'][1],'tap'),('own',layout['ownRows'][2],'tap'),
      ('work',layout['workBongoChange'],'tap'),('work',layout['workSwap'],'swipe'),('work',layout['workSwap']+layout['workSpecsChange'],'tap'),
      ('offer',layout['offerNotes'][2],'result'),('close',39,'offer')]
    n=RATE*t['frames']//FPS;waveform=[0]*n;noise_rng=random.Random(2836);events=[]
    for shot,f,k in actions:
        fr=start[shot]+f;at=fr*RATE//FPS;dur,fa,fb,noise,db=spec[k];length=round(dur*RATE);phase=0;sm=0;gain=32767*10**(db/20)
        for i in range(length):
            x=i/length;a0=min(i/(.007*RATE),1);a0*=min(1,(1-x)*8);a0*=math.exp(-3.1*x) if k!='swipe' else math.sin(math.pi*x)**1.7
            phase+=math.tau*(fa+(fb-fa)*x)/RATE;sm=.68*sm+.32*noise_rng.uniform(-1,1)
            tone=(math.sin(phase)*.81+.19*math.sin(phase*1.63))
            waveform[at+i]+=round(a0*gain*(tone*(1-noise)+sm*noise))
        events.append(dict(shot=shot,frame=fr,seconds=round(fr/FPS,3),kind=k,milliseconds=round(dur*1000)))
    with wave.open(str(d/'reference.wav'),'rb') as w:
        assert w.getparams()[:4]==(1,2,RATE,n);voice=array('h',w.readframes(n))
    mix=[x+y for x,y in zip(voice,waveform)];peak=lambda x:round(20*math.log10(max(1,max(map(abs,x)))/32768),2)
    assert peak(waveform)<-25 and peak(mix)<-1.3
    save(d/'SFX-Only.wav',waveform);save(d/'Voice-and-SFX.wav',mix)
    (d/'sfx-cues.json').write_text(json.dumps(dict(events=events,origin='Original synthesized UI foley; no music/reference sound',fxDbfs=peak(waveform),mixDbfs=peak(mix)),indent=2)+'\n')
    print(f'{len(events)} effects | FX peak {peak(waveform)} dBFS | mix {peak(mix)} dBFS')


if __name__=='__main__':main()
