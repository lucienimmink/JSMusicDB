import { fetchArt as mp3stream } from '../mp3stream';
import { fetchArt as audiodb } from './audiodb';
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
    provider: audiodb,
    key: 'artist',
  },
];

export { config };
