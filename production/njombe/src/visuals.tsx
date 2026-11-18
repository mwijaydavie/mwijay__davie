import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import project from '../project.json';
import {Avocados} from './illustrations';

export const assets = {
  harvest: staticFile('njombe/harvest.jpg'),
  homepage: staticFile('njombe/homepage.jpg'),
  mark: staticFile('njombe/mark.png'),
};

const tokens = {
  '--primary': project.palette.primary, '--gold': project.palette.gold,
  '--white': project.palette.white, '--forest': project.palette.ink, '--paper': project.palette.paper,
} as React.CSSProperties;

export function Canvas({mode, theme, children, extra = ''}: {mode: 'carousel' | 'reel'; theme: 'light' | 'field'; children: React.ReactNode; extra?: string}) {
  return <AbsoluteFill className={`canvas ${mode} ${theme} ${extra}`} style={tokens}>{children}</AbsoluteFill>;
}

const icons = {
  seed: 'M12 22c0-7.5 1.4-13.6 8-17 M12 15C5 16 2.3 10.3 3 6c6.1-.5 10.2 2.6 9 9Zm2-4c-.2-5.2 3.4-8.6 7.8-8.5.9 5.2-2.6 8.9-7.8 8.5Z',
  crate: 'M3 8h18v12H3z M3 12h18 M3 16h18 M8 8c-2.5-4 2-6 4-2 2-4 6.5-2 4 2',
  pin: 'M12 22s7-6 7-13A7 7 0 1 0 5 9c0 7 7 13 7 13Z M12 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z',
  calendar: 'M4 5h16v15H4z M8 3v4 M16 3v4 M4 10h16 M8 15h3 M14 15h2',
  record: 'M6 3h9l4 4v14H6V3z M14.5 3.5V8H19 M9 12h7 M9 16h7',
  search: 'M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z M16 16l5 5',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4.5 21c0-4.1 3.4-6.5 7.5-6.5s7.5 2.4 7.5 6.5',
  send: 'M3 11.5 21 3l-4 18-5.4-6.1L3 11.5Z M11.6 14.9 21 3',
  check: 'm5 12 4.5 4.5L19 7',
  comment: 'M3.5 5h17v12h-9l-4.5 3.5V17H3.5z M7.5 10.8h9',
  arrow: 'M4 12h15 M13 6l6 6-6 6',
} as const;
type IconName = keyof typeof icons;

export function Icon({name, size = 42}: {name: IconName; size?: number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={icons[name]} stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function Brand() {
  return <div className="brand-lockup">
    <span className="mark"><Img src={assets.mark} alt=""/></span>
    <span>{project.builder}</span>
  </div>;
}

export function FlowBand({compact = false}: {compact?: boolean}) {
  const steps: [IconName, string][] = [['record', 'REKODI'], ['search', 'UTAFUTAJI'], ['send', 'OMBI']];
  return <div className={`flow-band mono${compact ? ' flow-compact' : ''}`}>
    {steps.map(([icon, title], i) => <React.Fragment key={title}>
      {i > 0 && <span className="flow-arrow"><Icon name="arrow" size={26}/></span>}
      <span><Icon name={icon} size={compact ? 27 : 33}/>{title}</span>
    </React.Fragment>)}
  </div>;
}

export function AppArtwork({reveal = 1, shift = 0}: {reveal?: number; shift?: number}) {
  return <div className="app-artwork">
    <div className="app-window" style={{transform: `translateY(${(1-reveal)*18}px)`}}>
      <div className="window-bar"><span className="window-dots"><b/><b/><b/></span><span className="mono">AVOCADO FARMERS NJOMBE</span></div>
      <Img className="window-image" src={assets.homepage} alt="Picha ya ukurasa wa Avocado Farmers Njombe"/>
    </div>
    <Avocados style={{transform: `translate(${shift * .5}px, ${shift * -.68}px) rotate(${shift * .18}deg)`}}/>
    <span className="mono ui-tag"><span/>PICHA YA DEMO</span>
  </div>;
}

const fragments: {type: IconName; label: string; value: string; x: number; y: number; w: number; r: number}[] = [
  {type: 'crate', label: 'AINA', value: 'Hass au Fuerte?', x: 5, y: 22, w: 510, r: -2.7},
  {type: 'pin', label: 'WILAYA', value: 'Shamba liko wapi?', x: 397, y: 166, w: 527, r: 2.8},
  {type: 'calendar', label: 'MAVUNO', value: 'Yako tayari lini?', x: 88, y: 312, w: 538, r: -2.5},
];

export function ProblemCards({arrivals = [1, 1, 1], trace = 0, focus = -1}: {arrivals?: number[]; trace?: number; focus?: number}) {
  const d = 'M262 108 C445 81 400 204 568 224 S725 308 494 363 Q397 391 369 375';
  return <div className="problem-graphic">
    <svg className="trace" width="936" height="460" viewBox="0 0 936 460" fill="none" aria-hidden="true">
      <path d={d} stroke="var(--line)" strokeWidth="4" strokeDasharray="9 11"/>
      <path d={d} pathLength="1" stroke="var(--gold)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${trace} 2`}/>
    </svg>
    {fragments.map((item, i) => {
      const p = arrivals[i] ?? 1;
      return <div className={`fragment${focus === i ? ' fragment-focus' : ''}`} key={item.type} style={{left: item.x, top: item.y, width: item.w,
        opacity: p, transform: `translate(${(1-p) * (i % 2 ? 36 : -34)}px, ${(1-p)*28}px) rotate(${item.r*p}deg)`}}>
        <span className="symbol"><Icon name={item.type}/></span>
        <span><span className="mono fragment-label">{item.label}</span><strong>{item.value}</strong></span>
      </div>;
    })}
  </div>;
}

const fields: {icon: IconName; name: string; value: string}[] = [
  {icon: 'crate', name: 'Aina', value: 'Hass'},
  {icon: 'pin', name: 'Wilaya', value: 'Wanging’ombe'},
  {icon: 'calendar', name: 'Hali ya mavuno', value: 'Yako tayari'},
];

export function PlotRecord({arrivals = [1, 1, 1], pan = 0}: {arrivals?: number[]; pan?: number}) {
  return <div className="ui-card plot-record">
    <div className="record-cover">
      <Img src={assets.harvest} alt="" style={{objectPosition: `${50 + pan}% 60%`}}/>
      <div className="record-shade"/>
      <div className="record-heading"><span><Icon name="record" size={40}/>Rekodi ya shamba</span><span className="mono mini-badge">MFANO</span></div>
    </div>
    {fields.map((f, i) => <div className="record-row" key={f.name} style={{opacity: arrivals[i],
      transform: `translateX(${(1-arrivals[i])*28}px)`}}>
      <div><Icon name={f.icon} size={35}/><span>{f.name}</span></div>
      {i === 2 ? <strong className="ready-pill"><span/>{f.value}</strong> : <strong>{f.value}</strong>}
    </div>)}
  </div>;
}

export function FilterDemo({pick = [1, 1], status = 1, emphasis = 0}: {pick?: number[]; status?: number; emphasis?: number}) {
  return <div className="ui-card filter-demo">
    <div className="panel-head"><Icon name="search"/><strong>Tafuta mavuno</strong><span className="mono mini-badge">MFANO WA UI</span></div>
    <div className="filter-options">
      {[['AINA', 'Hass', 'Aina zote'], ['WILAYA', 'Wanging’ombe', 'Wilaya zote']].map(([name,value,blank], i) => (
        <div className={`filter-option${pick[i] > 0.52 ? ' selected' : ''}`} key={name}>
          <span className="mono">{name}</span>
          <strong>{pick[i] > 0.52 ? value : blank}</strong>
          <span className="caret" aria-hidden="true">⌄</span>
        </div>
      ))}
    </div>
    <div className="harvest-status" style={{opacity: 0.28 + 0.72 * status, transform: `translateY(${(1-status)*12}px)`,
      boxShadow: `0 0 0 ${emphasis * 5}px rgba(217,176,0,${emphasis * .46})`}}>
      <span className="symbol"><Icon name="calendar" size={38}/></span>
      <span><span className="mono">HALI YA MAVUNO</span><strong>Yako tayari</strong></span>
      <span className="status-dot"/>
    </div>
  </div>;
}

const requestFields = [
  {label: 'KILO ZINAZOHITAJIKA', value: '250 kg'},
  {label: 'BEI YA OFA KWA KILO', value: 'TZS 2,000/kg'},
  {label: 'MJI WA KUCHUKUA AU KUPOKEA', value: 'Makambako'},
];

export function RequestForm({arrivals = [1, 1, 1], active = -1, summary = 0}: {arrivals?: number[]; active?: number; summary?: number}) {
  return <div className="ui-card request-form">
    <div className="panel-head"><Icon name="send"/><strong>Ombi la kununua</strong><span className="mono mini-badge">MFANO</span></div>
    <div className="buyer-gate"><Icon name="person" size={30}/>Ingia kwenye akaunti ya mnunuzi</div>
    <div className="request-fields">
      {requestFields.map((field, i) => <div className={`request-field${active === i ? ' entering' : ''}`} key={field.label}>
        <span className="mono">{field.label}</span>
        <strong style={{opacity: arrivals[i], transform: `translateX(${(1-arrivals[i])*15}px)`}}>{field.value}</strong>
      </div>)}
    </div>
    <div className="request-disclaimer"><span className="mono">MFANO TU · HALIJATUMWA</span></div>
    {summary > 0 && <div className="sale-distinction" style={{transform: `translateY(${(1-summary)*15}px)`, opacity: summary}}>
      Ombi ≠ mauzo
    </div>}
  </div>;
}
