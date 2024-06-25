import { sleep } from '../../../../utils/fetch';
import {
  getJwt,
  useCorsProxy,
  getServer,
} from '../../../../utils/node-mp3stream';

const fetchArt = async (artist: string) => {
  const jwt: any = await getJwt();
  const server: any = await getServer();
  const response = await useCorsProxy(
    server,
    jwt,
    `https://api.deezer.com/search/artist?q=${encodeURIComponent(artist)}`,
  );
  if (response.status === 200) {
    const json = await response.json();
    const { data, error } = json;
    if (data) {
      const url = data[0].picture_xl;
      if (!url.includes('/artist//')) return url;
    }
    if (error.code === 4) {
      sleep(100);
      return await fetchArt(artist);
    }
  }
  throw Error('no art found in provider deezer');
};

export { fetchArt };
