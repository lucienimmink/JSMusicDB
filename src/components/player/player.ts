declare const MediaMetadata: any;

import { LitElement, customElement, html, css } from 'lit-element';
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
  PLAY_PLAYER,
  LOAD_PLAYLIST,
  LOADED_PLAYLIST,
  TOGGLE_PLAY_PAUSE_PLAYER,
  TOGGLE_LOVED,
  PAUSE_PLAYER,
  TOGGLE_LOVED_UPDATED,
  PREVIOUS_TRACK,
  NEXT_TRACK,
  SET_POSITION,
  TOGGLE_SHUFFLE_UPDATED,
  TOGGLE_SHUFFLE,
  PLAY_PLAYER_START,
  getIsShuffled,
  setIsShuffled,
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
} from '../../utils/colour';
import { animationCSS, animateCSS } from '../../utils/animations';

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
    return [
      animationCSS,
      css`
        :host {
          background: var(--background3, #e9ecef);
          box-shadow: 0 7px 11px var(--text-color);
        }
        audio {
          display: none;
        }
        ${progress}
        .row {
          display: flex;
          flex-direction: row;
        }
        ${controls}
        ${responsive}
      .details {
          color: var(--text-color);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          flex-grow: 1;
          flex-shrink: 0;
          width: calc(100% - 75px - 145px);
          max-width: calc(100% - 75px - 145px);
          overflow: hidden;
        }
        .details app-link {
          color: var(--primary, #006ecd);
          transition: color 0.2s ease-in-out;
        }
        .art {
          width: 75px;
          min-width: 75px;
          margin-right: 0.75rem;
          background: rgba(255, 255, 255, 0.85);
        }
        h4 {
          font-weight: 400;
          font-size: 1.3rem;
          margin: 8px 0px 0px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        h5 {
          font-weight: 400;
          font-size: 1.1rem;
          margin: 0;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        @media (min-width: 576px) {
          album-art {
            margin-right: 1rem;
          }
          h4 {
            font-weight: 400;
            font-size: 1.5rem;
            margin: 4px 0 0;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          h5 {
            font-weight: 400;
            font-size: 1.2rem;
            margin: 0;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .details {
            width: calc(100% - 400px);
          }
        }
      `,
    ];
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
    this.bgColor = '#fff';
    getCurrentPlaylist().then((playlist: any) => {
      this.playlist = playlist;
      getCurrentTime().then((time: any) => {
        this._play(Number(time || 0));
        this.requestUpdate();
      });
    });
    this.addEventListener(
      START_CURRENT_PLAYLIST,
      (e: any) => {
        const startPosition = e?.detail || 0;
        getCurrentPlaylist().then((playlist: any) => {
          this.playlist = playlist;
          this._play(startPosition);
          this.requestUpdate();
        });
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      TOGGLE_PLAY_PAUSE_PLAYER,
      () => {
        this._togglePlayPause();
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      TOGGLE_LOVED,
      () => {
        this._toggleLoved();
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      PREVIOUS_TRACK,
      () => {
        this._previous();
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      NEXT_TRACK,
      () => {
        this._next();
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      SET_POSITION,
      (e: any) => {
        this._play(e.detail);
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      TOGGLE_SHUFFLE,
      () => {
        this._toggleShuffled();
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      TOGGLE_SETTING,
      (e: any) => {
        this._toggleSetting(e.detail);
      },
      {
        passive: true,
      }
    );
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
      document
        .querySelector('lit-musicdb')
        ?.dispatchEvent(new CustomEvent(PLAY_PLAYER, { detail: this.track }));
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
    document
      .querySelector('lit-musicdb')
      ?.dispatchEvent(
        new CustomEvent(PLAY_PLAYER_START, { detail: this.track })
      );
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
    document
      .querySelector('lit-musicdb')
      ?.dispatchEvent(new CustomEvent(PAUSE_PLAYER, { detail: this.track }));
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
        document
          .querySelector('lit-musicdb')
          ?.dispatchEvent(new CustomEvent(PLAY_PLAYER, { detail: this.track }));
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
        document
          .querySelector('lit-musicdb')
          ?.dispatchEvent(new CustomEvent(LOAD_PLAYLIST));
        this.playlist = await getNextPlaylist(this.playlist);
        await setCurrentPlaylist(this.playlist);
        document
          .querySelector('lit-musicdb')
          ?.dispatchEvent(new CustomEvent(LOADED_PLAYLIST));
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
    document
      .querySelector('lit-musicdb')
      ?.dispatchEvent(new CustomEvent(STOP_PLAYER));
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
      document
        .querySelector('lit-musicdb')
        ?.dispatchEvent(
          new CustomEvent(TOGGLE_LOVED_UPDATED, { detail: this.isLoved })
        );
      this.requestUpdate();
    });
  }
  _toggleShuffled() {
    this.isShuffled = !this.isShuffled;
    document
      .querySelector('lit-musicdb')
      ?.dispatchEvent(
        new CustomEvent(TOGGLE_SHUFFLE_UPDATED, { detail: this.isShuffled })
      );
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
      document
        .querySelector('lit-musicdb')
        ?.dispatchEvent(
          new CustomEvent(ACCENT_COLOR, { detail: colours.text })
        );
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
