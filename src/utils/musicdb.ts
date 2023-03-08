import { get, set } from 'idb-keyval';

export const MUSICDB = 'musicdb';
export const RECENTLYPLAYED = 'recentlyplayed';
export const REFRESH = 'refresh';

export const setMusicDB = async (musicdb: any) => {
  return set(MUSICDB, musicdb);
};
export const getMusicDB = async () => {
  return get(MUSICDB);
};

export const setRecentlyPlayed = async (recentlyPlayed: any) => {
  // only store if the incoming data is correct
  if (recentlyPlayed.length > 0) return set(RECENTLYPLAYED, recentlyPlayed);
};
export const getRecentlyPlayed = async () => {
  return get(RECENTLYPLAYED);
};

export const DUMMY_TRACK = {
  image: [
    { '#text': null },
    { '#text': null },
    { '#text': null },
    { '#text': null },
  ],
  album: { '#text': 'dummy' },
  artist: { '#text': 'dummy' },
  name: 'dummy',
  date: { uts: new Date().getTime() / 1000 },
  dummy: true,
};
