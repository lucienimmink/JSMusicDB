import { config as albumConfig } from './provider/album/config';
import { config as artistConfig } from './provider/artist/config';
import { getMBID, getMetaInfo } from './provider/metainfo';
import { populate } from './provider/populate';

const fetchArtForArtist = async (artist: string, id: string) => {
  const album = '';
  let iid;
  if (id) {
    iid = { mbid: id, artist };
  } else {
    try {
      const json = await getMetaInfo({ artist, album });
      let {
        artist: { mbid },
      } = json;
      if (!mbid) {
        mbid = await getMBID(artist);
      }
      iid = { mbid, artist };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return '';
    }
  }
  return await Promise.any(populate(iid, artistConfig));
};
const fetchArtForAlbum = async ({
  artist,
  album,
  id,
}: {
  artist: string;
  album: string;
  id: string;
}) => {
  let iid;
  if (id) {
    iid = { artist, album, mbid: id };
  } else {
    try {
      const json = await getMetaInfo({ artist, album });
      const {
        album: { mbid },
      } = json;
      iid = { artist, album, mbid };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return '';
    }
  }
  return await Promise.any(populate(iid, albumConfig));
};

export { fetchArtForAlbum, fetchArtForArtist };
