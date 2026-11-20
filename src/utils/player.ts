import { get, set } from 'idb-keyval';
import musicdb from '../components/musicdb';
import { global as EventBus } from './EventBus';
import {
  getLovedTracks,
  getSimilairArtists,
  getTopArtists,
  getTopTracks,
} from './lastfm';

const CURRENT_PLAYLIST = 'current-playlist';
const CURRENT_TIME = 'current-time';
export const START_CURRENT_PLAYLIST = 'start-current-playlist';
export const STOP_PLAYER = 'stop-player';
export const PLAY_PLAYER = 'play-player';
export const PLAY_PLAYER_START = 'play-player-start';
export const PAUSE_PLAYER = 'pause-player';
export const TOGGLE_PLAY_PAUSE_PLAYER = 'toggle-play-pause-player';
export const UPDATE_PLAYER = 'update-player';
export const LOAD_PLAYLIST = 'load-playlist';
export const LOADED_PLAYLIST = 'loaded-playlist';
export const TOGGLE_LOVED = 'toggle-loved';
export const TOGGLE_SHUFFLE = 'toggle-shuffle';
export const TOGGLE_LOVED_UPDATED = 'toggle-loved-updated';
export const TOGGLE_SHUFFLE_UPDATED = 'toggle-shuffle-updated';
export const PREVIOUS_TRACK = 'previous-track';
export const NEXT_TRACK = 'next-track';
export const SET_POSITION = 'set-position';
export const IS_SHUFFLED = 'is-shuffled';
export const CHANGE_TITLE = 'change-title';
export const PLAYER_ERROR = 'player-error';
export const UPDATE_TRACK = 'update-track';
export const NAVIGATE_TO_ALBUM = 'navigate-to-album';
export const NEW_PLAYLIST_LENGTH = 'new-playlist-length';

export const getCurrentPlaylist = () => get(CURRENT_PLAYLIST);
export const setCurrentPlaylist = (playlist: any) =>
  set(CURRENT_PLAYLIST, playlist);

export const startPlaylist = (target: any) => {
  EventBus.emit(START_CURRENT_PLAYLIST, target);
};
export const getNextPlaylist = (playlist: any) => {
  switch (playlist.type) {
    case 'album':
      return _getNewPlaylistForAlbum(playlist);
    case 'random':
      return getNewPlaylistForRandom(playlist);
    case 'random-pref':
      return getNewPlaylistForRandomPref(playlist);
    case 'radio-pref':
      return getNewPlaylistForRadioPref(playlist);
    case 'radio':
      return getNewPlaylistForRadio(playlist);
    case 'loved':
      return getNewPlaylistForLovedTracks(playlist);
    case 'top':
      return getTopTracksForUser(playlist);
    default:
      throw new Error(
        `No implementation to generate a new playlist for type ${playlist.type}`,
      );
  }
};
export const setCurrentTime = (time: number) => {
  return set(CURRENT_TIME, time);
};
export const getCurrentTime = () => {
  return get(CURRENT_TIME);
};
export const setIsShuffled = (state: boolean) => {
  return set(IS_SHUFFLED, state);
};
export const getIsShuffled = () => {
  return get(IS_SHUFFLED);
};
export const getTrackById = async (id: string) => {
  const mdb: any = await musicdb;
  const track = mdb.trackList().find((item: any) => item.id === id);
  if (!track) {
    throw new Error(`Track with id ${id} not found`);
  }
  return track;
};
export const getNewPlaylistForRandom = async (playlist: any) => {
  const mdb: any = await musicdb;
  EventBus.emit(NEW_PLAYLIST_LENGTH, {}, 0);
  const tracks = _shuffle(Object.keys(mdb.tracks))
    .slice(0, playlist.max)
    .map(id => mdb.tracks[id]);

  tracks.forEach((_, index) =>
    EventBus.emit(NEW_PLAYLIST_LENGTH, {}, index + 1),
  );
  return {
    name: `${playlist.max} random tracks`,
    tracks,
    type: 'random',
    max: playlist.max,
  };
};
const _getArtistRotations = async (
  username: string,
  mdb: any,
  highRotationLimit: number,
) => {
  const { topartists } = await getTopArtists(username);
  const highRotation: any[] = [];
  const mediumRotation: any[] = [];

  (topartists?.artist || []).forEach((artist: any, index: number) => {
    const coreArtist = mdb.artists[_getSortName(artist.name)];
    if (!coreArtist) return;
    (index < highRotationLimit ? highRotation : mediumRotation).push(
      coreArtist,
    );
  });

  return { highRotation, mediumRotation };
};

const _createPreferencePlaylist = (playlist: any, name: string) => ({
  name,
  tracks: [] as any[],
  type: 'random-pref',
  max: playlist.max,
  username: playlist.username,
});
const _isHighRotationIndex = (index: number) =>
  index % 3 === 0 || index % 5 === 0;
const _isMediumRotationIndex = (index: number) =>
  index % 4 === 0 || index % 7 === 0;

export const getNewPlaylistForRandomPref = async (playlist: any) => {
  const mdb: any = await musicdb;
  EventBus.emit(NEW_PLAYLIST_LENGTH, {}, 0);
  const { highRotation, mediumRotation } = await _getArtistRotations(
    playlist.username,
    mdb,
    10,
  );
  const newPlaylist = _createPreferencePlaylist(
    playlist,
    `Random tracks based on ${playlist.username} recently listened tracks`,
  );
  const allArtists = mdb.artistsList();

  for (let index = 0; index < playlist.max; index++) {
    let artists = allArtists;
    if (_isHighRotationIndex(index)) {
      artists = highRotation;
    } else if (_isMediumRotationIndex(index)) {
      artists = mediumRotation;
    }
    newPlaylist.tracks.push(_getRandomTrackFromArtists(artists, newPlaylist));
    EventBus.emit(NEW_PLAYLIST_LENGTH, {}, newPlaylist.tracks.length);
  }

  return newPlaylist;
};

export const getNewPlaylistForRadioPref = async (playlist: any) => {
  const mdb: any = await musicdb;
  EventBus.emit(NEW_PLAYLIST_LENGTH, {}, 0);
  const { highRotation, mediumRotation } = await _getArtistRotations(
    playlist.username,
    mdb,
    15,
  );
  const newPlaylist = _createPreferencePlaylist(
    playlist,
    `Radio based on ${playlist.username} recently listened tracks`,
  );

  for (let index = 0; index < playlist.max; index++) {
    if (_isHighRotationIndex(index)) {
      newPlaylist.tracks.push(
        _getRandomTrackFromArtists(highRotation, newPlaylist),
      );
    } else if (_isMediumRotationIndex(index)) {
      newPlaylist.tracks.push(
        _getRandomTrackFromArtists(mediumRotation, newPlaylist),
      );
    } else {
      try {
        const preferredArtist = _shuffle(highRotation)[0];
        const relatedArtists = await _getNextSimilarArtist(
          preferredArtist,
          mdb,
        );
        newPlaylist.tracks.push(
          _getRandomTrackFromArtists(relatedArtists, newPlaylist),
        );
      } catch (error) {
        console.error('Unable to find a related radio track:', error);
      }
    }

    EventBus.emit(NEW_PLAYLIST_LENGTH, {}, newPlaylist.tracks.length);
  }

  return newPlaylist;
};
export const getNewPlaylistForRadio = async (playlist: any) => {
  const mdb: any = await musicdb;
  const startArtist = mdb.artists[playlist.artist];
  if (!startArtist) {
    throw new Error(`Artist not found: ${playlist.artist}`);
  }

  EventBus.emit(NEW_PLAYLIST_LENGTH, {}, 0);
  const newPlaylist = {
    name: `Artist radio for ${startArtist.name}`,
    tracks: [_getRandomTrackFromArtists([startArtist], null)],
    type: 'radio',
    max: playlist.max,
    artist: playlist.artist,
  };
  await _getNextTrack(startArtist, mdb, newPlaylist);
  return newPlaylist;
};
export const getNewPlaylistForLovedTracks = (playlist: any) =>
  new Promise((resolve, reject) =>
    musicdb
      .then((mdb: any) => {
        EventBus.emit(NEW_PLAYLIST_LENGTH, {}, 0);
        getLovedTracks(playlist.username).then(
          ({ lovedtracks }: { lovedtracks: any }) => {
            const newPlaylist = {
              name: `${playlist.username} loved tracks on Last.FM`,
              tracks: [],
              type: 'loved',
              username: playlist.username,
            };
            lovedtracks?.track.forEach((track: any) => {
              const artist = track?.artist?.name;
              const title = track?.name;
              const coretrack = mdb.getTrackByArtistAndName(artist, title);
              if (coretrack && coretrack.id !== '') {
                // @ts-ignore
                newPlaylist.tracks.push(coretrack);
                EventBus.emit(
                  NEW_PLAYLIST_LENGTH,
                  {},
                  newPlaylist.tracks.length,
                );
              }
            });
            resolve(newPlaylist);
          },
        );
      })
      .catch(() => reject()),
  );
export const getTopTracksForUser = (playlist: any) =>
  new Promise((resolve, reject) =>
    musicdb
      .then((mdb: any) => {
        EventBus.emit(NEW_PLAYLIST_LENGTH, {}, 0);
        getTopTracks(playlist.username, playlist.max).then(
          ({ toptracks }: { toptracks: any }) => {
            const newPlaylist = {
              name: `Most played tracks by ${playlist.username} in the last 3 months`,
              tracks: [],
              type: 'top',
              username: playlist.username,
            };
            toptracks?.track.forEach((track: any) => {
              const artist = track?.artist?.name;
              const title = track?.name;
              const coretrack = mdb.getTrackByArtistAndName(artist, title);
              if (
                coretrack &&
                coretrack.artist &&
                coretrack.album &&
                coretrack.title
              ) {
                // @ts-ignore
                newPlaylist.tracks.push(coretrack);
                EventBus.emit(
                  NEW_PLAYLIST_LENGTH,
                  {},
                  newPlaylist.tracks.length,
                );
              }
            });
            resolve(newPlaylist);
          },
        );
      })
      .catch(() => reject()),
  );
const _getNewPlaylistForAlbum = (playlist: any) =>
  new Promise((resolve, reject) =>
    musicdb
      .then((mdb: any) => {
        const nextAlbum = mdb.getNextAlbum(playlist.album);
        const nextPlaylist = {
          name: `${nextAlbum.artist.albumArtist || nextAlbum.artist.name} • ${
            nextAlbum.name
          }`,
          tracks: nextAlbum.tracks,
          index: 0,
          type: 'album',
          album: nextAlbum,
        };
        return resolve(nextPlaylist);
      })
      .catch(() => reject()),
  );
const MAX_TRACK_SELECTION_ATTEMPTS = 100;
const _getRandomTrackFromArtists = (artists: any[], playlist: any): any => {
  for (let attempt = 0; attempt < MAX_TRACK_SELECTION_ATTEMPTS; attempt++) {
    const artist = _sample(artists);
    const album = _sample(artist?.albums || []);
    const track = _sample(album?.tracks || []);
    if (_isEligibleTrack(track, playlist)) return track;
  }

  for (const artist of _shuffle(artists)) {
    for (const album of _shuffle(artist?.albums || [])) {
      const tracks = _shuffle(
        (album?.tracks || []).filter((track: any) =>
          _isEligibleTrack(track, playlist),
        ),
      );
      if (tracks.length) return tracks[0];
    }
  }

  throw new Error('No eligible tracks found for playlist.');
};
const _isEligibleTrack = (track: any, playlist: any) =>
  track?.duration <= 1000 * 60 * 10 && !playlist?.tracks.includes(track);
const _sample = (items: any[]) =>
  items[Math.floor(Math.random() * items.length)];
const _shuffle = (list: any[]): any[] => {
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
};
export const shuffle = _shuffle;
const _getSortName = (artistname: string) =>
  encodeURIComponent(_stripFromName(artistname, ['the ', '"', 'a ']));
const _stripFromName = (name: string, strip: string[]) => {
  let f = name ? name.toUpperCase() : '';
  f = f.trim();
  strip.forEach(str => {
    const s = str.toUpperCase();
    if (f.indexOf(s) === 0) {
      f = f.substring(s.length);
    }
  });
  return f;
};
const _getNextTrack = async (artist: any, mdb: any, playlist: any) => {
  while (playlist.tracks.length < playlist.max) {
    const similarArtists = await _getNextSimilarArtist(artist, mdb);
    if (!similarArtists.length) return;

    const track = _getRandomTrackFromArtists(similarArtists, playlist);
    playlist.tracks.push(track);
    EventBus.emit(NEW_PLAYLIST_LENGTH, {}, playlist.tracks.length);
    artist = track.album.artist;
  }
};
const _getNextSimilarArtist = async (artist: any, mdb: any): Promise<any[]> => {
  const { similarartists } = await getSimilairArtists(artist.name);
  const foundSimilar = (similarartists?.artist || [])
    .map(({ name }: { name: string }) => mdb.getArtistByName(name))
    .filter(Boolean);

  return foundSimilar;
};
