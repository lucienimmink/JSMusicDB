import { set, get } from 'idb-keyval';
import { global as EventBus } from './EventBus';
import musicdb from '../components/musicdb';
import { getTopArtists, getSimilairArtists, getLovedTracks } from './lastfm';

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

export const getCurrentPlaylist = () => {
  return get(CURRENT_PLAYLIST);
};
export const setCurrentPlaylist = (playlist: any) => {
  return set(CURRENT_PLAYLIST, playlist);
};

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
    case 'radio':
      return getNewPlaylistForRadio(playlist);
    case 'loved':
      return getNewPlaylistForLovedTracks(playlist);
    default:
      throw new Error(
        `No implementation to generate a new playlist for type ${playlist.type}`
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
export const getNewPlaylistForRandom = (playlist: any) => {
  return new Promise((resolve, reject) => {
    musicdb
      .then((mdb: any) => {
        const trackIDs = Object.keys(mdb.tracks);
        const randomTracks: string[] = _shuffle(trackIDs).splice(
          0,
          playlist.max
        );
        const nextPlaylist = {
          name: `${playlist.max} random tracks`,
          tracks: [],
          type: 'random',
          max: playlist.max,
        };
        randomTracks.map(id => {
          // @ts-ignore
          nextPlaylist.tracks.push(mdb.tracks[id]);
        });
        return resolve(nextPlaylist);
      })
      .catch(() => reject());
  });
};
export const getNewPlaylistForRandomPref = (playlist: any) => {
  return new Promise((resolve, reject) => {
    return musicdb.then((mdb: any) => {
      const highRotation: Array<any> = [];
      const mediumRotation: Array<any> = [];
      getTopArtists(playlist.username)
        .then(({ topartists }: { topartists: any }) => {
          topartists?.artist.forEach((artist: any, index: number) => {
            const sortName = _getSortName(artist.name);
            const coreArtist = mdb.artists[sortName];
            if (coreArtist && index < 10) {
              highRotation.push(coreArtist);
            } else {
              mediumRotation.push(coreArtist);
            }
          });
          const newPlaylist = {
            name: `Random tracks based on ${playlist.username} recently listened tracks`,
            tracks: [],
            type: 'random-pref',
            max: playlist.max,
            username: playlist.username,
          };
          for (let i = 0; i < playlist.max; i++) {
            if (i % 3 === 0 || i % 5 === 0) {
              newPlaylist.tracks.push(
                // @ts-ignore
                _getRandomTrackFromArtists(highRotation, newPlaylist)
              );
            } else if (i % 4 === 0 || i % 7 === 0) {
              newPlaylist.tracks.push(
                // @ts-ignore
                _getRandomTrackFromArtists(mediumRotation, newPlaylist)
              );
            } else {
              newPlaylist.tracks.push(
                // @ts-ignore
                _getRandomTrackFromArtists(mdb.artistsList(), newPlaylist)
              );
            }
          }
          return resolve(newPlaylist);
        })
        .catch(() => reject());
    });
  });
};
export const getNewPlaylistForRadio = (playlist: any) => {
  return new Promise((resolve, reject) => {
    return musicdb
      .then((mdb: any) => {
        const startArtist = mdb.artists[playlist.artist];
        const newPlaylist = {
          name: `Artist radio for ${startArtist.name}`,
          tracks: [_getRandomTrackFromArtists([startArtist], null)],
          type: 'radio',
          max: playlist.max,
          artist: playlist.artist,
        };
        _getNextTrack(startArtist, mdb, newPlaylist).catch(() => {
          // once rejected the playlist is done
          resolve(newPlaylist);
        });
      })
      .catch(() => reject());
  });
};
export const getNewPlaylistForLovedTracks = (playlist: any) => {
  return new Promise((resolve, reject) => {
    return musicdb
      .then((mdb: any) => {
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
              if (coretrack) {
                // @ts-ignore
                newPlaylist.tracks.push(coretrack);
              }
            });
            resolve(newPlaylist);
          }
        );
      })
      .catch(() => reject());
  });
};
const _getNewPlaylistForAlbum = (playlist: any) => {
  return new Promise((resolve, reject) => {
    return musicdb
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
      .catch(() => reject());
  });
};
const _getRandomTrackFromArtists = (
  artists: Array<any>,
  playlist: any
): any => {
  const randomArtist = _shuffle(artists)[0];
  const randomAlbum = _shuffle(randomArtist.albums)[0];
  const randomTrack = _shuffle(randomAlbum.tracks)[0];
  if (randomTrack.duration <= 1000 * 60 * 10) {
    // skip long songs, skips songs already present in list
    console.log(playlist?.tracks.includes(randomTrack));
    if (playlist && playlist.tracks.includes(randomTrack)) {
      return _getRandomTrackFromArtists(artists, playlist);
    }
    return randomTrack;
  }
  return _getRandomTrackFromArtists(artists, playlist);
};
const _shuffle = (list: any[]): any[] => {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
  return list;
};
export const shuffle = _shuffle;
const _getSortName = (artistname: string) => {
  return encodeURIComponent(_stripFromName(artistname, ['the ', '"', 'a ']));
};
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
const _getNextTrack = (artist: any, mdb: any, playlist: any) => {
  const promise = new Promise((resolve, reject) => {
    _getNextSimilarArtist(artist, mdb)
      .then((similarartists: any) => {
        // add a new track to the playlist
        const randomTrack = _getRandomTrackFromArtists(
          similarartists,
          playlist
        );
        playlist.tracks.push(randomTrack);
        if (playlist.tracks.length < playlist.max) {
          return _getNextTrack(randomTrack.album.artist, mdb, playlist);
        } else {
          return reject();
        }
      })
      .catch(() => reject());
  });
  return promise;
};
const _getNextSimilarArtist = (artist: any, mdb: any): Promise<any> => {
  const promise = new Promise((resolve, reject) => {
    getSimilairArtists(artist.name).then(({ similarartists }) => {
      const foundSimilar: Array<any> = [];
      similarartists?.artist.forEach(({ name }: { name: string }) => {
        const mdbartist = mdb.getArtistByName(name);
        if (mdbartist) {
          foundSimilar.push(mdbartist);
        }
      });
      if (foundSimilar.length > 0) {
        resolve(foundSimilar);
      }
      reject();
    });
  });
  return promise;
};
