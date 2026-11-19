import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Carousel} from './Carousel';
import {Reel, type ReelProps} from './Reel';
import script from '../voice-cues.json';
import project from '../project.json';
import './styles.css';

const defaults: ReelProps = {
  audio: false,
  cues: script.map((cue, i) => ({...cue, start: 180 * i + 10, end: 180 * (i + 1) - 4})),
  durationInFrames: 1620,
};

function Root() {
  return React.createElement(React.Fragment, null,
    React.createElement(Composition, {id: 'NjombeCarousel', component: Carousel, width: 1080, height: 1350,
      fps: 60, durationInFrames: project.slideFiles.length}),
    React.createElement(Composition<ReelProps>, {id: 'NjombeReel', component: Reel, width: 1080, height: 1920,
      fps: 60, durationInFrames: defaults.durationInFrames, defaultProps: defaults,
      calculateMetadata: ({props}) => ({durationInFrames: props.durationInFrames})}));
}

registerRoot(Root);
