import React from 'react';
import {Easing, Html5Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import project from '../project.json';
import {AppArtwork, Brand, Canvas, FilterDemo, FlowBand, Icon, PlotRecord, ProblemCards, RequestForm} from './visuals';
import {Avocados, FieldRows} from './illustrations';

export type Cue = {shot: string; lines: string[]; start: number; end: number};
export type ReelProps = {cues: Cue[]; durationInFrames: number; audio: boolean};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ramp = (frame: number, from: number, to: number) => interpolate(frame, [from, to], [0, 1], clamp);
const rise = (frame: number, from: number, fps: number) =>
  Math.min(1, Math.max(0, spring({frame: frame - from, fps, config: {damping: 14, stiffness: 120, mass: .8}})));

const shots: Record<string, {theme: 'field' | 'light'; label: string; title: [string, string]}> = {
  hook: {theme: 'field', label: 'ALTRAWARE · SOFTWARE DEMO', title: ['Software ya biashara', 'ya parachichi.']},
  problem: {theme: 'light', label: 'CHANGAMOTO YA BIASHARA', title: ['Chat si rekodi', 'ya mavuno.']},
  friction: {theme: 'light', label: 'TAARIFA ZIKITAWANYIKA', title: ['Maswali yale', 'yale.']},
  record: {theme: 'light', label: '01 · REKODI YA SHAMBA', title: ['Rekodi moja', 'ya shamba.']},
  filter: {theme: 'field', label: '02 · UTAFUTAJI', title: ['Chuja kwa', 'aina na wilaya.']},
  harvest: {theme: 'field', label: '02 · UTAFUTAJI', title: ['Kagua hali', 'ya mavuno.']},
  request: {theme: 'light', label: '03 · OMBI KWA MKULIMA', title: ['Ombi lenye', 'maelezo.']},
  'not-sale': {theme: 'light', label: '03 · OMBI KWA MKULIMA', title: ['Ombi si', 'mauzo.']},
  cta: {theme: 'field', label: '', title: ['Comment', project.keyword]},
};

export function Reel({cues, durationInFrames, audio}: ReelProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const visualStarts = cues.map((cue, i) => i === 0 ? 0 : Math.max(cues[i-1].end, cue.start - 6));
  const index = visualStarts.reduce((n, start, i) => frame >= start ? i : n, 0);
  const cue = cues[index];
  const shot = shots[cue.shot];
  const local = frame - visualStarts[index];
  const span = (visualStarts[index + 1] ?? durationInFrames) - visualStarts[index];
  const moment = ramp(local, 0, Math.max(1, span - 1));
  const enter = rise(local, 0, fps);
  const isEnd = cue.shot === 'cta';
  const showCaption = frame >= cue.start && (frame < cue.end || isEnd);
  const lift = (1-enter)*36;
  let graphic: React.ReactNode;
  let zoom = .89;
  let y = lift;

  if (cue.shot === 'hook') {
    graphic = <AppArtwork reveal={rise(local, 17, fps)} shift={moment*22}/>;
    zoom = .865 + .032 * moment;
    y += (1-rise(local, 16, fps))*31;
  } else if (cue.shot === 'problem' || cue.shot === 'friction') {
    const follow = cue.shot === 'friction';
    const focus = follow ? Math.min(2, Math.floor(moment * 3.08)) : -1;
    graphic = <ProblemCards arrivals={follow ? [1, 1, 1] : [8, 59, 115].map(delay => rise(local, delay, fps))}
      trace={follow ? ramp(local, 0, Math.max(1, span - 20)) : ramp(local, 24, 118)*.31} focus={focus}/>;
    zoom = .887 + (follow ? .015 : -.022) * moment;
  } else if (cue.shot === 'record') {
    graphic = <PlotRecord arrivals={[20, 64, 112].map(delay => rise(local, delay, fps))} pan={moment*10}/>;
    zoom = .87 + .032 * moment;
  } else if (cue.shot === 'filter' || cue.shot === 'harvest') {
    const details = cue.shot === 'harvest';
    const first = Math.round(span*.22);
    const second = Math.round(span*.46);
    const pointerX = interpolate(local, [17, first, first + 14, second], [280, 371, 371, 846], {...clamp, easing: Easing.inOut(Easing.cubic)});
    const click = Math.max(0, 1 - Math.min(Math.abs(local - first), Math.abs(local - second)) / 17);
    const status = details ? rise(local, 29, fps) : 0;
    graphic = <>
      <FilterDemo pick={details ? [1, 1] : [ramp(local, first - 10, first + 10), ramp(local, second - 10, second + 10)]}
        status={status} emphasis={details ? status*(.56 + .27*Math.sin(local/22)) : 0}/>
      {!details && <svg className="filter-cursor" style={{left: pointerX, top: 162, opacity: rise(local, 14, fps)*(1-ramp(local, second+27, second+59))}}
        width="53" height="53" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="9" cy="8" r={7 + click*26} fill="none" stroke="var(--primary)" strokeWidth="2" opacity={click*.68}/>
        <path d="M7 4v31l8.5-7.8 6.7 12 6-3.3-6.5-11.7 11.6-1.4z"/>
      </svg>}
    </>;
    zoom = details ? .879 + .022 * ramp(local, 19, 125) : .867 + .027*moment;
    y -= details ? ramp(local, 20, 140)*13 : 0;
  } else if (!isEnd) {
    const resolved = cue.shot === 'not-sale';
    const stops = [.25, .41, .65].map(p => Math.round(span*p));
    graphic = <RequestForm arrivals={resolved ? [1, 1, 1] : stops.map(delay => rise(local, delay, fps))}
      active={resolved ? -1 : stops.reduce((a, stop, i) => local >= stop - 10 ? i : a, -1)} summary={resolved ? rise(local, 63, fps) : 0}/>;
    zoom = resolved ? .88 - .021 * moment : .855 + .028 * moment;
  }

  return <Canvas mode="reel" theme={shot.theme}>
    {audio && <Html5Audio src={staticFile('njombe/narration.wav')}/>}
    <FieldRows style={{transform: `translate(${18*Math.sin(frame/172)}px, ${-moment*21}px)`}}/>
    {isEnd ? <>
      <div className="reel-title reel-cta-title" style={{transform: `translateY(${lift}px)`}}>
        <Brand/>
        <h1>Comment<br/><em className="keyword">{project.keyword}</em></h1>
        <div className="comment-tail"><Icon name="comment" size={43}/><span>Nikutumie link ya demo.</span></div>
      </div>
      <div className="reel-cta-art" style={{transform: `translateY(${(1-rise(local, 22, fps))*35}px)`}}>
        <div><span className="mono">BUILT BY ALTRAWARE</span><strong>Software kwa<br/>biashara za kilimo.</strong></div>
        <Avocados style={{transform: `translateY(${-moment*17}px) rotate(${moment*4}deg)`}}/>
        <FlowBand compact/>
      </div>
    </> : <>
      <div className="reel-title" style={{transform: `translateY(${lift}px)`, opacity: .45 + .55 * enter}}>
        <div className="mono eyebrow">{shot.label}</div>
        <h1 className={cue.shot === 'hook' ? 'hook-head' : undefined}>{shot.title[0]}<br/><em>{shot.title[1]}</em></h1>
      </div>
      <div className="reel-gfx" style={{transform: `translateY(${y}px) scale(${zoom})`, opacity: .36 + .64*enter}}>{graphic}</div>
    </>}
    {showCaption && <div className="reel-caption">{cue.lines.map((text, i) => <span key={i}>{text}</span>)}</div>}
  </Canvas>;
}
