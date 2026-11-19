"""Time the actual voice takes, allocate reading holds, emit both SRTs and a VO cue sheet."""
import argparse
from array import array
import json
import math
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import wave

FPS,RATE,FRAMES=60,48000,1800
SAMPLE_FRAME=RATE//FPS
LEAD=[6,9,9,9,12]
MIN_TAIL=[35,28,35,36,94]
SPREAD=[9,14,35,24,18]


def pcm(path):
    with wave.open(str(path),'rb') as w:
        assert (w.getframerate(),w.getsampwidth(),w.getnchannels())==(RATE,2,1)
        return array('h',w.readframes(w.getnframes()))


def write(path,signal):
    with wave.open(str(path),'wb') as w:
        w.setparams((1,2,RATE,0,'NONE','not compressed'))
        w.writeframes(signal.tobytes())


def safe_trim(samples):
    step=RATE//50
    energy=[]
    for offset in range(0,len(samples),step):
        batch=samples[offset:offset+step]
        energy.append(math.sqrt(sum(x*x for x in batch)/len(batch)))
    threshold=max(72,max(energy)*.016)
    starts=[i for i,a in enumerate(energy) if a>threshold]
    if not starts or max(energy)<430:
        raise ValueError('No usable voice in take.')
    low=max(0,(starts[0]-4)*step)
    high=min(len(samples),(starts[-1]+6)*step)
    return samples[low:high]


def norm_timestamp(f):
    x=round(f*1000/FPS)
    return f'{x//3600000:02}:{x//60000%60:02}:{x//1000%60:02},{x%1000:03}'


def earcon(out,frame,length,hz,amp):
    anchor=frame*SAMPLE_FRAME
    for n in range(min(int(length*RATE),len(out)-anchor)):
        t=n/RATE
        e=min(t/.019,1)*math.exp(-5.6*t/length)
        val=int(amp*e*(math.sin(math.tau*hz*t)+.35*math.sin(math.tau*1.49*hz*t)))
        out[anchor+n]=max(-32768,min(32767,out[anchor+n]+val))


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('takes',type=Path,help='Five takes named 01..05 (.wav or .m4a)')
    ap.add_argument('out',type=Path)
    ap.add_argument('--ffmpeg',default='ffmpeg')
    ap.add_argument('--tempo',type=float,default=.98)
    args=ap.parse_args()
    if not .9<=args.tempo<=1:
        ap.error('Do not accelerate. Shorten the script if it does not fit.')
    args.out.mkdir(parents=True,exist_ok=True)
    texts=json.loads(Path(__file__).with_name('cues.json').read_text(encoding='utf-8'))
    assert len(texts)==5 and all(len(c[lang])<=2 and all(len(s)<=41 for s in c[lang]) for c in texts for lang in ('sw','en'))

    def ff(source,out,filter='anull'):
        subprocess.run([args.ffmpeg,'-nostdin','-v','error','-y','-i',str(source),'-af',filter,
                        '-ar',str(RATE),'-ac','1','-c:a','pcm_s16le',str(out)],check=True)

    with TemporaryDirectory() as folder:
        a,b=Path(folder)/'a.wav',Path(folder)/'b.wav'
        voiced=[]
        for i in range(1,6):
            shots=list(args.takes.glob(f'{i:02d}.*'))
            if len(shots)!=1:
                ap.error(f'Provide exactly one {i:02d}.wav or .m4a take')
            ff(shots[0],a)
            write(b,safe_trim(pcm(a)))
            ff(b,a,f'atempo={args.tempo}')
            voiced.append(pcm(a))
        lengths=[math.ceil(len(x)/SAMPLE_FRAME) for x in voiced]
        spare=FRAMES-sum(lengths)-sum(LEAD)-sum(MIN_TAIL)
        if spare<0:
            ap.error(f'Narration overruns by {-spare/FPS:.2f}s. Shorten a line or agree on a longer cut.')
        padding=[spare*w//100 for w in SPREAD]; padding[-1]+=spare-sum(padding)
        mix=array('h',[0])*(FRAMES*SAMPLE_FRAME); cues=[]; cursor=0
        for i,take in enumerate(voiced):
            start=cursor+LEAD[i]; finish=start+lengths[i]; end=finish+MIN_TAIL[i]+padding[i]
            dest=start*SAMPLE_FRAME; mix[dest:dest+len(take)]=take
            cues.append(dict(texts[i],sceneStart=cursor,sceneEnd=end,start=start,end=finish,
                             captionEnd=min(end-7,finish+23)))
            cursor=end
        assert cursor==FRAMES
        for shot,tone in zip(cues,((57,190,.29,790),(118,560,.28,1050),(118,349,.29,920),(146,264,.27,930),(71,444,.23,780))):
            off,hz,sec,amp=tone
            earcon(mix,shot['sceneStart']+off,sec,hz,amp)
        write(a,mix)
        ff(a,args.out/'mix.wav','highpass=f=65,loudnorm=I=-16:LRA=8:TP=-2')
    assert len(pcm(args.out/'mix.wav'))==FRAMES*SAMPLE_FRAME
    (args.out/'timeline.json').write_text(json.dumps({'cues':cues,'frames':FRAMES},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    for lang,label in [('sw','Kiswahili'),('en','English')]:
        lines='\n\n'.join(f'{i}\n{norm_timestamp(c["start"])} --> {norm_timestamp(c["captionEnd"])}\n'+ '\n'.join(c[lang])
                          for i,c in enumerate(cues,1))
        (args.out/f'API-MCP-{label}.srt').write_text(lines+'\n',encoding='utf-8')
    print(f'{FRAMES/FPS:.3f}s · {args.tempo:.2f}× of original tempo')
    for c in cues:
        print(c['shot'],f'frames {c["sceneStart"]}–{c["sceneEnd"]}; voice {c["start"]/FPS:.2f}–{c["end"]/FPS:.2f}s')
    guide=['VOICEOVER · MWIJAY · TECH TIP 01','',
           'Rekodi take mbili kwa kila beat, simu umbali wa kiganja, chumba tulivu. Acha nafasi kabla na baada ya mstari.',
           'Tuma takes 01–05 (WAV au M4A). Timestamps hapa ni mwongozo wa cut, si lazima uongee haraka kufuata TTS.',
           'API: ei-pi-ai. MCP: em-si-pi. AI: ei-ai au akili bandia. Tumia matamshi yako ya kawaida.',
           'Picture master haina sauti wala captions za mazungumzo; headlines/graphics zimebaki. Tutapanga SRT kwa sauti yako.','']
    for i,c in enumerate(cues,1):
        voice=' '.join(c['sw']).replace('app ya AI','app ya akili bandia')
        guide.extend([f'{i:02d} | {c["start"]/FPS:.2f}s–{c["end"]/FPS:.2f}s | {c["shot"].upper()}',voice,''])
    (args.out/'Record-Your-Voiceover.txt').write_text('\n'.join(guide),encoding='utf-8')


if __name__=='__main__':
    main()
