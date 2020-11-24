import { getMetaInfo } from "./../metainfo";

const fetchArt = async ({ artist, album } : { artist: string, album: string }) => {
  const json = await getMetaInfo({ artist, album });
  const {
    album: { image }
  } = json;
  return image[image.length - 1]["#text"];
};

export { fetchArt };
