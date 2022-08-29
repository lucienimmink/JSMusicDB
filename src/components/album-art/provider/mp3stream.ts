import { fetchWithTimeout } from '../../../utils/fetch';
import { getServer } from '../../../utils/node-mp3stream';

const fetchArt = async (mbid: string) => {
  const server = await getServer();
  if (!mbid) {
    throw Error('Cannot search without a proper mbid');
  }
  const response = await fetchWithTimeout(`${server}/image?mbid=${mbid}`);
  if (response.status === 200) {
    const json = await response.json();
    const { url } = json;
    if (url) {
      return `https:${url}`;
    }
  }
  throw Error('no art found in provider mp3stream');
};

export { fetchArt };
