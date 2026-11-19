"""Build five measured takes into a 37s scratch WAV, a cue sheet and bilingual SRTs."""
import argparse
from array import array
from hashlib import sha256
import json
import math
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import wave

FPS, RATE, FRAMES = 60, 48000, 2220
SPF = RATE // FPS


def stamp(f):
    m = round(f*1000/FPS)
    return f'{m//3600000:02}:{m//60000%60:02}:{m//1000%60:02},{m%1000:03}'


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('takes',type=Path); p.add_argument('out',type=Path); p.add_argument('--ffmpeg',default='ffmpeg')
    a = p.parse_args(); out=a.out; out.mkdir(parents=True,exist_ok=True)
    source=json.loads(Path(__file__).with_name('cues.json').read_text(encoding='utf-8'))
    audio=array('h',[0]) * (FRAMES*SPF); shots=[]; captions=[]; cursor=0
    notes=['ALTRAWARE · MBONA PILAU IMERUDI? · RECORD YOUR VOICE','',
           'TTS ni scratch VO. Tumia picture master bila audio, au mute audio ya preview.',
           'Rekodi take mbili kwa kila beat. Acha nusu sekunde kabla na baada, usiige pace ya TTS.',
           'SRT ina timing ya reference; retime ikiwa unabadilisha voiceover.','']
    for i,c in enumerate(source,1):
        take=a.takes/f'{i:02d}.wav'; low,high=(round(s*RATE) for s in c['trim'])
        pcm=array('h',subprocess.check_output([a.ffmpeg,'-nostdin','-v','error','-i',str(take),'-ac','1','-ar',str(RATE),'-f','s16le','-']))
        assert 0<=low<high<=len(pcm), i
        cut=pcm[low:high]; assert max(map(abs,cut))>1500
        # 6ms edge fades, before normalization; no time-stretching.
        for j in range(288):
            cut[j]=round(cut[j]*j/288); cut[-j-1]=round(cut[-j-1]*j/288)
        start=cursor+c['lead']; finish=start+math.ceil(len(cut)/SPF)
        assert finish+20<=c['end'], 'Trim at silence or shorten a line; no voice speedup.'
        audio[start*SPF:start*SPF+len(cut)]=cut
        shots.append(dict(shot=c['shot'],start=cursor,end=c['end'],voiceStart=start,voiceEnd=finish,take=sha256(take.read_bytes()).hexdigest()))
        edges=[start+round((s['at']-c['trim'][0])*FPS) for s in c['parts']]+[min(finish+16,c['end']-4)]
        for j,s in enumerate(c['parts']):
            assert edges[j+1]-edges[j]>=48 and all(1<=len(s[k])<=2 and max(map(len,s[k]))<=43 for k in ('sw','en'))
            captions.append(dict(start=edges[j],end=edges[j+1]-1,sw=s['sw'],en=s['en']))
        notes.extend([f'{i:02d} · {c["shot"].upper()} · {start/FPS:.2f}–{finish/FPS:.2f}s',
                      ' '.join(line for s in c['parts'] for line in s['sw']),''])
        cursor=c['end']
    assert cursor==FRAMES
    with TemporaryDirectory() as tmp:
        raw=Path(tmp)/'raw.wav'
        with wave.open(str(raw),'wb') as w:
            w.setparams((1,2,RATE,0,'NONE','not compressed')); w.writeframes(audio.tobytes())
        subprocess.run([a.ffmpeg,'-nostdin','-v','error','-y','-i',str(raw),'-af','highpass=f=66,loudnorm=I=-16:LRA=8:TP=-2',
                        '-ar',str(RATE),'-ac','1','-c:a','pcm_s16le',str(out/'reference.wav')],check=True)
    with wave.open(str(out/'reference.wav'),'rb') as w: assert w.getnframes()==FRAMES*SPF
    (out/'timeline.json').write_text(json.dumps(dict(fps=FPS,frames=FRAMES,shots=shots,captions=captions),indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    for lang,label in [('sw','Swanglish'),('en','English')]:
        (out/f'Search-Race-{label}.srt').write_text('\n\n'.join(f'{i}\n{stamp(c["start"])} --> {stamp(c["end"])}\n'+'\n'.join(c[lang]) for i,c in enumerate(captions,1))+'\n',encoding='utf-8')
    (out/'Record-Your-Voiceover.txt').write_text('\n'.join(notes),encoding='utf-8')
    print(f'{FRAMES/FPS:.3f}s · {len(shots)} shots · {len(captions)} cues per language · 1.00× original voice')


if __name__=='__main__':main()
