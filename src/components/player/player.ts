declare const MediaMetadata: any;

import { LitElement, customElement, html } from 'lit-element';
import { global as EventBus } from '../../utils/EventBus';
import { styleMap } from 'lit-html/directives/style-map';
import {
  getCurrentPlaylist,
  setCurrentPlaylist,
  setCurrentTime,
  getNextPlaylist,
  getCurrentTime,
  shuffle,
  START_CURRENT_PLAYLIST,
  STOP_PLAYER,
  LOAD_PLAYLIST,
  LOADED_PLAYLIST,
  TOGGLE_PLAY_PAUSE_PLAYER,
  TOGGLE_LOVED,
  TOGGLE_LOVED_UPDATED,
  PREVIOUS_TRACK,
  NEXT_TRACK,
  SET_POSITION,
  TOGGLE_SHUFFLE_UPDATED,
  TOGGLE_SHUFFLE,
  getIsShuffled,
  setIsShuffled,
  UPDATE_PLAYER,
  PLAY_PLAYER_START,
  PLAY_PLAYER,
  PAUSE_PLAYER,
} from '../../utils/player';
import {
  announceNowPlaying,
  scrobbleTrack,
  toggleLoved,
  getTrackInfo,
  getLastFMUserName,
} from '../../utils/lastfm';
import { getSettingByName, TOGGLE_SETTING } from '../../utils/settings';
import { getServer, getJwt } from '../../utils/node-mp3stream';

import { nextIcon } from '../icons/next';
import { pauseIcon } from '../icons/pause';
import { playIcon } from '../icons/play';
import { previousIcon } from '../icons/previous';
import { randomIcon } from '../icons/random';
import { volumeIcon } from '../icons/volume';
import { heartIcon } from '../icons/heart';

import progress from '../../styles/progress-bar';
import controls from '../../styles/controls';
import responsive from '../../styles/responsive';
import { nothing } from 'lit-html';
import {
  ACCENT_COLOR,
  addCustomCss,
  currentBgColor,
  getColorsFromRGBWithBGColor,
  getDominantColorByURL,
  LIGHT,
} from '../../utils/colour';
import { animationCSS, animateCSS } from '../../utils/animations';
import player from '../../styles/player';

const FOURMINUTES = 4 * 60 * 1000;
const ONEMINUTE = 1 * 60 * 1000;

@customElement('lit-player')
export class Album extends LitElement {
  playlist: any;
  track: any;
  isPlaying: boolean;
  timePlayed: number;
  hasScrobbled: boolean;
  isLoved: boolean;
  art: any;
  isShuffled: boolean;
  bgColor: string;
  useDynamicAccentColor: boolean;
  static get styles() {
    return [animationCSS, progress, controls, responsive, player];
  }
  constructor() {
    super();
    this.track = null;
    this.isPlaying = false;
    this.timePlayed = 0;
    this.hasScrobbled = false;
    this.isLoved = false;
    this.art = '';
    this.isShuffled = false;
    this.useDynamicAccentColor = false;
    this.bgColor = LIGHT;
    this._listen();
    getCurrentPlaylist().then((playlist: any) => {
      this.playlist = playlist;
      getCurrentTime().then((time: any) => {
        this._play(Number(time || 0));
        this.requestUpdate();
      });
    });

    getSettingByName('dynamicTheme').then(async (dynamicTheme: any) => {
      this.useDynamicAccentColor = !!dynamicTheme;
      if (this.useDynamicAccentColor) {
        this.bgColor = await currentBgColor();
      }
    });
    getIsShuffled().then((isShuffled: any) => {
      if (isShuffled) {
        this._toggleShuffled();
      }
    });
  }
  _shuffleCollection() {
    if (!this.playlist.shuffledIndices) {
      const availableIndices = this.playlist.tracks.map(
        (track: any, index: number) => index
      );
      this.playlist.shuffledIndices = shuffle(availableIndices);
    }
  }
  _listen() {
    EventBus.on(
      START_CURRENT_PLAYLIST,
      (target: any, data: any) => {
        const startPosition = data?.startPosition || 0;
        getCurrentPlaylist().then((playlist: any) => {
          this.playlist = playlist;
          this._play(startPosition);
          this.requestUpdate();
        });
      },
      this
    );
    EventBus.on(
      TOGGLE_PLAY_PAUSE_PLAYER,
      () => {
        this._togglePlayPause();
      },
      this
    );
    EventBus.on(
      TOGGLE_LOVED,
      () => {
        this._toggleLoved();
      },
      this
    );
    EventBus.on(
      PREVIOUS_TRACK,
      () => {
        this._previous();
      },
      this
    );
    EventBus.on(
      NEXT_TRACK,
      () => {
        this._next();
      },
      this
    );
    EventBus.on(
      SET_POSITION,
      (target: any, position: any) => {
        this._play(position);
      },
      this
    );
    EventBus.on(
      TOGGLE_SHUFFLE,
      () => {
        this._toggleShuffled();
      },
      this
    );
    EventBus.on(
      TOGGLE_SETTING,
      (tartget: any, setting: any) => {
        this._toggleSetting(setting);
      },
      this
    );
  }
  async _play(startPosition = 0, track: any = null) {
    this.track = track || this.playlist?.tracks[this.playlist.index || 0];
    if (this.isShuffled) {
      this._shuffleCollection();
      this.track =
        track ||
        this.playlist?.tracks[
          this.playlist.shuffledIndices[this.playlist.index] || 0
        ];
    }
    const server = await getServer();
    const jwt = await getJwt();
    const player = this.shadowRoot?.querySelector('audio');
    if (player && this.track) {
      player.crossOrigin = 'anonymous';
      player.src = `${server}/listen?path=${encodeURIComponent(
        this.track.source.url
      )}&jwt=${jwt}`;
      player.play();
      player.currentTime = startPosition;
      await setCurrentPlaylist(this.playlist);
      const username: any = await getLastFMUserName();
      const trackinfo: any = await getTrackInfo(this.track, username);
      this.isLoved = false;
      if (trackinfo?.track?.userloved === '1') {
        this.isLoved = true;
      }
      this.track.isLoved = this.isLoved;
      this.requestUpdate();
      if ('mediaSession' in navigator) {
        (navigator as any).mediaSession.metadata = new MediaMetadata({
          title: this.track.title,
          artist: this.track.trackArtist,
          album: this.track.album.name,
          artwork: [{ src: this.art, sizes: '500x500', type: 'image/png' }],
        });
        (navigator as any).mediaSession.setActionHandler('play', () => {
          this._togglePlayPause();
        });
        (navigator as any).mediaSession.setActionHandler('pause', () => {
          this._togglePlayPause();
        });
        (navigator as any).mediaSession.setActionHandler(
          'previoustrack',
          () => {
            this._previous();
          }
        );
        (navigator as any).mediaSession.setActionHandler('nexttrack', () => {
          this._next();
        });
      }
      // share player
      document
        .querySelector('lit-musicdb')
        ?.dispatchEvent(new CustomEvent('_player', { detail: player }));
    } else {
      console.warn('no player found :(');
    }
    this.requestUpdate();
  }
  _onended() {
    this.hasScrobbled = false;
    this._next();
  }
  _ontimeupdate() {
    const player = this.shadowRoot?.querySelector('audio');
    if (player) {
      this.track.position = player.currentTime * 1000;
      setCurrentTime(player.currentTime);
      EventBus.emit(UPDATE_PLAYER, this, {
        current: this.track,
        type: PLAY_PLAYER,
      });
      this.timePlayed = Math.floor(performance.now());
      if (!this.hasScrobbled && this.timePlayed > ONEMINUTE) {
        this._scrobble();
      }
      this.requestUpdate();
    }
  }
  _scrobble() {
    if (
      this.track.position > FOURMINUTES ||
      this.track.position > this.track.duration / 2
    ) {
      scrobbleTrack(this.track);
      this.hasScrobbled = true;
    }
  }
  _onplay() {
    this.isPlaying = true;
    this.track.isPlaying = true;
    this.track.isPaused = false;
    announceNowPlaying(this.track);
    EventBus.emit(UPDATE_PLAYER, this, {
      current: this.track,
      type: PLAY_PLAYER_START,
    });
    if ('mediaSession' in navigator) {
      (navigator as any).mediaSession.playbackState = 'playing';
    }
    document.title = `${this.track.title} by ${this.track.trackArtist} - JSMusicDB`;
    animateCSS(this.shadowRoot?.querySelectorAll('h4,h5'), 'slideInUp');
    this.requestUpdate();
  }
  _onpause() {
    this.isPlaying = false;
    this.track.isPlaying = false;
    this.track.isPaused = true;
    EventBus.emit(UPDATE_PLAYER, this, {
      current: this.track,
      type: PAUSE_PLAYER,
    });
    if ('mediaSession' in navigator) {
      (navigator as any).mediaSession.playbackState = 'paused';
    }
    document.title = `JSMusicDB`;
    this.requestUpdate();
  }
  _onprogress() {
    const player = this.shadowRoot?.querySelector('audio');
    if (player) {
      const buffered = player.buffered;
      if (buffered.length !== 0) {
        this.track.buffered.start =
          buffered.start(buffered.length !== 0 ? buffered.length - 1 : 0) *
          1000;
        this.track.buffered.end =
          buffered.end(buffered.length !== 0 ? buffered.length - 1 : 0) * 1000;
        EventBus.emit(UPDATE_PLAYER, this, { current: this.track });
      }
    }
  }
  _togglePlayPause() {
    const player = this.shadowRoot?.querySelector('audio');
    if (player) {
      if (this.isPlaying) {
        player.pause();
        return;
      }
      player.play();
    }
  }
  _previous() {
    const index = this.playlist.index;
    let track = this.playlist.tracks[this.playlist.index];
    track.isPlaying = false;
    track.isPaused = false;
    let newIndex = index - 1;
    if (newIndex < 0) {
      newIndex = 0;
    }
    this.playlist.index = newIndex;
    track = this.playlist.tracks[this.playlist.index];
    if (this.isShuffled) {
      this._shuffleCollection();
      track = this.playlist.tracks[
        this.playlist.shuffledIndices[this.playlist.index]
      ];
    }
    animateCSS(this.shadowRoot?.querySelectorAll('h4, h5'), 'slideInDown');
    track.isPlaying = false;
    this._play(0, track);
  }
  async _next() {
    const index = this.playlist.index;
    let track = this.playlist.tracks[this.playlist.index];
    if (track) {
      track.isPlaying = false;
      track.isPaused = false;
    }
    const newIndex = index + 1;
    if (index >= this.playlist.tracks.length - 1) {
      const continuesPlay: boolean = await getSettingByName('continues');
      if (continuesPlay) {
        EventBus.emit(LOAD_PLAYLIST, this);
        this.playlist = await getNextPlaylist(this.playlist);
        await setCurrentPlaylist(this.playlist);
        EventBus.emit(LOADED_PLAYLIST, this);
        this._play();
        this.requestUpdate();
        return;
      }
      document.title = `JSMusicDB`;
      this._stop();
      return;
    }
    this.playlist.index = newIndex;
    track = this.playlist.tracks[this.playlist.index];
    if (this.isShuffled) {
      this._shuffleCollection();
      track = this.playlist.tracks[
        this.playlist.shuffledIndices[this.playlist.index]
      ];
    }
    if (track) {
      track.isPlaying = false;
    }
    animateCSS(this.shadowRoot?.querySelectorAll('h4, h5'), 'slideInUp');
    this._play(0, track);
  }
  _stop() {
    const player = this.shadowRoot?.querySelector('audio');
    const track = this.playlist.tracks[this.playlist.index];
    track.isPlaying = false;
    if (player) {
      player.pause();
    }
    EventBus.emit(STOP_PLAYER, this);
    this.requestUpdate();
  }
  _setPosition(e: any) {
    const clientX = e.clientX || e.changedTouches[0].clientX;
    const left = clientX;
    const perc = left / e.target.clientWidth;
    const pos = (this.track.duration / 1000) * perc;
    this._play(pos);
  }
  _toggleLoved() {
    this.isLoved = !this.isLoved;
    toggleLoved(this.track, this.isLoved).then(() => {
      this.track.isLoved = this.isLoved;
      EventBus.emit(TOGGLE_LOVED_UPDATED, this, this.isLoved);
      this.requestUpdate();
    });
  }
  _toggleShuffled() {
    this.isShuffled = !this.isShuffled;
    EventBus.emit(TOGGLE_SHUFFLE_UPDATED, this, this.isShuffled);
    setIsShuffled(this.isShuffled);
    this.requestUpdate();
  }
  _setArt(e: any) {
    this.art = e.detail.art;
    if (this.useDynamicAccentColor) {
      this._setDynamicAccentColor();
    }
  }
  _setDynamicAccentColor() {
    getDominantColorByURL(this.art, (rgba: any) => {
      const colours = getColorsFromRGBWithBGColor(rgba, this.bgColor);
      EventBus.emit(ACCENT_COLOR, this, colours.text);
      addCustomCss(colours);
    });
  }
  async _toggleSetting({ setting }: { setting: string }) {
    if (setting === 'theme') {
      this.bgColor = await currentBgColor();
      if (this.useDynamicAccentColor) {
        this._setDynamicAccentColor();
      }
    }
  }
  render() {
    return html`
      <audio
        @ended=${() => {
          this._onended();
        }}
        @timeupdate=${() => {
          this._ontimeupdate();
        }}
        @play=${() => {
          this._onplay();
        }}
        @pause=${() => {
          this._onpause();
        }}
        @progress=${() => {
          this._onprogress();
        }}
      ></audio>
      ${this.track
        ? html`
            <div class="player">
              <div
                class="progress"
                @click=${(e: Event) => this._setPosition(e)}
              >
                <div
                  class="progress-bar"
                  style=${styleMap({
                    width:
                      (this.track.position / this.track.duration) * 100 + '%',
                  })}
                ></div>
              </div>
              <div class="row">
                <app-link href="/now-playing" class="art">
                  <album-art
                    @art=${(e: any) => this._setArt(e)}
                    .artist=${this.track.album.artist.albumArtist ||
                    this.track.album.artist.name}
                    .album=${this.track.album.name}
                  ></album-art>
                </app-link>
                <div class="details">
                  <h4>${this.track.title}</h4>
                  <h5>
                    <app-link
                      inline
                      href="/letter/${this.track.album.artist.letter
                        .escapedLetter}/artist/${this.track.album.artist
                        .escapedName}"
                    >
                      ${this.track.trackArtist}
                    </app-link>
                    &bull;
                    <app-link
                      inline
                      href="/letter/${this.track.album.artist.letter
                        .escapedLetter}/artist/${this.track.album.artist
                        .escapedName}/album/${this.track.album.escapedName}"
                    >
                      ${this.track.album.name}
                    </app-link>
                  </h5>
                </div>
                <div class="controls">
                  <button class="btn" @click=${() => this._previous()}>
                    ${previousIcon}
                  </button>
                  <button class="btn" @click=${() => this._togglePlayPause()}>
                    ${this.isPlaying ? pauseIcon : playIcon}
                  </button>
                  <button class="btn" @click=${() => this._next()}>
                    ${nextIcon}
                  </button>
                  <button class="btn" style="display:none">
                    ${volumeIcon}
                  </button>
                  <button
                    class="btn md-up ${this.isLoved ? 'active' : ''}"
                    @click=${() => this._toggleLoved()}
                  >
                    ${heartIcon}
                  </button>
                  <button
                    class="btn md-up ${this.isShuffled ? 'active' : ''}"
                    @click=${() => this._toggleShuffled()}
                  >
                    ${randomIcon}
                  </button>
                </div>
              </div>
            </div>
          `
        : nothing}
    `;
  }
}
