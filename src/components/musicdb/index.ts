import { musicdbcore } from 'musicdbcore';
import { getServer } from '../../utils/node-mp3stream';
import { setLastParsed } from '../../utils/settings';

const mdb = new musicdbcore();

const musicdb = new Promise((resolve, reject) => {
  getServer().then((server: any) => {
    if (server) {
      fetch(`${server}/data/node-music.json`)
        .then((response: Response) => response.json())
        .then((data: unknown) => {
          mdb.parseSourceJson(data, true);
          setLastParsed(new Date());
          resolve(mdb);
        });
    } else {
      reject('no base-server given, cannot get collection');
    }
  });
});

export const refresh = async (data: any = null) => {
  if (data) {
    console.log('received data', data.length);
    mdb.parseSourceJson(data, true);
    await setLastParsed(new Date());
  }
  const server: any = await getServer();
  if (server) {
    const response: any = await fetch(`${server}/data/node-music.json?fresh`);
    const data: any = await response.json();
    mdb.parseSourceJson(data, true);
    await setLastParsed(new Date());
  }
};

export default musicdb;
