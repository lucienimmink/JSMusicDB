import { fetchWithTimeout } from '../../../../utils/fetch';

const fetchArt = async (artist: string) => {
  const response = await fetchWithTimeout(
    `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(
      artist,
    )}`,
    { timeout: 10000 },
  );
  if (response.status === 200) {
    const json = await response.json();
    const { artists } = json;
    if (artists) {
      return artists[0].strArtistThumb || artists[0].strArtistFanart;
    }
  }
  throw Error('no art found in provider audiodb');
};

export { fetchArt };
