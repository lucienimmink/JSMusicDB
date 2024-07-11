import { sleep } from '../../../../utils/fetch';
import {
  getJwt,
  useCorsProxy,
  getServer,
} from '../../../../utils/node-mp3stream';
import { SLEEPTIMER } from '../../album-art';

const fetchArt = async (artist: string) => {
  const jwt: any = await getJwt();
  const server: any = await getServer();
  const remote = `https://api.deezer.com/search/artist?q=artist:"${encodeURIComponent(artist)}"`;
  const response = await useCorsProxy(server, jwt, remote);
  if (response.status === 200) {
    const json = await response.json();
    const { data, error, total } = json;
    if (data && total > 0) {
      const url = data[0].picture_xl;
      if (!url.includes('/artist//')) return url;
    }
    if (error.code === 4) {
      const cache = await caches.open('shortlived');
      await cache.delete(`${server}/proxy?jwt=${jwt}&remote=${remote}`);
      await sleep(SLEEPTIMER);
      return await fetchArt(artist);
    }
  }
  throw Error('no art found in provider deezer');
};

export { fetchArt };
