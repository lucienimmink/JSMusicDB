import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import header from '../../styles/header';
import responsive from '../../styles/responsive';
import { global as EventBus } from '../../utils/EventBus';
import {
  canUseSSE,
  DONE_RELOADING,
  getJwt,
  getProgress,
  getServer,
  HAS_SSE,
  IS_RELOADING,
  POLL_INTERVALL,
  setupStream,
} from '../../utils/node-mp3stream';
import { CHANGE_TITLE } from '../../utils/player';
import { barsIcon } from '../icons/bars';
import musicdb from '../musicdb';
import { TOGGLE_MENU } from '../side-nav/side-nav';
import './../app-link/app-link';

type ProgressConnection = {
  server: string;
  jwt: string;
  generation: number;
};

@customElement('main-header')
export class Header extends LitElement {
  @property()
  artist: string;
  @property()
  album: string;
  @property()
  route: string;

  @state()
  art: any;
  @state()
  alb: any;
  @state()
  isReloading: boolean;
  @state()
  progress: string;
  @state()
  titleData: any;
  @state()
  customWindowsControl: boolean;
  @state()
  progressInt: number;
  @state()
  dynamicTitle: string;
  private progressStream: EventSource | undefined;
  private pollTimer: number | undefined;
  private progressGeneration = 0;

  static get styles() {
    return [responsive, header];
  }
  constructor() {
    super();
    this.artist = '';
    this.album = '';
    this.route = '';
    this.art = null;
    this.alb = null;
    this.isReloading = false;
    this.progress = '';
    this.progressInt = 0;
    this.dynamicTitle = '';
    this.customWindowsControl =
      // @ts-ignore
      navigator?.windowControlsOverlay?.visible || false;
  }
  _toggleMenu = (e: Event) => {
    e.preventDefault();
    EventBus.emit(TOGGLE_MENU, this);
  };
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(CHANGE_TITLE, this._doChangeTitle, this);
    // @ts-ignore
    if (navigator.windowControlsOverlay) {
      // @ts-ignore
      navigator.windowControlsOverlay.addEventListener(
        'geometrychange',
        this._changeCustomWindowControls,
      );
    }
    void this._startProgressUpdates();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopProgressUpdates();
    EventBus.off(CHANGE_TITLE, this._doChangeTitle, this);
    // @ts-ignore
    if (navigator.windowControlsOverlay) {
      // @ts-ignore
      navigator.windowControlsOverlay.removeEventListener(
        'geometrychange',
        this._changeCustomWindowControls,
      );
    }
  }
  // @ts-ignore
  _doChangeTitle(target: any, data: any) {
    this._changeTitle(data);
    this.setDocumentTitle();
  }
  _changeTitle = (data: any = {}) => {
    let dynamicTitle = '';
    if (this.isReloading) {
      dynamicTitle = this.progress;
    }
    if (data?.title) {
      this.titleData = data;
    }
    if (this.titleData?.title) {
      dynamicTitle = `${this.titleData.title} by ${this.titleData.artist}`;
    }
    this.dynamicTitle = dynamicTitle || 'JSMusicDB';
  };
  _changeCustomWindowControls = () => {
    this.customWindowsControl =
      // @ts-ignore
      navigator?.windowControlsOverlay?.visible || false;
    this.setDocumentTitle();
  };
  private async _startProgressUpdates() {
    const generation = ++this.progressGeneration;
    try {
      const jwt = await getJwt();
      if (!jwt || !this._isCurrentProgressConnection(generation)) return;

      const server = await getServer();
      if (!server || !this._isCurrentProgressConnection(generation)) return;

      let supportsSSE = false;
      try {
        supportsSSE = await canUseSSE(server);
      } catch (error) {
        console.error('Unable to check progress stream support:', error);
      }
      if (!this._isCurrentProgressConnection(generation)) return;

      const connection = { server, jwt, generation };
      if (supportsSSE && window.EventSource) {
        await this._sse(connection);
      } else {
        void this._poll(connection);
      }
    } catch (error) {
      console.error('Unable to start progress updates:', error);
    }
  }
  private _isCurrentProgressConnection(generation: number) {
    return this.isConnected && this.progressGeneration === generation;
  }
  private _stopProgressUpdates() {
    this.progressGeneration++;
    this.progressStream?.close();
    this.progressStream = undefined;
    if (this.pollTimer !== undefined) {
      window.clearTimeout(this.pollTimer);
      this.pollTimer = undefined;
    }
  }
  private async _sse({ server, jwt, generation }: ProgressConnection) {
    const stream = await setupStream(server, jwt);
    if (!this._isCurrentProgressConnection(generation)) {
      stream.close();
      return;
    }

    this.progressStream = stream;
    stream.onmessage = (event: MessageEvent) => {
      try {
        const { progress, status } = JSON.parse(event.data);
        this._updateProgress(progress, status);
      } catch (error) {
        console.error('Unable to parse progress update:', error);
      }
    };
    stream.onopen = () => {
      EventBus.emit(HAS_SSE, this, true);
    };
    stream.onerror = () => {
      EventBus.emit(HAS_SSE, this, false);
    };
  }
  private async _poll(connection: ProgressConnection) {
    const { server, jwt, generation } = connection;
    try {
      const { progress, status } = await getProgress(server, jwt);
      if (!this._isCurrentProgressConnection(generation)) return;

      this._updateProgress(progress, status);
      if (status !== 'error') this._schedulePoll(connection);
    } catch (error) {
      if (!this._isCurrentProgressConnection(generation)) return;
      console.error('Unable to poll progress:', error);
    }
  }
  private _schedulePoll(connection: ProgressConnection) {
    if (!this._isCurrentProgressConnection(connection.generation)) return;

    this.pollTimer = window.setTimeout(() => {
      this.pollTimer = undefined;
      void this._poll(connection);
    }, POLL_INTERVALL);
  }
  _updateProgress = (progress: string, status: string) => {
    if (status !== 'ready' && status !== 'error') {
      this.isReloading = true;
      this.progress = progress ? `${progress}%` : 'scan';
      this.progressInt = parseInt(progress);
      this._changeTitle();
      EventBus.emit(IS_RELOADING, this);
    } else if (this.isReloading === true) {
      EventBus.emit(DONE_RELOADING, this);
      this.isReloading = false;
      this._changeTitle();
    }
  };
  private setDocumentTitle() {
    document.title = !this.customWindowsControl
      ? this.dynamicTitle
      : 'JSMusicDB';
  }

  async attributeChangedCallback(name: any, oldval: any, newval: any) {
    super.attributeChangedCallback(name, oldval, newval);
    const mdb: any = await musicdb;
    switch (name) {
      case 'album':
        if (newval !== 'undefined') {
          const albumDetails = mdb.albums[`${this.artist}|${this.album}`];
          this.alb = albumDetails;
        } else {
          this.alb = null;
        }
        break;
      case 'artist':
        if (newval !== 'undefined') {
          const artistDetails = mdb.artists[this.artist];
          this.art = artistDetails;
        } else {
          this.art = null;
        }
        break;
    }
  }
  private _renderReloading() {
    return html`${
      this.isReloading
        ? html`${
            !this.customWindowsControl
              ? html`<progress-spinner>${this.progress}</progress-spinner>`
              : html`<progress-bar progress="${this.progressInt}"
                  >${this.progress}</progress-bar
                >`
          }`
        : nothing
    }`;
  }
  render() {
    return html`<h1
      class="${this.customWindowsControl ? 'customWindowControls' : ''} ${
        this.route === '/playing' ? 'playing' : ''
      }"
    >
      <button @click=${this._toggleMenu} title="open menu">${barsIcon}</button>
      <div>
        ${
          this.alb
            ? html`
                <span class="md-up">
                  <app-link
                    inline
                    href="/letter/${
                      this.alb.artist.letter.escapedLetter
                    }/artist/${this.alb.artist.escapedName}"
                    >${
                      this.alb.artist.albumArtist || this.alb.artist.name
                    }</app-link
                  >
                  <span>• </span></span
                ><span class="album">${this.alb.name}</span>
              `
            : nothing
        }
        ${
          this.art && !this.alb
            ? html`${this.art.albumArtist || this.art.name}`
            : nothing
        }
        ${!this.alb && !this.art ? html`JSMusicDB` : nothing}
      </div>
      ${this._renderReloading()}
    </h1>`;
  }
}
