/**
 * AudioPlayerModule.js
 * JavaScript bridge to the native Android AudioPlayerModule
 */

import {NativeModules} from 'react-native';

const {AudioPlayerModule} = NativeModules;

export default {
  play: (filePath: string) => AudioPlayerModule.play(filePath),
  pause: () => AudioPlayerModule.pause(),
  stop: () => AudioPlayerModule.stop(),
  restart: (filePath: string) => AudioPlayerModule.restart(filePath),
  getCurrentPosition: () => AudioPlayerModule.getCurrentPosition(),
  getDuration: () => AudioPlayerModule.getDuration(),
  isPlaying: () => AudioPlayerModule.isPlaying(),
  seekTo: (position: number) => AudioPlayerModule.seekTo(position),
};
