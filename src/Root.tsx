import React from 'react';
import {Composition, AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from './lib';
import {Full,TOTAL} from './clip/Full';
import {PROJECT} from './project.config';

const FullClip: React.FC = () => {
  const f=useCurrentFrame();
  return (<AbsoluteFill><Full t={f/FPS}/><Audio src={staticFile(PROJECT.audio)}/></AbsoluteFill>);
};
// Composition is 1280x720; render the final with --scale=3 (4K) or --scale=1.5 (1080p).
export const Root: React.FC = () => (<Composition id="Full" component={FullClip} durationInFrames={Math.ceil(TOTAL*FPS)} fps={FPS} width={1280} height={720}/>);
