"""Make a 39s dialogue stem, caption pair, owner cue guide and quiet original foley."""
import argparse
from array import array
from hashlib import sha256
import json
import math
from pathlib import Path
import random
import subprocess
from tempfile import TemporaryDirectory
import wave

HERE = Path(__file__).resolve().parent
FPS, RATE = 60, 48000
STEP = RATE // FPS


def write_wave(path, pcm):
    with wave.open(str(path), 'wb') as w:
        w.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
        w.writeframes(pcm.tobytes())


def full_pcm(path, ff):
    return array('h', subprocess.check_output([ff, '-nostdin', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(RATE), '-f', 's16le', '-']))


def stamp(f):
    m = round(f * 1000 / FPS)
    return f'00:00:{m//1000:02},{m%1000:03}'


def peak(samples):
    return round(20 * math.log10(max(1, max(map(abs, samples))) / 32768), 2)


def mix_foley(d, shots, layout, dry):
    start = {s['shot']: s['start'] for s in shots}
    b = layout['beats']
    actions = [('hook', 'add', 'paper'), ('hook', 'fee', 'tap'), ('hook', 'total', 'ink'),
               ('basket', 'basket', 'paper'), ('basket', 'fee', 'tap'), ('basket', 'total', 'ink'),
               ('unlock', 'add', 'slide'), ('unlock', 'fee', 'tap'), ('unlock', 'total', 'ink'),
               ('compare', 'delta', 'ink'), ('close', 'cta', 'paper')]
    palette = {'paper': (.125, 345, 240, .7, -28.5), 'tap': (.08, 550, 380, .28, -29),
               'ink': (.158, 406, 575, .12, -28), 'slide': (.22, 510, 250, .68, -28.6)}
    fx = array('h', [0]) * len(dry); events = []
    rng = random.Random(1829)
    for shot, step, sound in actions:
        frame = start[shot] + b[shot][step]
        dt, f0, f1, noise, db = palette[sound]
        n = round(dt * RATE); i0 = frame * STEP; phase = 0; smooth = 0
        for k in range(n):
            t = k / n; phase += math.tau * (f0 + (f1 - f0) * t) / RATE
            smooth = .65 * smooth + .35 * rng.uniform(-1, 1)
            env = min(k / (RATE * .006), 1) * min((1-t) * 9, 1) * math.exp(-3*t)
            fx[i0 + k] += round(32767 * 10**(db/20) * env * ((1-noise)*math.sin(phase) + noise*smooth))
        events.append(dict(shot=shot, state=step, frame=frame, type=sound))
    printed = [x + y for x, y in zip(dry, fx)]
    assert max(map(abs, printed)) <= 32767
    mix = array('h', printed)
    assert peak(fx) <= -25 and peak(mix) <= -1.5
    write_wave(d/'SFX-Only.wav', fx); write_wave(d/'Voice-and-SFX.wav', mix)
    (d/'sfx-cues.json').write_text(json.dumps(dict(origin='Original synthesized paper/UI accents; no reference audio',
        events=events, fxDbfs=peak(fx), mixDbfs=peak(mix)), indent=2)+'\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('takes', type=Path); parser.add_argument('audio',type=Path); parser.add_argument('--ffmpeg', default='ffmpeg'); a=parser.parse_args()
    d=a.audio; d.mkdir(parents=True,exist_ok=True)
    layout=json.loads((HERE/'layout.json').read_text()); frames=layout['frames']; assert layout['fps']==FPS
    cap=[]; shots=[]; start=0; timed=array('h',[0])*(frames*STEP)
    guide=['ALTRAWARE · FREE DELIVERY? · OWNER VO','',
           'Rekodi take mbili kwa kila beat. Soma kawaida, acha kimya kabla na baada.',
           'Anza na silent picture, ongeza SFX-Only.wav mara moja kwenye track yake.',
           'Retime captions na visemes kwa take mpya; silent master ina resting mouth.','']
    for i,c in enumerate(json.loads((HERE/'cues.json').read_text()),1):
        original=a.takes/f'{i:02d}.wav'; raw=full_pcm(original,a.ffmpeg); lo,hi=c['trim']; joins=c.get('joins',[])
        last=lo; cut=array('h')
        for x,y in [*joins,[hi,hi]]:
            assert 0<=last<x<=y<=hi<=len(raw)/RATE
            block=raw[round(last*RATE):round(x*RATE)]
            for j in range(288):
                block[j]=round(block[j]*j/288);block[-1-j]=round(block[-1-j]*j/288)
            cut.extend(block);last=y
        lead=start+c['lead']; end=c['end']; stop=lead+math.ceil(len(cut)/STEP)
        assert stop+12<end,(i,stop,end)
        timed[lead*STEP:lead*STEP+len(cut)]=cut
        shots.append(dict(shot=c['shot'],start=start,end=end,voiceStart=lead,voiceEnd=stop,take_sha256=sha256(original.read_bytes()).hexdigest()))
        edges=[lead+round((p['at']-lo-sum(y-x for x,y in joins if y<=p['at']))*FPS) for p in c['parts']]+[min(stop+13,end-3)]
        for j,p in enumerate(c['parts']):
            assert edges[j+1]-edges[j]>=42 and all(1<=len(p[k])<=2 and max(map(len,p[k]))<=42 for k in ('sw','en'))
            cap.append(dict(start=edges[j],end=edges[j+1],sw=p['sw'],en=p['en']))
        guide.extend([f'{i:02} · {c["shot"].upper()} · {lead/FPS:.2f}–{stop/FPS:.2f}s',
                      ' '.join(line for p in c['parts'] for line in p['sw']),'']); start=end
    assert start==frames
    with TemporaryDirectory() as temp:
        raw=Path(temp)/'raw.wav'; write_wave(raw,timed)
        subprocess.run([a.ffmpeg,'-nostdin','-v','error','-y','-i',str(raw),'-af','highpass=f=65,loudnorm=I=-16:LRA=8:TP=-2',
                        '-ar',str(RATE),'-ac','1','-c:a','pcm_s16le',str(d/'reference.wav')],check=True)
    with wave.open(str(d/'reference.wav'),'rb') as w:
        assert w.getparams()[:4]==(1,2,RATE,frames*STEP); dry=array('h',w.readframes(w.getnframes()))
    (d/'timeline.json').write_text(json.dumps(dict(fps=FPS,frames=frames,shots=shots,captions=cap,portraitShots=['hook','close']),ensure_ascii=False,indent=2)+'\n')
    for lang,label in [('sw','Swanglish'),('en','English')]:
        (d/f'Free-Delivery-{label}.srt').write_text('\n\n'.join(f'{i}\n{stamp(c["start"])} --> {stamp(c["end"])}\n'+'\n'.join(c[lang]) for i,c in enumerate(cap,1))+'\n',encoding='utf-8')
    (d/'Record-Your-Voiceover.txt').write_text('\n'.join(guide),encoding='utf-8')
    mix_foley(d,shots,layout,dry)
    print(f'{len(shots)} takes · {len(cap)} cues per language · {frames/FPS:.3f}s · 1×')


if __name__=='__main__': main()
