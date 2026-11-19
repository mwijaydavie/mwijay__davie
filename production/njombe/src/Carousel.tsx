import React from 'react';
import {useCurrentFrame} from 'remotion';
import project from '../project.json';
import {AppArtwork, Brand, Canvas, FilterDemo, FlowBand, Icon, PlotRecord, ProblemCards, RequestForm} from './visuals';
import {Avocados, FieldRows} from './illustrations';

const slides = [
  {theme: 'light', label: 'CHANGAMOTO YA BIASHARA', title: ['Chat si rekodi', 'ya mavuno.'],
    body: 'Taarifa zikitawanyika kwenye chat, mnunuzi anauliza tena kuhusu aina, eneo na muda wa kuvuna kabla ya kutoa ofa.'},
  {theme: 'light', label: '01 · REKODI YA SHAMBA', title: ['Taarifa pamoja,', 'kwenye rekodi moja.'],
    body: 'Kwenye demo yetu, aina, wilaya na hali ya mavuno vinaonekana pamoja kwenye rekodi ya shamba.'},
  {theme: 'field', label: '02 · UTAFUTAJI WA MAVUNO', title: ['Tafuta mavuno', 'yanayokufaa.'],
    body: 'Chuja kwa aina na wilaya. Kisha angalia hali ya mavuno kabla ya kuandaa ombi.'},
  {theme: 'light', label: '03 · OMBI KWA MKULIMA', title: ['Ombi lenye', 'maelezo.'],
    body: 'Baada ya kuingia, mnunuzi anataja kilo, bei ya ofa na mji wa kuchukulia au kuletewa.'},
] as const;

function Chrome({number}: {number: number}) {
  return <>
    <header className="carousel-header"><Brand/><span className="mono page-id">0{number} / 06</span></header>
    <footer className="carousel-footer mono"><span>AVOCADO FARMERS NJOMBE</span><span><Icon name="seed" size={27}/>DEMO YA SOFTWARE</span></footer>
  </>;
}

export function Carousel() {
  const frame = useCurrentFrame();
  if (frame === 0) {
    return <Canvas mode="carousel" theme="field" extra="cover-slide">
      <FieldRows/>
      <Chrome number={1}/>
      <div className="carousel-copy">
        <div className="mono eyebrow"><Icon name="seed" size={32}/>SOFTWARE DEMO · NJOMBE</div>
        <h1>Software ya biashara<br/><em>ya parachichi.</em></h1>
        <p>Altraware tumejenga demo ya kupanga taarifa za mavuno na maombi ya wanunuzi.</p>
      </div>
      <div className="cover-art"><AppArtwork/></div>
      <div className="cover-flow"><FlowBand/></div>
    </Canvas>;
  }
  if (frame === 5) {
    return <Canvas mode="carousel" theme="field" extra="cta-slide">
      <FieldRows/>
      <Chrome number={6}/>
      <div className="carousel-copy">
        <div className="mono eyebrow"><Icon name="seed" size={32}/>UNATAKA KUIONA SOFTWARE?</div>
        <h1>Comment<br/><em className="keyword">{project.keyword}</em></h1>
        <div className="comment-tail"><Icon name="comment" size={53}/><span>Nikutumie link ya demo.</span></div>
      </div>
      <div className="cta-art">
        <div className="cta-art-copy"><span className="mono">BUILT BY ALTRAWARE</span><strong>Software kwa<br/>biashara za kilimo.</strong></div>
        <Avocados/>
      </div>
      <div className="cover-flow"><FlowBand/></div>
    </Canvas>;
  }
  const slide = slides[frame - 1];
  return <Canvas mode="carousel" theme={slide.theme} extra={`story-slide slide-${frame + 1}`}>
    <FieldRows/>
    <Chrome number={frame + 1}/>
    <div className="carousel-copy">
      <div className="mono eyebrow">{slide.label}</div>
      <h1>{slide.title[0]}<br/><em>{slide.title[1]}</em></h1>
      <p>{slide.body}</p>
    </div>
    <div className="carousel-visual">
      {frame === 1 ? <ProblemCards trace={.64}/> : frame === 2 ? <PlotRecord/> : frame === 3 ? <FilterDemo/> : <RequestForm/>}
    </div>
    {frame === 4 && <div className="request-note">Ombi linaanzisha mazungumzo. Halithibitishi mauzo.</div>}
  </Canvas>;
}
