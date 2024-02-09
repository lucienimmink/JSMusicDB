import timeSpan from '@addasoft/timespan';
import '@lit-labs/virtualizer';
import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import AudioMotionAnalyzer from 'audiomotion-analyzer';
import buttons from '../../styles/buttons';
import container from '../../styles/container';
import controls from '../../styles/controls';
import nowPlaying from '../../styles/now-playing';
import progress from '../../styles/progress-bar';
import smallMuted from '../../styles/small-muted';
import { global as EventBus } from '../../utils/EventBus';
import { animateCSS, animationCSS } from '../../utils/animations';
import { ACCENT_COLOR } from '../../utils/colour';
import {
  NEXT_TRACK,
  PAUSE_PLAYER,
  PLAYER_ERROR,
  PLAY_PLAYER_START,
  PREVIOUS_TRACK,
  SET_POSITION,
  START_CURRENT_PLAYLIST,
  TOGGLE_LOVED,
  TOGGLE_LOVED_UPDATED,
  TOGGLE_PLAY_PAUSE_PLAYER,
  TOGGLE_SHUFFLE,
  TOGGLE_SHUFFLE_UPDATED,
  UPDATE_PLAYER,
  getCurrentPlaylist,
  setCurrentPlaylist,
} from '../../utils/player';
import { TOGGLE_SETTING, getSettingByName } from '../../utils/settings';
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
import('./../track/track.js');

@customElement('now-playing')
export class NowPlaying extends LitElement {
  @property()
  route: string;
  @property({ type: Boolean })
  hasError: boolean;
  @state()
  track: any;
  @state()
  isShuffled: boolean;
  @state()
  hasCanvas: boolean;
  @state()
  smallArt: boolean;
  @state()
  classicVis: boolean;
  analyzer: any;
  accentColor: any;
  @state()
  isBottomShown: boolean;
  @state()
  playlist: any;
  _analyzer: any;
  _dataArray: any;
  _hearableBars: any;
  _player: any;
  touchstartX: number;
  touchstartY: number;
  visualizer: AudioMotionAnalyzer | undefined;

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
    this.classicVis = false;
    this.isBottomShown = false;
    this.playlist = null;
    this.hasError = false;
    this.track = window._track;
    this._player = window._player;
    this.accentColor = window._accentColour;
    this.touchstartX = 0;
    this.touchstartY = 0;
    getSettingByName('visual').then(async (hasVisual: any) => {
      this.hasCanvas = !!hasVisual;
    });
    getSettingByName('classicVis').then(async (classicVis: any) => {
      this.classicVis = !!classicVis;
    });
    getSettingByName('smallArt').then((smallArt: any) => {
      this.smallArt = !!smallArt;
    });
    setTimeout(() => {
      this._visualize();
    }, 100);
    this._updatePlaylist();
  }
  async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async connectedCallback() {
    super.connectedCallback();
    EventBus.on(TOGGLE_SHUFFLE_UPDATED, this._doToggleShuffleUpdated, this);
    EventBus.on(ACCENT_COLOR, this._doAccentColor, this);
    EventBus.on(PLAYER_ERROR, this._doHasError, this);
    EventBus.on(UPDATE_PLAYER, this._doUpdate, this);
    EventBus.on(TOGGLE_SETTING, this._doToggleSetting, this);
    this.track = window._track;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.visualizer?.destroy();
    EventBus.off(UPDATE_PLAYER, this._doUpdate, this);
    EventBus.off(TOGGLE_LOVED_UPDATED, this._doUpdate, this);
    EventBus.off(TOGGLE_SHUFFLE_UPDATED, this._doToggleShuffleUpdated, this);
    EventBus.off(ACCENT_COLOR, this._doAccentColor, this);
    EventBus.off(TOGGLE_SETTING, this._doToggleSetting, this);
    EventBus.off(PLAYER_ERROR, this._doHasError, this);
  }
  _doUpdate(target: any, data: any) {
    this._update(data);
  }
  _doToggleShuffleUpdated(target: any, isShuffled: boolean) {
    this.isShuffled = isShuffled;
  }
  _doAccentColor(target: any, accentColor: any) {
    this.accentColor = accentColor;
    if (this.hasCanvas) {
      this._doApplyAccentColorToVisualizer();
    }
  }
  _doApplyAccentColorToVisualizer() {
    if (this.classicVis) return;
    const color = this.accentColor || {
      r: 0,
      g: 110,
      b: 205,
    };
    // register new gradient based on the current accentColor
    this.visualizer?.registerGradient('accentColor', {
      bgColor: 'transparent',
      dir: 'h',
      colorStops: [`rgb(${color.r}, ${color.g}, ${color.b})`],
    });
    // and apply it
    this.visualizer?.setOptions({
      gradient: 'accentColor',
    });
  }
  _doToggleSetting(target: any, setting: any) {
    if (setting.setting === 'smallArt') {
      this.smallArt = setting.value;
    }
    if (setting.setting === 'visual') {
      this.hasCanvas = setting.value;
      this._visualize();
    }
    if (setting.setting === 'classicVis') {
      this.classicVis = setting.value;
      this._visualize();
    }
  }
  _doHasError(target: any, error: any) {
    this.hasError = error;
  }
  _visualize() {
    if (this.hasCanvas) {
      const canvas = this.shadowRoot?.querySelector(
        '#visualisation',
      ) as HTMLCanvasElement;
      if (canvas) {
        let source;
        if (!window._source) {
          const audioCtx = new AudioContext();
          source = audioCtx.createMediaElementSource(window._player);
          source.connect(audioCtx.destination);

          // store in memory for reuse
          window._source = source;
        } else {
          source = window._source;
        }
        this.visualizer = new AudioMotionAnalyzer(canvas, {
          source,
          alphaBars: !this.classicVis,
          bgAlpha: 0,
          channelLayout: 'single',
          colorMode: this.classicVis ? 'gradient' : 'bar-level',
          gradient: this.classicVis ? 'classic' : 'steelblue',
          ledBars: this.classicVis,
          mode: this.classicVis ? 5 : 4,
          smoothing: 0.7,
          overlay: true,
          connectSpeakers: false,
          showPeaks: true,
          showScaleX: false,
          showScaleY: false,
          reflexRatio: this.classicVis ? 0.035 : 0,
          maxFPS: 60,
          maxDecibels: -27,
        });
        if (!this.classicVis) {
          this._doApplyAccentColorToVisualizer();
        }
      }
    }
  }
  async _updatePlaylist() {
    const playlist: any = await getCurrentPlaylist();
    const tracks = playlist?.tracks.map((t: any) => {
      if (t.id === this.track?.id) {
        return this.track;
      }
      return this._resetTrack(t);
    });
    playlist.tracks = tracks;
    this.playlist = playlist;
  }
  private _getPreviousTrack() {
    const currentIndex = this.playlist?.tracks.lastIndexOf(this.track) || 0;
    console.log({ currentIndex });
    if (currentIndex > 0) {
      return this.playlist?.tracks[currentIndex - 1];
    }
    return this.track;
  }
  private _getNextTrack() {
    return this.track;
  }
  async _update({ current, type }: { current: any; type: string }) {
    this.track = current;
    if (type === PLAY_PLAYER_START || type === PAUSE_PLAYER) {
      await this._updatePlaylist();
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
    animateCSS(
      this.shadowRoot?.querySelectorAll('.previous-album-art'),
      'slideInLeft',
    );
    animateCSS(
      this.shadowRoot?.querySelectorAll('.current-album-art'),
      'fadeIn',
    );
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
    animateCSS(
      this.shadowRoot?.querySelectorAll('.next-album-art'),
      'slideInRight',
    );
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
    EventBus.emit(START_CURRENT_PLAYLIST, this);
    this.requestUpdate();
  }
  _toggleLoved() {
    EventBus.emit(TOGGLE_LOVED, this);
  }
  _toggleShuffle() {
    EventBus.emit(TOGGLE_SHUFFLE, this);
  }
  _toggleView() {
    this.isBottomShown = !this.isBottomShown;
  }
  _hasMoreDiscs() {
    return Object.keys(this.track.album.discs).length > 1;
  }
  _handleTouchStart = (e: any) => {
    this.touchstartX = e.changedTouches[0].screenX;
    this.touchstartY = e.changedTouches[0].screenY;
  };
  _handleTouchEnd = (e: any) => {
    const x = e.changedTouches[0].screenX;
    const y = e.changedTouches[0].screenY;

    const ratio = {
      x: Math.abs(x - this.touchstartX) / Math.abs(y - this.touchstartY),
      y: Math.abs(y - this.touchstartY) / Math.abs(x - this.touchstartX),
    };

    if (ratio.y > 6) {
      // swipe up or down
      e.stopImmediatePropagation();
      y > this.touchstartY
        ? (this.isBottomShown = false)
        : (this.isBottomShown = true);
    } else if (ratio.x > 3) {
      // swipe left or right
      e.stopImmediatePropagation();
      x > this.touchstartX ? this._previous() : this._next();
    }
    return true;
  };
  private _renderBackdrop() {
    return html`<div class="backdrop">
      <album-art
        objectFit="cover"
        transparent
        no-lazy
        static
        .album=${this.track.album.name}
        .artist=${this.track.album.artist.albumArtist ||
        this.track.album.artist.name}
      ></album-art>
    </div>`;
  }
  private _renderArt(track: any, position: string = 'current') {
    return html`<div class="${position}-album-art album-art">
      <album-art
        objectFit="contain"
        transparent
        static
        .album=${track.album.name}
        .artist=${track.album.artist.albumArtist || track.album.artist.name}
      ></album-art>
    </div>`;
  }
  private _renderFloatingText() {
    return html`<div class="floating-text-details">
      <h4>${this.track.title}</h4>
      <h5>
        <app-link
          inline
          href="/letter/${this.track.album.artist.letter
            .escapedLetter}/artist/${this.track.album.artist.escapedName}"
        >
          ${this.track.trackArtist}
        </app-link>
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
      </h5>
    </div>`;
  }
  private _renderErrorState() {
    return html`<div class="error">Error loading music data</div>`;
  }
  private _renderTimeControls() {
    return html`<div class="time-controls">
      <span class="time start">${timeSpan(this.track.position)}</span>
      <div class="progress" @click=${(e: Event) => this._setPosition(e)}>
        <div
          class="progress-bar progress-buffered-bar"
          style=${styleMap({
            '--progress-perc':
              (this.track.buffered.end / this.track.duration) * 100 + '%',
          })}
        ></div>
        <div
          class="progress-bar ${this.track.isPlaying ? '' : 'paused'}"
          style=${styleMap({
            '--progress-perc':
              (this.track.position / this.track.duration) * 100 + '%',
          })}
        ></div>
      </div>
      <span class="time stop">${timeSpan(this.track.duration)}</span>
    </div>`;
  }
  private _renderTextDetails() {
    return html`<div class="text-details">
      <h4>${this.track.title}</h4>
      <h5>
        <app-link
          inline
          href="/letter/${this.track.album.artist.letter
            .escapedLetter}/artist/${this.track.album.artist.escapedName}"
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
    </div>`;
  }
  private _renderMainControls() {
    return html`<div class="controls">
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
      <button class="btn" @click=${() => this._next()} aria-label="next track">
        ${nextIcon}
      </button>
      <button
        class="btn btn-toggle"
        @click=${() => this._toggleView()}
        aria-label="show or hide playlist"
      >
        ${this.isBottomShown ? chevronDownIcon : chevronUpIcon}
      </button>
    </div>`;
  }
  private _renderMetaControls() {
    return html`<div class="controls controls-meta">
      <button class="btn" style="display:none">${volumeIcon}</button>
      <button
        class="btn ${this.track.isLoved ? 'active' : ''}"
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
    </div>`;
  }
  private _renderTop() {
    return html`<div
      class="top ${this.classicVis ? 'classic-vis' : ''}"
      @touchstart=${this._handleTouchStart}
      @touchend=${this._handleTouchEnd}
    >
      <div class="image-wrapper">
        <div id="visualisation" class="${this.hasCanvas ? 'active' : ''}"></div>
        ${this._renderArt(this._getPreviousTrack(), 'previous')}
        ${this._renderArt(this.track)} ${this._renderFloatingText()}
        ${this._renderArt(this._getNextTrack(), 'next')}
      </div>
      ${this.hasError
        ? this._renderErrorState()
        : html`<div class="controls-wrapper ${
            this.classicVis ? 'classic-vis' : ''
          }">
                            ${this._renderTimeControls()}
                            <div class="details-wrapper">
                              ${this._renderTextDetails()}
                              ${this._renderMainControls()}
                              ${this._renderMetaControls()}
                            </div>
                          </div>
                    </div>`}
    </div>`;
  }
  private _renderTrack(track: any) {
    return html`<track-in-list
      .track=${track}
      type=${this.playlist.type}
      ?showAlbum=${true}
      @click=${() => {
        this._setPlaylist(track);
      }}
    ></track-in-list>`;
  }
  private _renderBottom() {
    return html`<div class="bottom">
      <div class="playlist">
        <lit-virtualizer
          .scrollTarget=${window}
          .items=${this.playlist?.tracks}
          .renderItem=${(track: any) => this._renderTrack(track)}
        >
        </lit-virtualizer>
      </div>
    </div>`;
  }
  private _renderNothingPlaying() {
    return html`
      <div class="container p-1">
        <h3>Nothing is playing</h3>
        <p>
          This is where you can see what's currently playing and what is coming
          up next.
        </p>
        <p>
          Find an
          <app-link href="/artists" inline
            ><span class="icon">${artistsIcon}</span>artist</app-link
          >
          or
          <app-link href="/albums" inline
            ><span class="icon">${albumsIcon}</span>album</app-link
          >that you want to play. Or explore a
          <app-link href="/playlists/current" inline
            ><span class="icon">${playlistsIcon}</span>playlist</app-link
          >
        </p>
      </div>
    `;
  }
  render() {
    if (this.track) {
      return html`
        <div
          class="wrapper ${this.smallArt ? 'smallArt ' : ''} ${this
            .isBottomShown
            ? 'bottomShown '
            : ''}"
        >
          ${this._renderBackdrop()} ${this._renderTop()} ${this._renderBottom()}
        </div>
      `;
    } else {
      return this._renderNothingPlaying();
    }
  }
}
