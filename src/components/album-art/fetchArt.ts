import { getMetaInfo } from "./provider/metainfo";
import { populate } from "./provider/populate";
import { config as albumConfig } from "./provider/album/config";
import { config as artistConfig } from "./provider/artist/config";
import { promiseAny } from "./utils/promise-any";

const fetchArtForArtist = async (artist: string) => {
  const album = '';
  const json = await getMetaInfo({ artist, album });
  const {
    artist: { mbid }
  } = json;
  const id = { mbid, artist };
  return await promiseAny(populate(id, artistConfig));
};
const fetchArtForAlbum = async ({ artist, album }: { artist: string, album: string }) => {
  const id = { artist, album };
  return await promiseAny(populate(id, albumConfig));
};

export { fetchArtForArtist, fetchArtForAlbum };
