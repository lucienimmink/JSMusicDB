const getMetaInfo = async ({ artist, album } : { artist: string; album: string }) => {
  const searchParams = new URLSearchParams();
  searchParams.set("api_key", "956c1818ded606576d6941de5ff793a5");
  searchParams.set("artist", artist);
  searchParams.set("format", "json");
  searchParams.set("autoCorrect", "true");
  if (album) {
    searchParams.set("method", "album.getinfo");
    searchParams.set("album", album);
  } else {
    searchParams.set("method", "artist.getinfo");
  }
  const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${searchParams}`);
  const json = await response.json();
  return json;
};

export { getMetaInfo };
