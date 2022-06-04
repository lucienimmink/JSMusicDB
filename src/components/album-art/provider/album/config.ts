import { fetchArt as mp3stream } from './../mp3stream';
import { fetchArt as lastfm } from './lastfm';

const config = [
  {
    provider: lastfm,
  },
  {
    provider: mp3stream,
    key: 'mbid',
  },
];

export { config };
