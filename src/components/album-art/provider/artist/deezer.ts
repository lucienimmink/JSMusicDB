import {
  getJwt,
  getCorsProxy,
  getServer,
} from '../../../../utils/node-mp3stream';

const fetchArt = async (artist: string) => {
  const jwt: any = await getJwt();
  const server: any = await getServer();
  const response = await getCorsProxy(
    server,
    jwt,
    `https://api.deezer.com/search/artist?q=${encodeURIComponent(artist)}`,
  );
  if (response.status === 200) {
    const json = await response.json();
    const { data } = json;
    if (data) {
      return data[0].picture_xl;
    }
  }
  throw Error('no art found in provider deezer');
};

export { fetchArt };
