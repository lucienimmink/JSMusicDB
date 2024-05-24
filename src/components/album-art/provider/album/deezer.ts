import { fetchWithTimeout } from '../../../../utils/fetch';

const fetchArt = async ({
  artist,
  album,
}: {
  artist: string;
  album: string;
}) => {
  const response = await fetchWithTimeout(
    `https://api.deezer.com/search/album?q=${encodeURIComponent(artist)} - ${encodeURIComponent(album)}`,
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
