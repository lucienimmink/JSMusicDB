import { fetchArt as mp3stream } from './../mp3stream';
import { fetchArt as lastfm } from './lastfm';
import { fetchArt as coverartarchive } from './coverartarchive';

const config = [
  {
    provider: lastfm,
  },
  {
    provider: mp3stream,
    key: 'mbid',
  },
  {
    provider: coverartarchive,
    key: 'mbid',
  },
];

export { config };
