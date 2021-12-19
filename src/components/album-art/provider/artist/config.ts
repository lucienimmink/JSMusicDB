import { fetchArt as fanart } from './fanart';
import { fetchArt as audiodb } from './audiodb';
import { fetchArt as mp3stream } from '../mp3stream';

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
