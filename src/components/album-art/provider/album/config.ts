import { fetchArt as lastfm } from './lastfm';
import { fetchArt as mp3stream } from './../mp3stream';

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
