import { LitElement, customElement, html, css, property } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map';

import {
  getCurrentPlaylist,
  NEXT_TRACK,
  PAUSE_PLAYER,
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
import timeSpan from '../../utils/timespan';
import { getSettingByName } from '../../utils/settings';

import { nextIcon } from '../icons/next';
import { pauseIcon } from '../icons/pause';
import { playIcon } from '../icons/play';
import { previousIcon } from '../icons/previous';
import { randomIcon } from '../icons/random';
import { volumeIcon } from '../icons/volume';
import { heartIcon } from '../icons/heart';

import container from '../../styles/container';
import progress from '../../styles/progress-bar';
import controls from '../../styles/controls';
import { ACCENT_COLOR } from '../../utils/colour';
import { chevronUpIcon } from '../icons/chevron-up';
import { chevronDownIcon } from '../icons/chevron-down';
import { animationCSS, animateCSS } from '../../utils/animations';

@customElement('now-playing')
export class NowPlaying extends LitElement {
  @property()
  route: string;
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

  static get styles() {
    return css`
      ${animationCSS}
      .wrapper {
        color: var(--text-color);
        background: var(--background, #f8f9fa);
        position: fixed;
        top: 50px;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2;
        overflow: hidden;
      }
      .top {
        background: var(--background, #f8f9fa);
        z-index: 2;
        display: flex;
        flex-direction: column;
        height: calc(100vh - 50px);
        position: relative;
        transition: transform 0.2s ease-in-out;
      }
      .bottom {
        z-index: 1;
        display: block;
        position: absolute;
        left: 0px;
        top: 105px;
        right: 0px;
        height: calc(100vh - 155px);
        overflow-y: auto;
      }
      .bottomShown .top {
        transform: translateY(calc(-100vh + 135px));
      }
      .image-wrapper {
        flex-grow: 1;
        position: relative;
        max-height: calc(100vh - 50px - 135px);
      }
      .current-album-art {
        height: 100%;
        padding: 10px;
        box-sizing: border-box;
        margin: 0px auto;
        z-index: 1;
        position: relative;
      }
      .controls-wrapper {
        height: 135px;
        max-height: 135px;
        flex-grow: 0;
        padding: 0 10px;
        background: linear-gradient(
          to bottom,
          transparent 0%,
          var(--background) 100%
        );
        text-shadow: 0 0 3px var(--background3);
      }
      ${container}
      .container {
        display: block;
      }
      canvas {
        z-index: -1;
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        display: none;
      }
      canvas.active {
        display: block;
      }
      ${progress}
      .time-controls {
        display: flex;
        align-items: center;
      }
      .time {
        flex-grow: 0;
        white-space: nowrap;
      }
      .progress {
        flex-grow: 1;
        margin: 0 0.5rem;
      }
      h4 {
        font-weight: 400;
        font-size: 1.3rem;
        margin: 0;
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
      ${controls}
      .controls .btn {
        margin-left: 1rem;
        height: 45px;
        width: 45px;
      }
      .controls .btn svg {
        width: 20px;
      }
      .controls .btn-toggle {
        position: absolute;
        bottom: -11px;
        height: 25px;
      }
      .controls .btn-toggle:active {
        background: none;
      }
      .details-wrapper {
        display: flex;
        flex-direction: column;
        position: relative;
      }
      .text-details {
        width: 100%;
      }
      .controls {
        justify-content: center;
      }
      .controls-meta {
        justify-content: flex-end;
        position: absolute;
        bottom: 4px;
        right: -10px;
        padding-right: 0;
      }
      .controls-meta .btn {
        margin-left: 0.5rem;
        height: 35px;
        width: 35px;
      }
      .controls-meta .btn svg {
        width: 15x;
      }
      .floating-text-details {
        display: none;
        position: absolute;
        left: 220px;
        bottom: 10px;
        text-shadow: 0 0 3px #f8f9fa;
        max-width: calc(100vw - 220px);
      }
      .floating-text-details h4 {
        font-size: 3rem;
        font-weight: 300;
      }
      .floating-text-details h5 {
        font-size: 2rem;
        font-weight: 400;
      }
      .floating-text-details app-link {
        text-shadow: 0px 0px 1px var(--primary, #006ecd);
        transition: all 0.2s ease-in-out 0s;
      }
      .bottom lit-virtualizer {
        height: calc(100vh - 155px);
      }
      .bottom lit-virtualizer track-in-list {
        width: 100%;
        cursor: pointer;
      }
      @media (min-width: 576px) {
        .details-wrapper {
          flex-direction: row;
        }
        .image-wrapper {
          max-height: calc(100vh - 50px - 85px);
        }
        .text-details {
          width: 33%;
          flex-grow: 0;
        }
        .controls {
          width: 33%;
          flex-grow: 1;
          padding-right: 0;
        }
        .controls-meta {
          position: static;
        }
        .controls-meta .btn {
          margin-left: 1rem;
          height: 45px;
          width: 45px;
        }
        .controls-meta .btn svg {
          width: 20x;
        }
        .small .controls-wrapper {
          height: 85px;
          max-height: 85px;
        }
        .small .current-album-art {
          height: 200px;
          width: 200px;
          margin: 0;
          bottom: 0.5rem;
          left: 0.5rem;
          position: absolute;
          padding: 0;
          border: 1px solid var(--background3, #f3f4f5);
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0px 0px 1px var(--primary, #006ecd);
        }
        .small canvas {
          height: calc(100vh - 50px);
        }
        .small .floating-text-details {
          display: block;
        }
        .small .text-details {
          opacity: 0;
        }
        .bottom lit-virtualizer {
          padding: 0 10vw;
        }
        .bottom lit-virtualizer track-in-list {
          width: 80vw;
        }
      }
      /* notihng is playing */
      h3 {
        padding-top: 1.5rem;
        font-weight: normal;
      }
      app-link {
        color: var(--primary, #006ecd);
        transition: color 0.2s ease-in-out;
      }
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
          background-color: var(--progress-background, #F3F4F5);
      }
      ::-webkit-scrollbar-thumb {
          background-color: var(--progress, #006ecd);
      }
    `;
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
    this.addEventListener(
      UPDATE_PLAYER,
      (e: any) => {
        this._update(e.detail);
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      TOGGLE_LOVED_UPDATED,
      (e: any) => {
        this._update({ ...this.track, isLoved: e.detail });
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      TOGGLE_SHUFFLE_UPDATED,
      (e: any) => {
        this.isShuffled = e.detail;
        this.requestUpdate();
      },
      {
        passive: true,
      }
    );
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
    this.addEventListener(ACCENT_COLOR, (e: any) => {
      this.accentColor = e.detail;
    });
    getSettingByName('visual').then((hasVisual: any) => {
      this.hasCanvas = !!hasVisual;
      this.requestUpdate();
    });
    getSettingByName('smallArt').then((smallArt: any) => {
      this.smallArt = !!smallArt;
      this.requestUpdate();
    });
  }
  _visualize() {
    if (this.hasCanvas && navigator.userAgent.indexOf('Mobi') === -1) {
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
  async _update({ track, type}: { track: any, type: string}) {
    this.track = track;
    if (type === PLAY_PLAYER_START || type === PAUSE_PLAYER) {
      const playlist:any = await getCurrentPlaylist();
      const tracks = playlist?.tracks.map((t: any) => {
        if (t.id === track.id) {
          return track;
        }
        return this._resetTrack(t);
      })
      playlist.tracks = tracks;
      this.playlist = playlist;
      this.requestUpdate();
    }
    this.requestUpdate();
  }
  _resetTrack(track:any) {
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
    document
      .querySelector('lit-musicdb')
      ?.dispatchEvent(new CustomEvent(SET_POSITION, { detail: pos }));
  }
  _previous() {
    animateCSS(this.shadowRoot?.querySelectorAll('h4, h5'), 'slideInDown')
    document
      .querySelector('lit-musicdb')
      ?.dispatchEvent(new CustomEvent(PREVIOUS_TRACK));
  }
  _togglePlayPause() {
    if (this.track.isPaused) {
      animateCSS(this.shadowRoot?.querySelectorAll('h4, h5'), 'slideInUp')
    }
    document
      .querySelector('lit-musicdb')
      ?.dispatchEvent(new CustomEvent(TOGGLE_PLAY_PAUSE_PLAYER));
  }
  _next() {
    animateCSS(this.shadowRoot?.querySelectorAll('h4, h5'), 'slideInUp')
    document
      .querySelector('lit-musicdb')
      ?.dispatchEvent(new CustomEvent(NEXT_TRACK));
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
    document
      .querySelector('lit-musicdb')
      ?.dispatchEvent(new CustomEvent(START_CURRENT_PLAYLIST));
  }
  _toggleLoved() {
    document
      .querySelector('lit-musicdb')
      ?.dispatchEvent(new CustomEvent(TOGGLE_LOVED));
  }
  _toggleShuffle() {
    document
      .querySelector('lit-musicdb')
      ?.dispatchEvent(new CustomEvent(TOGGLE_SHUFFLE));
  }
  _toggleView() {
    this.isBottomShown = !this.isBottomShown;
    this.requestUpdate();
  }
  render() {
    return html`
      ${this.track
        ? html`
            <div class="wrapper ${this.smallArt ? 'small ' : ''} ${this.isBottomShown ? 'bottomShown ' : ''}">
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
                      .artist=${this.track.trackArtist}
                    ></album-art>
                  </div>
                  <div class="floating-text-details">
                    <h4>${this.track.title}</h4>
                    <h5>
                      <app-link
                        inline text
                        href="/letter/${this.track.album.artist.letter
                          .escapedLetter}/artist/${this.track.album.artist
                          .escapedName}"
                      >
                        ${this.track.trackArtist}
                      </app-link>
                      &bull;
                      <app-link
                        inline text
                        href="/letter/${this.track.album.artist.letter
                          .escapedLetter}/artist/${this.track.album.artist
                          .escapedName}/album/${this.track.album.escapedName}"
                      >
                        ${this.track.album.name}
                      </app-link>
                    </h5>
                  </div>
                </div>
                <div class="controls-wrapper">
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
                            (this.track.buffered.end / this.track.duration) *
                              100 +
                            '%',
                        })}
                      ></div>
                      <div
                        class="progress-bar"
                        style=${styleMap({
                          width:
                            (this.track.position / this.track.duration) * 100 +
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
                      <button
                        class="btn"
                        @click=${() => this._togglePlayPause()}
                      >
                        ${this.track.isPlaying ? pauseIcon : playIcon}
                      </button>
                      <button class="btn" @click=${() => this._next()}>
                        ${nextIcon}
                      </button>
                      <button class="btn btn-toggle" @click=${() => this._toggleView()}>
                        ${this.isBottomShown ? chevronDownIcon : chevronUpIcon}
                      </button>
                    </div>
                    <div class="controls controls-meta">
                      <button class="btn" style="display:none">
                        ${volumeIcon}
                      </button>
                      <button
                        class="btn ${this.track.isLoved ? 'active' : ''}"
                        @click=${() => this._toggleLoved()}
                      >
                        ${heartIcon}
                      </button>
                      <button
                        class="btn ${this.isShuffled ? 'active' : ''}"
                        @click=${() => this._toggleShuffle()}
                      >
                        ${randomIcon}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bottom">
                <lit-virtualizer
                  .items=${this.playlist.tracks}
                  .renderItem=${(track: any) => html`
                    <track-in-list
                        .track=${track}
                        .type=${this.playlist.type}
                        @click=${() => { this._setPlaylist(track)}}
                      ></track-in-list>
                  `}></lit-virtualizer>
              </div>
            </div>
          `
        : html`
            <div class="container">
              <h3>Nothing is playing</h3>
              <p>
                This is where you'll see the song you're playing and songs that
                are coming up.
              </p>
              <p>
                Find an <app-link href="/artists" inline>artist</app-link> or
                <app-link href="/albums" inline>album</app-link>that you want to
                play; or setup a
                <app-link href="/playlists" inline>playlist</app-link>
              </p>
            </div>
          `}
    `;
  }
}
