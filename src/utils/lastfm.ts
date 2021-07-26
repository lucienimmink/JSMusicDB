import { get, set } from 'idb-keyval';
import { Encryption } from './encryption';
import { getScrobbleCache, setScrobbleCache, getSettings } from './settings';

const APIKEY = '956c1818ded606576d6941de5ff793a5';
const SECRET = '4d183e73f7578dee78557665e9be3acc';
const SK = 'sk';
const USERNAME = 'lastfm-username';

const encryption = new Encryption();

// Anonymous methods
export const getSimilairArtists = (artist: any) => {
  const params = new URLSearchParams();
  params.set('api_key', APIKEY);
  params.set('format', 'json');
  params.set('limit', '20');
  params.set('autocorrect', '1');
  params.set('method', 'artist.getSimilar');
  params.set('artist', artist);
  return fetch(`https://ws.audioscrobbler.com/2.0/?${params.toString()}`).then(
    response =>
      response.json().catch(() => {
        return {};
      })
  );
};

export const getLovedTracks = (user: string) => {
  const params = new URLSearchParams();
  params.set('api_key', APIKEY);
  params.set('format', 'json');
  params.set('limit', '1000');
  params.set('method', 'user.getlovedtracks');
  params.set('user', user);
  return fetch(`https://ws.audioscrobbler.com/2.0/?${params.toString()}`).then(
    response =>
      response.json().catch(() => {
        return {};
      })
  );
};

export const getTrackInfo = (track: any, user: string) => {
  const params = new URLSearchParams();
  params.set('method', 'track.getInfo');
  params.set(
    'artist',
    track.album.artist.albumArtist || track.album.artist.name
  );
  params.set('album', track.album.name);
  params.set('track', track.title);
  params.set('api_key', APIKEY);
  params.set('format', 'json');
  params.set('user', user);
  return fetch(`https://ws.audioscrobbler.com/2.0/?${params.toString()}`).then(
    response =>
      response.json().catch(() => {
        return {};
      })
  );
};

export const getTopArtists = (user: string) => {
  const params = new URLSearchParams();
  params.set('api_key', APIKEY);
  params.set('format', 'json');
  params.set('limit', '50');
  params.set('method', 'user.gettopartists');
  params.set('period', '1month');
  params.set('user', user);
  return fetch(`https://ws.audioscrobbler.com/2.0/?${params.toString()}`).then(
    response =>
      response.json().catch(() => {
        return {};
      })
  );
};
export const getRecentlyListened = (user: string) => {
  const params = new URLSearchParams();
  params.set('api_key', APIKEY);
  params.set('format', 'json');
  params.set('limit', '6');
  params.set('method', 'user.getrecenttracks');
  params.set('user', user);
  return fetch(`https://ws.audioscrobbler.com/2.0/?${params.toString()}`).then(
    response =>
      response.json().catch(() => {
        return {};
      })
  );
};
export const getTopTracks = (user: string, max = 100, period = '3month') => {
  const params = new URLSearchParams();
  params.set('api_key', APIKEY);
  params.set('format', 'json');
  params.set('period', period);
  params.set('limit', max.toString());
  params.set('method', 'user.gettoptracks');
  params.set('user', user);
  return fetch(`https://ws.audioscrobbler.com/2.0/?${params.toString()}`).then(
    response =>
      response.json().catch(() => {
        return {};
      })
  );
};
export const getSK = () => {
  return get(SK);
};
export const setSk = (sk: string) => {
  return set(SK, sk);
};
export const getLastFMUserName = () => {
  return get(USERNAME);
};
export const setLastFMUserName = (username: string) => {
  return set(USERNAME, username);
};

// protected method
export const toggleLoved = async (track: any, isLoved = true) => {
  const sk: any = await get(SK);
  if (!sk) {
    throw Error('No sign key');
  }
  const method = isLoved ? 'track.love' : 'track.unlove';
  const params = new URLSearchParams();
  params.set('method', method);
  params.set('api_key', APIKEY);
  params.set(
    'api_sig',
    _signTrack(
      track.album.artist.albumArtist || track.album.artist.name,
      track.album.name,
      track.title,
      null,
      sk,
      method
    )
  );
  params.set(
    'artist',
    track.album.artist.albumArtist || track.album.artist.name
  );
  params.set('album', track.album.name);
  params.set('track', track.title);
  params.set('sk', sk);
  return fetch(`https://ws.audioscrobbler.com/2.0/`, {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
};
export const authenticate = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const params = new URLSearchParams();
  params.set('api_key', APIKEY);
  params.set('api_sig', _signAuthentication(username, password));
  params.set('format', 'json');
  params.set('username', username);
  params.set('password', password);
  return fetch(
    `https://ws.audioscrobbler.com/2.0/?method=auth.getMobileSession`,
    {
      method: 'post',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: params,
    }
  ).then(response => response.json());
};
export const announceNowPlaying = async (track: any) => {
  const username: any = await get(USERNAME);
  if (!username || username === 'mdb-skipped') {
    return;
  }
  const now = new Date();
  const timestamp =
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes() + now.getTimezoneOffset(),
      now.getSeconds()
    ) / 1000;
  const sk: any = await get(SK);
  if (!sk) {
    throw Error('No sign key');
  }
  const params = new URLSearchParams();
  params.set('method', 'track.updateNowPlaying');
  params.set('api_key', APIKEY);
  params.set(
    'api_sig',
    _signTrack(
      track.trackArtist,
      track.album.name,
      track.title,
      timestamp,
      sk,
      'track.updateNowPlaying'
    )
  );
  params.set('artist', track.trackArtist);
  params.set('album', track.album.name);
  params.set('track', track.title);
  params.set('timestamp', timestamp.toString());
  params.set('sk', sk);
  return fetch(`https://ws.audioscrobbler.com/2.0/`, {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
};
export const scrobbleTrack = async (track: any) => {
  const username: any = await get(USERNAME);
  if (!username || username === 'mdb-skipped') {
    return;
  }
  const now = new Date();
  const timestamp =
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes() + now.getTimezoneOffset(),
      now.getSeconds()
    ) / 1000;

  const settings: any = await getSettings();
  const manualScrobble = settings?.manualScrobble;

  // offline
  if (manualScrobble) {
    let scrobbleList: any = await getScrobbleCache();
    if (!scrobbleList) {
      scrobbleList = [];
    }
    scrobbleList.unshift({
      artist: track.trackArtist,
      album: track.album.name,
      track: track.title,
      timestamp: timestamp.toString(),
    });
    return await setScrobbleCache(scrobbleList);
  }
  // online
  const sk: any = await get(SK);
  if (!sk) {
    throw Error('No sign key');
  }
  const params = new URLSearchParams();
  params.set('method', 'track.scrobble');
  params.set('api_key', APIKEY);
  params.set(
    'api_sig',
    _signTrack(
      track.trackArtist,
      track.album.name,
      track.title,
      timestamp,
      sk,
      'track.scrobble'
    )
  );
  params.set('artist', track.trackArtist);
  params.set('album', track.album.name);
  params.set('track', track.title);
  params.set('timestamp', timestamp.toString());
  params.set('sk', sk);
  return fetch(`https://ws.audioscrobbler.com/2.0/`, {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: params,
  }).then(response => response.json());
};

// private methods
const _signAuthentication = (user: string, password: string): string => {
  return encryption.hex_md5(
    `api_key${APIKEY}methodauth.getMobileSessionpassword${password}username${user}${SECRET}`
  );
};

const _signTrack = (
  artist: string,
  album: string,
  track: string,
  timestamp: any,
  sk: string,
  method: string
): string => {
  if (timestamp) {
    return encryption.hex_md5(
      `album${album}api_key${APIKEY}artist${artist}method${method}sk${sk}timestamp${timestamp}track${track}${SECRET}`
    );
  } else {
    return encryption.hex_md5(
      `album${album}api_key${APIKEY}artist${artist}method${method}sk${sk}track${track}${SECRET}`
    );
  }
};
