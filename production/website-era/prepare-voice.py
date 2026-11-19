"""Time a 45s edition to six approved language-specific takes (no rate change)."""
import argparse
from array import array
from hashlib import sha256
import json
import math
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import wave

FPS,RATE,FRAMES=60,48000,2700
UNIT=RATE//FPS


def stamp(f):
    m=round(f*1000/FPS)
    return f'{m//3600000:02}:{m//60000%60:02}:{m//1000%60:02},{m%1000:03}'


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('takes',type=Path);p.add_argument('out',type=Path);p.add_argument('--ffmpeg',default='ffmpeg');p.add_argument('--locale',choices=['sw','en'],default='sw');a=p.parse_args()
    d=a.out;d.mkdir(parents=True,exist_ok=True)
    edition=json.loads(Path(__file__).with_name('editions.json').read_text())[a.locale];languages=edition['sidecars']
    cues=json.loads(Path(__file__).with_name(edition['cues']).read_text());cap=[];shots=[];frame=0;pcm=array('h',[0])*(FRAMES*UNIT)
    guide=['ALTRAWARE · WEBSITE YAKO KWENYE AI ERA · OWNER VO','',
           'Rekodi beats hizi kwa sauti yako, take mbili kila moja. Acha kimya kabla na baada.',
           'Master ya picha haina narration. Tumia WAV ya SFX kwa track tofauti.',
           'Kwa take mpya: panga upya subtitles na mouth cues, au tumia master ya relaxed mouth.',
           'ChatGPT, Gemini na Altraware zisomwe kawaida; usisome URLs.','']
    if a.locale=='en':
        guide=['ALTRAWARE · WHY YOUR WEBSITE MATTERS · OWNER VOICEOVER','',
               'Record two takes per beat, at your natural pace. Leave a little quiet at both ends.',
               'The silent master has a resting mouth. Add SFX-Only.wav once on a separate track.',
               'For matched mouth motion, align the captions and visemes to your final dry recording.',
               'Say ChatGPT, Gemini, Altraware and WEB naturally. Do not read the URLs.','']
    for i,c in enumerate(cues,1):
        src=a.takes/f'{i:02d}.wav'
        raw=array('h',subprocess.check_output([a.ffmpeg,'-nostdin','-v','error','-i',str(src),'-ac','1','-ar',str(RATE),'-f','s16le','-']))
        lo,hi=c['trim'];gaps=c.get('joins',[]);runs=[];cursor=lo
        for x,y in gaps:assert cursor<x<y<hi;runs.append((cursor,x));cursor=y
        runs.append((cursor,hi));cut=array('h')
        for x,y in runs:
            assert 0<=x<y<=len(raw)/RATE
            block=raw[round(x*RATE):round(y*RATE)]
            for j in range(288):
                block[j]=round(block[j]*j/288);block[-1-j]=round(block[-1-j]*j/288)
            cut.extend(block)
        start=frame+c['lead'];stop=start+math.ceil(len(cut)/UNIT)
        assert stop+16<=c['end'],(c['shot'],stop,c['end'])
        pcm[start*UNIT:start*UNIT+len(cut)]=cut
        shots.append(dict(shot=c['shot'],start=frame,end=c['end'],voiceStart=start,voiceEnd=stop,trim=c['trim'],joins=gaps,take_sha256=sha256(src.read_bytes()).hexdigest()))
        edges=[start+round((x['at']-lo-sum(y-z for z,y in gaps if y<=x['at']))*FPS) for x in c['parts']]+[min(c['end']-3,stop+16)]
        for j,x in enumerate(c['parts']):
            assert edges[j+1]-edges[j]>=41 and all(1<=len(x[k])<=2 and max(map(len,x[k]))<=43 for k in languages)
            cap.append(dict(start=edges[j],end=edges[j+1],**{k:x[k] for k in languages}))
        guide.extend([f'{i:02} · {c["shot"].upper()} · {start/FPS:.2f}–{stop/FPS:.2f}s',' '.join(line for x in c['parts'] for line in x[a.locale]),''])
        frame=c['end']
    assert frame==FRAMES
    with TemporaryDirectory() as ts:
        src=Path(ts)/'raw.wav'
        with wave.open(str(src),'wb') as w:
            w.setparams((1,2,RATE,0,'NONE','not compressed'));w.writeframes(pcm.tobytes())
        subprocess.run([a.ffmpeg,'-nostdin','-v','error','-y','-i',str(src),'-af','highpass=f=65,loudnorm=I=-16:LRA=8:TP=-2',
                        '-ar',str(RATE),'-ac','1','-c:a','pcm_s16le',str(d/'reference.wav')],check=True)
    with wave.open(str(d/'reference.wav'),'rb') as w:assert w.getnframes()==FRAMES*UNIT
    (d/'timeline.json').write_text(json.dumps(dict(fps=FPS,frames=FRAMES,captions=cap,shots=shots,locale=a.locale),ensure_ascii=False,indent=2)+'\n')
    for code,name in languages.items():
        (d/name).write_text('\n\n'.join(f'{i}\n{stamp(x["start"])} --> {stamp(x["end"])}\n'+'\n'.join(x[code]) for i,x in enumerate(cap,1))+'\n',encoding='utf-8')
    (d/'Record-Your-Voiceover.txt').write_text('\n'.join(guide),encoding='utf-8')
    print(f'{len(shots)} takes · {len(cap)} caption cues · {a.locale} · {FRAMES/FPS:.3f}s · 1.00×.')


if __name__=='__main__':main()
