import { CacheExpiration } from 'workbox-expiration';

import { sleep } from '../../../../utils/fetch';
import {
  getJwt,
  useCorsProxy,
  getServer,
} from '../../../../utils/node-mp3stream';
import { SLEEPTIMER } from '../../album-art';

const fetchArt = async ({
  artist,
  album,
}: {
  artist: string;
  album: string;
}) => {
  const jwt: any = await getJwt();
  const server: any = await getServer();
  const remote = `https://api.deezer.com/search/album?q=${encodeURIComponent(artist)} - ${encodeURIComponent(album)}`;
  const response = await useCorsProxy(server, jwt, remote);
  if (response.status === 200) {
    const json = await response.json();
    const { data, error } = json;
    if (data) {
      return data[0].cover_xl;
    }
    if (error.code === 4) {
      new CacheExpiration('shortlived').expireEntries();
      await sleep(SLEEPTIMER);
      return await fetchArt({ artist, album });
    }
  }
  throw Error('no art found in provider deezer');
};

export { fetchArt };
