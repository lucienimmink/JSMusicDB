import { fetchWithTimeout } from '../../../../utils/fetch';

// @ts-ignore
const FANARTAPIKEY = import.meta.env.VITE_FANART_APIKEY!;

const fetchArt = async (mbid: string) => {
  if (!mbid) {
    throw Error('Cannot search without a proper mbid');
  }
  if (!FANARTAPIKEY) throw Error('no art found in provider fanart');
  const response = await fetchWithTimeout(
    `https://webservice.fanart.tv/v3/music/${mbid}?api_key=${FANARTAPIKEY}&format=json`,
    { timeout: 10000 },
  );
  if (response.status === 200) {
    const json = await response.json();
    const { artistthumb } = json;
    if (artistthumb) {
      return artistthumb[0].url;
    }
  }
  throw Error('no art found in provider fanart');
};

export { fetchArt };
