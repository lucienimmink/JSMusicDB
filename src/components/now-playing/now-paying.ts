import '@lit-labs/virtualizer';
import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import buttons from '../../styles/buttons';
import container from '../../styles/container';
import controls from '../../styles/controls';
import nowPlaying from '../../styles/now-playing';
import progress from '../../styles/progress-bar';
import smallMuted from '../../styles/small-muted';
import { animateCSS, animationCSS } from '../../utils/animations';
import { ACCENT_COLOR } from '../../utils/colour';
import { global as EventBus } from '../../utils/EventBus';
import {
  getCurrentPlaylist,
  NEXT_TRACK,
  PAUSE_PLAYER,
  PLAYER_ERROR,
  PLAY_PLAYER_START,
  PREVIOUS_TRACK,
  setCurrentPlaylist,
  SET_POSITION,
  START_CURRENT_PLAYLIST,
  TOGGLE_LOVED,
  TOGGLE_LOVED_UPDATED,
  TOGGLE_PLAY_PAUSE_PLAYER,
  TOGGLE_SHUFFLE,
  TOGGLE_SHUFFLE_UPDATED,
  UPDATE_PLAYER,
} from '../../utils/player';
import { SWITCH_ROUTE } from '../../utils/router';
import { getSettingByName, TOGGLE_SETTING } from '../../utils/settings';
import timeSpan from '../../utils/timespan';
import { albumsIcon } from '../icons/albums';
import { artistsIcon } from '../icons/artists';
import { chevronDownIcon } from '../icons/chevron-down';
import { chevronUpIcon } from '../icons/chevron-up';
import { heartIcon } from '../icons/heart';
import { nextIcon } from '../icons/next';
import { pauseIcon } from '../icons/pause';
import { playIcon } from '../icons/play';
import { playlistsIcon } from '../icons/playlists';
import { previousIcon } from '../icons/previous';
import { randomIcon } from '../icons/random';
import { volumeIcon } from '../icons/volume';

@customElement('now-playing')
export class NowPlaying extends LitElement {
  @property()
  route: string;
  @property({ type: Boolean })
  hasError: boolean;
  track: any;
  isShuffled: boolean;
  hasCanvas: boolean;
  smallArt: boolean;
  analyzer: any;
  accentColor: any;
  isBottomShown: boolean;
  playlist: any;
  _analyzer: any;
  _dataArray: any;
  _hearableBars: any;
  _player: any;
  @state()
  active = false;

  static get styles() {
    return [
      animationCSS,
      container,
      progress,
      buttons,
      controls,
      nowPlaying,
      smallMuted,
    ];
  }
  constructor() {
    super();
    this.route = '';
    this.isShuffled = false;
    this.hasCanvas = false;
    this.smallArt = false;
    this.isBottomShown = false;
    this.accentColor = '';
    this.playlist = null;
    this.hasError = false;
    this.addEventListener(
      '_player',
      (e: any) => {
        this._player = e.detail;
        this._visualize();
      },
      {
        passive: true,
        once: true,
      }
    );
    getSettingByName('visual').then((hasVisual: any) => {
      this.hasCanvas = !!hasVisual;
      this.requestUpdate();
    });
    getSettingByName('smallArt').then((smallArt: any) => {
      this.smallArt = !!smallArt;
      this.requestUpdate();
    });
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(UPDATE_PLAYER, this._doUpdate, this);
    EventBus.on(TOGGLE_LOVED_UPDATED, this._doUpdate, this);
    EventBus.on(TOGGLE_SHUFFLE_UPDATED, this._doToggleShuffleUpdated, this);
    EventBus.on(ACCENT_COLOR, this._doAccentColor, this);
    EventBus.on(TOGGLE_SETTING, this._doToggleSetting, this);
    EventBus.on(SWITCH_ROUTE, this.isActiveRoute, this);
    EventBus.on(PLAYER_ERROR, this._doHasError, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(UPDATE_PLAYER, this._doUpdate, this);
    EventBus.off(TOGGLE_LOVED_UPDATED, this._doUpdate, this);
    EventBus.off(TOGGLE_SHUFFLE_UPDATED, this._doToggleShuffleUpdated, this);
    EventBus.off(ACCENT_COLOR, this._doAccentColor, this);
    EventBus.off(TOGGLE_SETTING, this._doToggleSetting, this);
    EventBus.off(SWITCH_ROUTE, this.isActiveRoute, this);
    EventBus.off(PLAYER_ERROR, this._doHasError, this);
  }
  isActiveRoute(event: Event, route: string) {
    this.active = route === 'now-playing';
  }
  _doUpdate(target: any, data: any) {
    this._update(data);
  }
  _doToggleShuffleUpdated(target: any, isShuffled: boolean) {
    this.isShuffled = isShuffled;
    this.requestUpdate();
  }
  _doAccentColor(target: any, accentColor: string) {
    this.accentColor = accentColor;
  }
  _doToggleSetting(target: any, setting: any) {
    if (setting.setting === 'smallArt') {
      this.smallArt = setting.value;
      this.requestUpdate();
    }
    if (setting.setting === 'visual') {
      this.hasCanvas = setting.value;
      if (this.hasCanvas && !this._analyzer) {
        this._visualize();
      }
      this.requestUpdate();
    }
  }
  _doHasError(target: any, error: any) {
    this.hasError = error;
  }
  _visualize() {
    if (
      this.hasCanvas &&
      navigator.userAgent.indexOf('Mobi') === -1 &&
      this._player
    ) {
      const audioCtx = new ((window as any).AudioContext ||
        (window as any).webkitAudioContext)();
      this._analyzer = audioCtx.createAnalyser();
      const source = audioCtx.createMediaElementSource(this._player);
      const sampleRate = audioCtx.sampleRate;
      this._analyzer.fftSize = this._calculateFft(sampleRate);
      this._hearableBars = this._getHearableBars(
        sampleRate,
        this._analyzer.fftSize
      );
      source.connect(this._analyzer);
      source.connect(audioCtx.destination);
      this._dataArray = new Uint8Array(this._hearableBars);
      this._analyzer.getByteFrequencyData(this._dataArray);
      this.analyzer = window.requestAnimationFrame(this._draw.bind(this));
    }
  }
  _calculateFft(sampleRate: number): number {
    return Math.floor(sampleRate / 44100) * 128;
  }
  _getHearableBars(sampleRate: number, fftSize: number): number {
    const halfFFT = fftSize / 2;
    switch (sampleRate) {
      case 48000:
        return halfFFT - 1;
      case 88200:
        return halfFFT / 2;
      case 96000:
        return halfFFT / 2 - 2;
      case 176400:
        return halfFFT / 4;
      case 192000:
        return halfFFT / 4 - 4;
      case 352800:
        return halfFFT / 8;
      case 384000:
        return halfFFT / 8 - 8;
      case 705600:
        return halfFFT / 16;
      case 768000:
        return halfFFT / 16 - 16;
      default:
        return halfFFT;
    }
  }
  _draw() {
    setTimeout(() => {
      this.analyzer = window.requestAnimationFrame(this._draw.bind(this));
      // 30 FPS
    }, 1000 / 30);

    // re-get canvas
    const canvas = this.shadowRoot?.querySelector('canvas');
    if (canvas) {
      const WIDTH = canvas.offsetWidth;
      const HEIGHT = canvas.offsetHeight;

      if (WIDTH && HEIGHT) {
        const ctx = canvas.getContext('2d');
        this._analyzer.getByteFrequencyData(this._dataArray);
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        if (ctx) {
          ctx.clearRect(0, 0, WIDTH, HEIGHT);
          const color = this.accentColor || {
            r: 0,
            g: 110,
            b: 205,
            a: 1,
          };
          const barWidth = Math.floor((WIDTH / this._hearableBars) * 1.1);
          let barHeight;
          let x = 0;
          const y = (HEIGHT / 150) * 1.17;

          for (let i = 0; i < this._hearableBars; i++) {
            barHeight = this._dataArray[i] * y;
            ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${
              this._dataArray[i] / 255
            })`;
            ctx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
          }
        }
      }
    }
  }
  async _update({ current, type }: { current: any; type: string }) {
    this.track = current;
    if (type === PLAY_PLAYER_START || type === PAUSE_PLAYER) {
      const playlist: any = await getCurrentPlaylist();
      const tracks = playlist?.tracks.map((t: any) => {
        if (t.id === current.id) {
          return current;
        }
        return this._resetTrack(t);
      });
      playlist.tracks = tracks;
      this.playlist = playlist;
      this.requestUpdate();
    }
    this.requestUpdate();
  }
  _resetTrack(track: any) {
    const tmp = track;
    tmp.isPlaying = false;
    tmp.isPaused = false;
    return tmp;
  }
  _setPosition(e: any) {
    const clientX = e.clientX || e.changedTouches[0].clientX;
    const left = clientX;
    let time = 20; // padding
    // @ts-ignore
    time = time + this.shadowRoot?.querySelector('.time')?.clientWidth;
    const perc =
      (left - time) /
        // @ts-ignore
        this.shadowRoot?.querySelector('.progress')?.clientWidth || 0;
    const pos = Math.abs((this.track.duration / 1000) * perc);
    EventBus.emit(SET_POSITION, this, pos);
    // TODO: check if pos works
  }
  _previous() {
    animateCSS(this.shadowRoot?.querySelectorAll('h4, h5'), 'slideInDown');
    EventBus.emit(PREVIOUS_TRACK, this);
  }
  _togglePlayPause() {
    if (this.track.isPaused) {
      animateCSS(this.shadowRoot?.querySelectorAll('h4, h5'), 'slideInUp');
    }
    EventBus.emit(TOGGLE_PLAY_PAUSE_PLAYER, this);
  }
  _next() {
    animateCSS(this.shadowRoot?.querySelectorAll('h4, h5'), 'slideInUp');
    EventBus.emit(NEXT_TRACK, this);
  }
  async _setPlaylist(track: any) {
    let startIndex = 0;
    this.playlist.tracks.map((t: any, index: number) => {
      if (t.id === track.id) {
        startIndex = index;
      } else {
        t.isPlaying = false;
        t.isPaused = false;
      }
    });
    this.playlist.index = startIndex;
    await setCurrentPlaylist(this.playlist);
    this.requestUpdate();
    EventBus.emit(START_CURRENT_PLAYLIST, this);
  }
  _toggleLoved() {
    EventBus.emit(TOGGLE_LOVED, this);
  }
  _toggleShuffle() {
    EventBus.emit(TOGGLE_SHUFFLE, this);
  }
  _toggleView() {
    this.isBottomShown = !this.isBottomShown;
    this.requestUpdate();
  }
  _hasMoreDiscs() {
    return Object.keys(this.track.album.discs).length > 1;
  }
  render() {
    return html`
      ${this.active
        ? html` ${this.track
            ? html`
                <div
                  class="wrapper ${this.smallArt ? 'smallArt ' : ''} ${this
                    .isBottomShown
                    ? 'bottomShown '
                    : ''}"
                >
                  <div class="backdrop">
                    <album-art
                      objectFit="contain"
                      transparent
                      .album=${this.track.album.name}
                      .artist=${this.track.album.artist.albumArtist ||
                      this.track.album.artist.name}
                    ></album-art>
                  </div>
                  <div class="top">
                    <div class="image-wrapper">
                      <canvas
                        id="visualisation"
                        class="${this.hasCanvas ? 'active' : ''}"
                      ></canvas>
                      <div class="current-album-art">
                        <album-art
                          objectFit="contain"
                          transparent
                          .album=${this.track.album.name}
                          .artist=${this.track.album.artist.albumArtist ||
                          this.track.album.artist.name}
                        ></album-art>
                      </div>
                      <div class="floating-text-details">
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
                              .escapedName}/album/${this.track.album
                              .escapedName}"
                          >
                            ${this.track.album.name}
                          </app-link>
                          ${this._hasMoreDiscs()
                            ? html`<span class="small muted"
                                >(${this.track.disc})</span
                              >`
                            : nothing}
                        </h5>
                      </div>
                    </div>
                    ${this.hasError
                      ? html`<div class="error">Error loading music data</div>`
                      : html`<div class="controls-wrapper">
                            <div class="time-controls">
                              <span class="time start"
                                >${timeSpan(this.track.position)}</span
                              >
                              <div
                                class="progress"
                                @click=${(e: Event) => this._setPosition(e)}
                              >
                                <div
                                  class="progress-bar progress-buffered-bar"
                                  style=${styleMap({
                                    width:
                                      (this.track.buffered.end /
                                        this.track.duration) *
                                        100 +
                                      '%',
                                  })}
                                ></div>
                                <div
                                  class="progress-bar ${
                                    this.track.isPlaying ? '' : 'paused'
                                  }"
                                  style=${styleMap({
                                    width:
                                      (this.track.position /
                                        this.track.duration) *
                                        100 +
                                      '%',
                                  })}
                                ></div>
                              </div>
                              <span class="time stop"
                                >${timeSpan(this.track.duration)}</span
                              >
                            </div>
                            <div class="details-wrapper">
                              <div class="text-details">
                                <h4>${this.track.title}</h4>
                                <h5>
                                  <app-link
                                    inline
                                    href="/letter/${
                                      this.track.album.artist.letter
                                        .escapedLetter
                                    }/artist/${
                          this.track.album.artist.escapedName
                        }"
                                  >
                                    ${this.track.trackArtist}
                                  </app-link>
                                  &bull;
                                  <app-link
                                    inline
                                    href="/letter/${
                                      this.track.album.artist.letter
                                        .escapedLetter
                                    }/artist/${
                          this.track.album.artist.escapedName
                        }/album/${this.track.album.escapedName}"
                                  >
                                    ${this.track.album.name}
                                  </app-link>
                                </h5>
                              </div>
                              <div class="controls">
                                <button
                                  class="btn"
                                  @click=${() => this._previous()}
                                  aria-label="previous track"
                                >
                                  ${previousIcon}
                                </button>
                                <button
                                  class="btn"
                                  @click=${() => this._togglePlayPause()}
                                  aria-label="play or pause"
                                >
                                  ${this.track.isPlaying ? pauseIcon : playIcon}
                                </button>
                                <button
                                  class="btn"
                                  @click=${() => this._next()}
                                  aria-label="next track"
                                >
                                  ${nextIcon}
                                </button>
                                <button
                                  class="btn btn-toggle"
                                  @click=${() => this._toggleView()}
                                  aria-label="show or hide playlist"
                                >
                                  ${
                                    this.isBottomShown
                                      ? chevronDownIcon
                                      : chevronUpIcon
                                  }
                                </button>
                              </div>
                              <div class="controls controls-meta">
                                <button class="btn" style="display:none">
                                  ${volumeIcon}
                                </button>
                                <button
                                  class="btn ${
                                    this.track.isLoved ? 'active' : ''
                                  }"
                                  @click=${() => this._toggleLoved()}
                                  aria-label="love or unlove track"
                                >
                                  ${heartIcon}
                                </button>
                                <button
                                  class="btn ${this.isShuffled ? 'active' : ''}"
                                  @click=${() => this._toggleShuffle()}
                                  aria-label="shuffle or unshuffle playlist"
                                >
                                  ${randomIcon}
                                </button>
                              </div>
                            </div>
                          </div>
                    </div>`}
                  </div>
                  <div class="bottom">
                    <lit-virtualizer
                      .items=${this.playlist?.tracks}
                      .renderItem=${(track: any) => html`
                        <track-in-list
                          .track=${track}
                          .type=${this.playlist.type}
                          ?showAlbum=${true}
                          @click=${() => {
                            this._setPlaylist(track);
                          }}
                        ></track-in-list>
                      `}
                    ></lit-virtualizer>
                  </div>
                </div>
              `
            : html`
                <div class="container p-1">
                  <h3>Nothing is playing</h3>
                  <p>
                    This is where you'll see the song you're playing and songs
                    that are coming up.
                  </p>
                  <p>
                    Find an
                    <app-link href="/artists" inline
                      ><span class="icon">${artistsIcon}</span> artist</app-link
                    >
                    or
                    <app-link href="/albums" inline
                      ><span class="icon">${albumsIcon}</span>album</app-link
                    >that you want to play; or setup a
                    <app-link href="/playlists" inline
                      ><span class="icon">${playlistsIcon}</span
                      >playlist</app-link
                    >
                  </p>
                </div>
              `}`
        : nothing}
    `;
  }
}
