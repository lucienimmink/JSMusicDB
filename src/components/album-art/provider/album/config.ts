import { fetchArt as mp3stream } from './../mp3stream';
import { fetchArt as lastfm } from './lastfm';
import { fetchArt as deezer } from './deezer';
import { fetchArt as coverartarchive } from './coverartarchive';

const config = [
  {
    provider: deezer,
  },
  {
    provider: lastfm,
  },
  {
    provider: coverartarchive,
    key: 'mbid',
  },
  {
    provider: mp3stream,
    key: 'mbid',
  },
];

export { config };
