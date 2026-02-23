declare const MediaMetadata: any;

import { LitElement, html, nothing } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import buttons from '../../styles/buttons';
import controls from '../../styles/controls';
import player from '../../styles/player';
import progress from '../../styles/progress-bar';
import responsive from '../../styles/responsive';
import smallMuted from '../../styles/small-muted';
import { global as EventBus } from '../../utils/EventBus';
import { animateCSS, animationCSS } from '../../utils/animations';
import {
  ACCENT_COLOR,
  LIGHT,
  addCustomCss,
  currentBgColor,
  getColorsFromRGBWithBGColor,
  getDominantColorByURL,
  removeCustomCss,
} from '../../utils/colour';
import {
  announceNowPlaying,
  getLastFMUserName,
  getTrackInfo,
  scrobbleTrack,
  toggleLoved,
} from '../../utils/lastfm';
import { getJwt, getServer } from '../../utils/node-mp3stream';
import {
  CHANGE_TITLE,
  LOADED_PLAYLIST,
  LOAD_PLAYLIST,
  NAVIGATE_TO_ALBUM,
  NEXT_TRACK,
  PAUSE_PLAYER,
  PLAYER_ERROR,
  PLAY_PLAYER,
  PLAY_PLAYER_START,
  PREVIOUS_TRACK,
  SET_POSITION,
  START_CURRENT_PLAYLIST,
  STOP_PLAYER,
  TOGGLE_LOVED,
  TOGGLE_LOVED_UPDATED,
  TOGGLE_PLAY_PAUSE_PLAYER,
  TOGGLE_SHUFFLE,
  TOGGLE_SHUFFLE_UPDATED,
  UPDATE_PLAYER,
  UPDATE_TRACK,
  getCurrentPlaylist,
  getCurrentTime,
  getIsShuffled,
  getNextPlaylist,
  setCurrentPlaylist,
  setCurrentTime,
  setIsShuffled,
  shuffle,
} from '../../utils/player';
import { TOGGLE_SETTING, getSettingByName } from '../../utils/settings';
import { heartIcon } from '../icons/heart';
import { nextIcon } from '../icons/next';
import { pauseIcon } from '../icons/pause';
import { playIcon } from '../icons/play';
import { previousIcon } from '../icons/previous';
import { randomIcon } from '../icons/random';
import { volumeIcon } from '../icons/volume';

const ONEMINUTE = 1 * 60 * 1000;
const FOURMINUTES = 4 * ONEMINUTE;

const PREGAIN = 11;
const TARGET_VOLUME = 0.89;

@customElement('lit-player')
export class Album extends LitElement {
  @property()
  route: string;
  @state()
  playlist: any;
  track: any;
  @state()
  isPlaying: boolean;
  @state()
  timePlayed: number;
  hasScrobbled: boolean;
  @state()
  isLoved: boolean;
  art: any;
  @state()
  isShuffled: boolean;
  bgColor: string;
  useDynamicAccentColor: boolean;
  gain: number;
  @state()
  hasErrorWhilePlaying: boolean;
  doNavigateToAlbum: boolean;

  static get styles() {
    return [
      animationCSS,
      progress,
      controls,
      responsive,
      buttons,
      player,
      smallMuted,
    ];
  }
  constructor() {
    super();
    this.route = '';
    this.track = null;
    this.isPlaying = false;
    this.timePlayed = 0;
    this.hasScrobbled = false;
    this.isLoved = false;
    this.art = '';
    this.isShuffled = false;
    this.useDynamicAccentColor = false;
    this.bgColor = LIGHT;
    this._updateBgColorIfSystemTheme();
    this.gain = -9;
    this.hasErrorWhilePlaying = false;
    this.doNavigateToAlbum = false;

    getCurrentPlaylist().then((playlist: any) => {
      this.playlist = playlist;
      getCurrentTime().then((time: any) => {
        this._play(Number(time || 0));
      });
    });

    getSettingByName('dynamicTheme').then(async (dynamicTheme: any) => {
      this.useDynamicAccentColor = !!dynamicTheme;
      if (this.useDynamicAccentColor) {
        this.bgColor = (await currentBgColor()) || '';
      }
    });

    getSettingByName('followTrack').then((followTrack: any) => {
      this.doNavigateToAlbum = !!followTrack;
    });

    getIsShuffled().then((isShuffled: any) => {
      if (isShuffled) {
        this._toggleShuffled();
      }
    });
    if ('mediaSession' in navigator) {
      (navigator as any).mediaSession.setActionHandler('play', () => {
        this._togglePlayPause();
      });
      (navigator as any).mediaSession.setActionHandler('pause', () => {
        this._togglePlayPause();
      });
      (navigator as any).mediaSession.setActionHandler('stop', () => {
        this._stop();
      });
      (navigator as any).mediaSession.setActionHandler('previoustrack', () => {
        this._previous();
      });
      (navigator as any).mediaSession.setActionHandler('nexttrack', () => {
        this._next();
      });
    }
  }
  _shuffleCollection() {
    if (!this.playlist.shuffledIndices) {
      const availableIndices = this.playlist.tracks.map(
        (track: any, index: number) => index,
      );
      this.playlist.shuffledIndices = shuffle(availableIndices);
    }
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(START_CURRENT_PLAYLIST, this._startCurrentPlaylist, this);
    EventBus.on(TOGGLE_PLAY_PAUSE_PLAYER, this._togglePlayPause, this);
    EventBus.on(TOGGLE_LOVED, this._toggleLoved, this);
    EventBus.on(PREVIOUS_TRACK, this._previous, this);
    EventBus.on(NEXT_TRACK, this._next, this);
    EventBus.on(SET_POSITION, this._doSetPosition, this);
    EventBus.on(TOGGLE_SHUFFLE, this._toggleShuffled, this);
    EventBus.on(TOGGLE_SETTING, this._doToggleSetting, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(START_CURRENT_PLAYLIST, this._startCurrentPlaylist, this);
    EventBus.off(TOGGLE_PLAY_PAUSE_PLAYER, this._togglePlayPause, this);
    EventBus.off(TOGGLE_LOVED, this._toggleLoved, this);
    EventBus.off(PREVIOUS_TRACK, this._previous, this);
    EventBus.off(NEXT_TRACK, this._next, this);
    EventBus.off(SET_POSITION, this._doSetPosition, this);
    EventBus.off(TOGGLE_SHUFFLE, this._toggleShuffled, this);
    EventBus.off(TOGGLE_SETTING, this._doToggleSetting, this);
  }
  _startCurrentPlaylist(target: any, data: any) {
    const startPosition = data?.startPosition || 0;
    getCurrentPlaylist().then((playlist: any) => {
      this.playlist = playlist;
      this._play(startPosition);
    });
  }
  _doSetPosition(target: any, position: any) {
    this._play(position);
  }
  _doToggleSetting(target: any, setting: any) {
    this._toggleSetting(setting);
  }
  _hasMoreDiscs() {
    return Object.keys(this.track.album.discs).length > 1;
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
    await this._setGain();
    if (player && this.track) {
      player.crossOrigin = 'anonymous';
      player.src = `${server}/listen?path=${encodeURIComponent(
        this.track.source.url,
      )}&jwt=${jwt}`;
      player
        .play()
        .then(async () => {
          this.hasErrorWhilePlaying = false;
          EventBus.emit(PLAYER_ERROR, this, false);
          player.currentTime = startPosition;
          await setCurrentPlaylist(this.playlist);
          const username: any = await getLastFMUserName();
          const trackinfo: any = await getTrackInfo(this.track, username);
          this.isLoved = false;
          if (trackinfo?.track?.userloved === '1') {
            this.isLoved = true;
          }
          this.track.isLoved = this.isLoved;
        })
        .catch(e => {
          console.error(e);
          this.hasErrorWhilePlaying = true;
          EventBus.emit(PLAYER_ERROR, this, true);
        });
      // share player
      // @ts-ignore
      window._player = player;

      if (
        this.doNavigateToAlbum &&
        this.playlist.type !== 'album' &&
        this.route !== '/playing'
      ) {
        EventBus.emit(NAVIGATE_TO_ALBUM, this, {
          current: this.track,
        });
      }

      setTimeout(() => {
        EventBus.emit(UPDATE_TRACK, this, {
          current: this.track,
          type: PLAY_PLAYER_START,
        });
      }, 100);
    } else {
      console.warn('no player found :(');
    }
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
      // @ts-ignore
      window._track = this.track;
      this.timePlayed = Math.floor(performance.now());
      if (!this.hasScrobbled && this.timePlayed > ONEMINUTE) {
        this._scrobble();
      }
      if ('setPositionState' in navigator.mediaSession && player.duration) {
        navigator.mediaSession.setPositionState({
          duration: player.duration,
          position: player.currentTime,
        });
      }
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
  _onloadstart() {
    // now that we have the art, we can set the media session
    let imageType;
    let artlocation;
    if (this.art) {
      imageType = this.art.split('.').pop();
      const url = this.art.split('https://');
      if (url.length > 1) {
        artlocation = `https://${url.pop()}`;
      }
    }
    if ('mediaSession' in navigator && imageType && artlocation) {
      (navigator as any).mediaSession.metadata = new MediaMetadata({
        title: this.track.title,
        artist: this.track.trackArtist,
        album: this.track.album.name,
        artwork: [
          {
            src: artlocation,
            sizes: '1000x1000',
            type: `image/${imageType}`,
          },
        ],
      });
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
    EventBus.emit(UPDATE_TRACK, this, {
      current: this.track,
      type: PLAY_PLAYER_START,
    });
    if ('mediaSession' in navigator) {
      (navigator as any).mediaSession.playbackState = 'playing';
    }
    EventBus.emit(CHANGE_TITLE, this, {
      title: this.track.title,
      artist: this.track.trackArtist,
    });
    animateCSS(this.shadowRoot?.querySelectorAll('h4,h5'), 'slideInUp');
  }
  _onpause() {
    this.isPlaying = false;
    this.track.isPlaying = false;
    this.track.isPaused = true;
    EventBus.emit(UPDATE_PLAYER, this, {
      current: this.track,
      type: PAUSE_PLAYER,
    });
    EventBus.emit(UPDATE_TRACK, this, {
      current: this.track,
      type: PAUSE_PLAYER,
    });
    if ('mediaSession' in navigator) {
      (navigator as any).mediaSession.playbackState = 'paused';
    }
    EventBus.emit(CHANGE_TITLE, this, { title: null, artist: null });
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
  async _previous() {
    // always get current playlist from cache first before changing track
    this.playlist = await getCurrentPlaylist();
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
      track =
        this.playlist.tracks[
          this.playlist.shuffledIndices[this.playlist.index]
        ];
    }
    animateCSS(this.shadowRoot?.querySelectorAll('h4, h5'), 'slideInDown');
    track.isPlaying = false;
    this._play(0, track);
  }
  async _next() {
    // always get current playlist from cache first before changing track
    this.playlist = await getCurrentPlaylist();
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
        if (!this.playlist.index) this.playlist.index = 0;
        await setCurrentPlaylist(this.playlist);
        EventBus.emit(LOADED_PLAYLIST, this);
        this._play();
        return;
      }
      EventBus.emit(CHANGE_TITLE, this, { title: null, artist: null });
      this._stop();
      return;
    }
    this.playlist.index = newIndex;
    track = this.playlist.tracks[this.playlist.index];
    if (this.isShuffled) {
      this._shuffleCollection();
      track =
        this.playlist.tracks[
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
      EventBus.emit(TOGGLE_LOVED_UPDATED, this, {
        current: this.track,
        type: TOGGLE_LOVED_UPDATED,
      });
    });
  }
  _toggleShuffled() {
    this.isShuffled = !this.isShuffled;
    EventBus.emit(TOGGLE_SHUFFLE_UPDATED, this, this.isShuffled);
    setIsShuffled(this.isShuffled);
  }
  _setArt(e: any) {
    this.art = e.detail.art;
    if (this.useDynamicAccentColor) {
      this._setDynamicAccentColor();
    }
    this._onloadstart();
  }
  _setDynamicAccentColor() {
    getDominantColorByURL(this.art, (rgba: any) => {
      const colours = getColorsFromRGBWithBGColor(rgba, this.bgColor);
      // @ts-ignore
      window._accentColour = colours.text;
      EventBus.emit(ACCENT_COLOR, this, colours.text);
      addCustomCss(colours);
    });
  }
  async _toggleSetting({
    setting,
    value,
  }: {
    setting: string;
    value: boolean;
  }) {
    if (setting === 'theme') {
      this.bgColor = (await currentBgColor()) || '';
      if (this.useDynamicAccentColor) {
        this._setDynamicAccentColor();
      }
    }
    if (setting === 'dynamicTheme') {
      this.useDynamicAccentColor = value;
      if (this.useDynamicAccentColor) {
        this._setDynamicAccentColor();
        this.bgColor = (await currentBgColor()) || '';
      } else {
        removeCustomCss();
      }
    }
    if (setting === 'replaygain') {
      this._setGain();
    }
    if (setting === 'followTrack') {
      this.doNavigateToAlbum = value;
    }
  }
  async _setGain() {
    await getSettingByName('replaygain').then(async applyGain => {
      if (!applyGain) this.gain = 0;
      if (applyGain) {
        if (this.playlist?.type === 'album') {
          this.gain = this.track?.album?.albumGain || -PREGAIN;
        } else {
          this.gain = this.track?.trackGain || -PREGAIN;
        }
      }
      const player = this.shadowRoot?.querySelector('audio');
      if (player) {
        player.volume = 1;
        if (this.gain) {
          let newVolume = Math.pow(100, this.gain / 128) * TARGET_VOLUME;
          // I'm cheating a bit.
          if (newVolume > 1) newVolume = 1;
          player.volume = newVolume;
        }
      }
      return true;
    });
  }
  _updateBgColorIfSystemTheme() {
    const darkModeMediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)',
    );
    darkModeMediaQuery.addListener(async () => {
      const theme = await getSettingByName('theme');
      if (theme === 'system') {
        this.bgColor = (await currentBgColor()) || '';
        if (this.useDynamicAccentColor) {
          this._setDynamicAccentColor();
        }
      }
    });
  }
  private _renderControls() {
    return html`<div class="controls">
      <button
        class="btn"
        @click=${() => this._previous()}
        aria-label="previous track"
        title="previous track"
      >
        ${previousIcon}
      </button>
      <button
        class="btn"
        @click=${() => this._togglePlayPause()}
        aria-label="${this.isPlaying ? 'pause' : 'play'} track"
        title="${this.isPlaying ? 'pause' : 'play'} track"
      >
        ${this.isPlaying ? pauseIcon : playIcon}
      </button>
      <button
        class="btn"
        @click=${() => this._next()}
        aria-label="next track"
        title="next track"
      >
        ${nextIcon}
      </button>
      <button class="btn" style="display:none">${volumeIcon}</button>
      <button
        class="btn md-up ${this.isLoved ? 'active' : ''}"
        @click=${() => this._toggleLoved()}
        aria-label="${this.isLoved ? 'un' : ''}love track"
        title="${this.isLoved ? 'un' : ''}love track"
      >
        ${heartIcon}
      </button>
      <button
        class="btn md-up ${this.isShuffled ? 'active' : ''}"
        @click=${() => this._toggleShuffled()}
        aria-label="${this.isShuffled ? 'un' : ''}shuffle playlist"
        title="${this.isShuffled ? 'un' : ''}shuffle playlist"
      >
        ${randomIcon}
      </button>
    </div>`;
  }
  private _renderDetails() {
    return html`<div class="details">
      <h4><span>${this.track.title}</span></h4>
      <h5>
        <app-link
          inline
          href="/letter/${this.track.album.artist.letter
            .escapedLetter}/artist/${this.track.album.artist.escapedName}"
        >
          ${this.track.trackArtist}
        </app-link>
        <span class="album-details">
          <span class="muted">&bull;</span>
          <app-link
            inline
            href="/letter/${this.track.album.artist.letter
              .escapedLetter}/artist/${this.track.album.artist
              .escapedName}/album/${this.track.album.escapedName}"
          >
            ${this.track.album.name}
          </app-link>
          ${this._hasMoreDiscs()
            ? html`<span class="small muted">(${this.track.disc})</span>`
            : nothing}
        </span>
      </h5>
    </div>`;
  }
  private _renderArt() {
    return html`<app-link href="/playing" class="art">
      <album-art
        @art=${this._setArt}
        artist=${this.track.album.artist.albumArtist ||
        this.track.album.artist.name}
        album=${this.track.album.name}
        mbid="${this.track.album.mbid}"
        dimension="75"
        static
      ></album-art>
    </app-link>`;
  }
  private _renderErrorState() {
    return html`<div class="error">Error loading music data</div>`;
  }
  private _renderProgressBar() {
    return html`<div
      class="progress"
      @click=${(e: Event) => this._setPosition(e)}
    >
      <div
        class="progress-bar ${this.isPlaying ? '' : 'paused'}"
        style=${styleMap({
          '--progress-perc':
            (this.track.position / this.track.duration) * 100 + '%',
        })}
      ></div>
    </div>`;
  }
  private _renderAudioTag() {
    return html`<audio
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
      @loadstart=${() => {
        this._onloadstart();
      }}
    ></audio>`;
  }
  render() {
    return html`
      ${this._renderAudioTag()}
      ${this.track
        ? html`
            <div class="player">
              ${this._renderProgressBar()}
              <div class="row">
                ${this._renderArt()}
                ${this.hasErrorWhilePlaying
                  ? this._renderErrorState()
                  : html` ${this._renderDetails()} ${this._renderControls()}`}
              </div>
            </div>
          `
        : nothing}
    `;
  }
}
