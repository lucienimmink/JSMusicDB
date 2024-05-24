import { fetchArt as mp3stream } from '../mp3stream';
import { fetchArt as deezer } from './deezer';
import { fetchArt as fanart } from './fanart';

const config = [
  {
    provider: fanart,
    key: 'mbid',
  },
  {
    provider: mp3stream,
    key: 'mbid',
  },
  {
    provider: deezer,
    key: 'artist',
  },
];

export { config };
