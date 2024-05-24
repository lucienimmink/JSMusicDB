import { fetchWithTimeout } from '../../../../utils/fetch';

const fetchArt = async (artist: string) => {
  const response = await fetchWithTimeout(
    `https://api.deezer.com/search/artist?q=${encodeURIComponent(artist)}`,
    { timeout: 10000 },
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
