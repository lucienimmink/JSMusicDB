import { musicdbcore } from 'musicdbcore';
import { getMusicDB } from '../../utils/musicdb';
import { getServer } from '../../utils/node-mp3stream';
import { setLastParsed } from '../../utils/settings';

const mdb = new musicdbcore();

const musicdb = new Promise((resolve, reject) => {
  getServer().then((server: any) => {
    if (server) {
      fetch(`${server}/data/node-music.json`)
        .then((response: Response) => response.json())
        .then((data: unknown) => {
          if (data) {
            mdb.parseSourceJson(data, true);
            setLastParsed(new Date());
            resolve(mdb);
          }
          reject('music data file is empty');
        })
        .catch(() => {
          reject('music data file not found');
        });
    } else {
      reject('no base-server given, cannot get collection');
    }
  });
});

export const refresh = async () => {
  const server: any = await getServer();
  if (server) {
    await fetch(`${server}/data/node-music.json`);
  }
};

export const update = async () => {
  const musicdb = await getMusicDB();
  if (musicdb) {
    mdb.parseSourceJson(musicdb, true);
    await setLastParsed(new Date());
  }
};

export default musicdb;
