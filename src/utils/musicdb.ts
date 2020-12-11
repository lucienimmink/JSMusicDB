import { get, set } from 'idb-keyval';

export const MUSICDB = 'musicdb';
export const REFRESH = 'refresh';

export const setMusicDB = async (musicdb: any) => {
  return await set(MUSICDB, musicdb);
};
export const getMusicDB = async () => {
  return await get(MUSICDB);
};

export const DUMMY_TRACK = {
  image: [null, { '#text': null }],
  album: { '#text': 'dummy' },
  artist: { '#text': 'dummy' },
  name: 'dummy',
  date: { uts: new Date().getTime() / 1000 },
  dummy: true,
};
