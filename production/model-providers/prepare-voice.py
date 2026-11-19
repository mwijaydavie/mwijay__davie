"""Cut eight reference takes at measured silences; build sample-exact audio and SW/EN cues."""
import argparse
from array import array
import hashlib
import json
import math
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import wave

RATE,FPS,FRAMES=48000,60,3600
SPF=RATE//FPS


def stamp(frame):
    ms=round(frame*1000/FPS)
    return f'{ms//3_600_000:02}:{ms//60_000%60:02}:{ms//1000%60:02},{ms%1000:03}'


def wav(path,pcm):
    with wave.open(str(path),'wb') as w:
        w.setparams((1,2,RATE,0,'NONE','not compressed')); w.writeframes(pcm.tobytes())


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('takes',type=Path); p.add_argument('out',type=Path);p.add_argument('--ffmpeg',default='ffmpeg')
    args=p.parse_args(); d=args.out; d.mkdir(parents=True,exist_ok=True)
    src=json.loads(Path(__file__).with_name('cues.json').read_text(encoding='utf-8'))
    assert len(src)==8 and src[-1]['end']==FRAMES
    mix=array('h',[0])*(FRAMES*SPF); scenes=[]; cues=[]; cursor=0
    with TemporaryDirectory() as tmp:
        for i,scene in enumerate(src,1):
            take=args.takes/f'{i:02}.wav'
            raw=subprocess.check_output([args.ffmpeg,'-nostdin','-v','error','-i',str(take),'-ar',str(RATE),'-ac','1','-f','s16le','-'])
            all_samples=array('h',raw); a,b=(round(s*RATE) for s in scene['trim'])
            assert 0<=a<b<=len(all_samples), f'Check measured trim for take {i}'
            pcm=all_samples[a:b]; assert max(abs(s) for s in pcm)>2000
            # Apply 6 ms edge fades to avoid step clicks, without changing pacing or chopping syllables.
            fade=round(.006*RATE)
            for j in range(fade):
                pcm[j]=round(pcm[j]*j/fade); pcm[-(j+1)]=round(pcm[-(j+1)]*j/fade)
            start=cursor+scene['lead']; end=start+math.ceil(len(pcm)/SPF)
            assert end+20<=scene['end'], f'Record a shorter take {i} or retime; never time-compress the owner.'
            mix[start*SPF:start*SPF+len(pcm)]=pcm
            scenes.append({'shot':scene['shot'],'start':cursor,'end':scene['end'],'voiceStart':start,'voiceEnd':end,
                           'source_sha256':hashlib.sha256(take.read_bytes()).hexdigest()})
            parts=scene['parts']; assert parts[0]['at']==scene['trim'][0]
            cut=[start+round((c['at']-scene['trim'][0])*FPS) for c in parts]
            cut.append(min(scene['end']-8,end+22))
            for j,part in enumerate(parts):
                assert cut[j+1]-cut[j]>=54
                for lang in ('sw','en'): assert 1<=len(part[lang])<=2 and max(map(len,part[lang]))<=42
                cues.append({'start':cut[j],'end':cut[j+1]-1,**{lang:part[lang] for lang in ('sw','en')}})
            cursor=scene['end']
        source=Path(tmp)/'raw.wav'; wav(source,mix)
        subprocess.run([args.ffmpeg,'-nostdin','-v','error','-y','-i',str(source),'-af','highpass=f=66,loudnorm=I=-16:LRA=8:TP=-2',
                        '-ar',str(RATE),'-ac','1','-c:a','pcm_s16le',str(d/'reference.wav')],check=True)
    with wave.open(str(d/'reference.wav'),'rb') as w: assert w.getnframes()==FRAMES*SPF and w.getframerate()==RATE
    (d/'timeline.json').write_text(json.dumps({'fps':FPS,'frames':FRAMES,'scenes':scenes,'captions':cues},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    for lang,label in [('sw','Swanglish'),('en','English')]:
        (d/f'Model-Providers-{label}.srt').write_text('\n\n'.join(f'{i}\n{stamp(c["start"])} --> {stamp(c["end"])}\n'+'\n'.join(c[lang]) for i,c in enumerate(cues,1))+'\n',encoding='utf-8')
    notes=['TECH TIP · MODEL PROVIDERS · RECORD YOUR VOICE','',
           'TTS ya Reel ya review ni scratch VO tu. Mute audio au tumia picture master bila audio wala dialogue captions.',
           'Rekodi beats 8, take mbili kwa kila moja. Tumia Swanglish yako ya kawaida, simu umbali wa kiganja, chumba tulivu.',
           'Tuma WAV au M4A original. Acha nusu sekunde kabla/baada; si lazima uige timing au pronunciation ya TTS.',
           'Pronunciation ya kuanzia: DeepSeek (deep seek), Claude (klod), Z.AI (zed dot A-I), Qwen (kwen), 429 (four-two-nine).','']
    for i,(scene,edit) in enumerate(zip(src,scenes),1):
        text=' '.join(' '.join(c['sw']) for c in scene['parts'])
        notes.extend([f'{i:02} / {edit["shot"].upper()}  {edit["voiceStart"]/FPS:05.2f}s–{edit["voiceEnd"]/FPS:05.2f}s',text,''])
        print(f'{edit["shot"]:<8}  {edit["start"]/FPS:05.2f}–{edit["end"]/FPS:05.2f}s, voice {edit["voiceStart"]/FPS:05.2f}–{edit["voiceEnd"]/FPS:05.2f}s')
    (d/'Record-Your-Voiceover.txt').write_text('\n'.join(notes),encoding='utf-8')
    print(f'{FRAMES/FPS:.3f}s, 1.00× takes, {len(cues)} cues per language')


if __name__=='__main__':main()
