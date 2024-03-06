import { fetchWithTimeout } from '../../../../utils/fetch';

const fetchArt = async (mbid: string) => {
  if (!mbid) throw Error('no mbid');
  const response = await fetchWithTimeout(
    `https://coverartarchive.org/release/${mbid}/`,
    { timeout: 10000 },
  );
  if (response.status === 200) {
    const json = await response.json();
    const { images } = json;
    const front = images.filter((image: any) => image.types.includes('Front'));
    return front[0].thumbnails['500'];
  }
  throw Error('no art found in provider audiodb');
};

export { fetchArt };
