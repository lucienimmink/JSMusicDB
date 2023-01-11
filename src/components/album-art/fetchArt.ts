import { config as albumConfig } from './provider/album/config';
import { config as artistConfig } from './provider/artist/config';
import { getMBID, getMetaInfo } from './provider/metainfo';
import { populate } from './provider/populate';

const fetchArtForArtist = async (artist: string) => {
  const album = '';
  const json = await getMetaInfo({ artist, album });
  let {
    artist: { mbid },
  } = json;
  if (!mbid) {
    mbid = await getMBID(artist);
  }
  const id = { mbid, artist };
  return await Promise.any(populate(id, artistConfig));
};
const fetchArtForAlbum = async ({
  artist,
  album,
}: {
  artist: string;
  album: string;
}) => {
  const json = await getMetaInfo({ artist, album });
  const {
    album: { mbid },
  } = json;
  const id = { artist, album, mbid };
  return await Promise.any(populate(id, albumConfig));
};

export { fetchArtForArtist, fetchArtForAlbum };
