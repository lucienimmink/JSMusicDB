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
    getJwt().then((jwt: any) => {
      if (jwt) {
        getServer().then(async (server: any) => {
          const capableOfSSE = (await canUseSSE(server)) && window.EventSource;
          if (capableOfSSE) {
            this._sse({ server, jwt });
          } else {
            this._poll({ server, jwt });
          }
        });
      }
    });
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
  }
  disconnectedCallback() {
    super.disconnectedCallback();
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
  _sse = ({ server: server, jwt: jwt }: { server: any; jwt: any }) => {
    setupStream(server, jwt).then((stream: any) => {
      stream.onmessage = (event: any) => {
        try {
          const { progress, status } = JSON.parse(event.data);
          this._updateProgress(progress, status);
        } catch (e) {
          console.error(e);
          // ignore
        }
      };
      stream.onopen = () => {
        EventBus.emit(HAS_SSE, this, true);
      };
      stream.onerror = () => {
        EventBus.emit(HAS_SSE, this, false);
      };
    });
  };
  _poll = ({ server, jwt }: { server: any; jwt: any }) => {
    getProgress(server, jwt).then(
      ({ progress, status }: { progress: any; status: any }) => {
        this._updateProgress(progress, status);
        if (status !== 'error') {
          setTimeout(() => {
            this._poll({ server, jwt });
          }, POLL_INTERVALL);
        }
      },
    );
  };
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
    return html`${this.isReloading
      ? html`${!this.customWindowsControl
          ? html`<progress-spinner>${this.progress}</progress-spinner>`
          : html`<progress-bar progress="${this.progressInt}"
              >${this.progress}</progress-bar
            >`}`
      : nothing}`;
  }
  render() {
    return html`<h1
      class="${this.customWindowsControl ? 'customWindowControls' : ''} ${this
        .route === '/playing'
        ? 'playing'
        : ''}"
    >
      <button @click=${this._toggleMenu} title="open menu">${barsIcon}</button>
      <div>
        ${this.alb
          ? html`
              <span class="md-up">
                <app-link
                  inline
                  href="/letter/${this.alb.artist.letter
                    .escapedLetter}/artist/${this.alb.artist.escapedName}"
                  >${this.alb.artist.albumArtist ||
                  this.alb.artist.name}</app-link
                >
                <span>• </span></span
              ><span class="album">${this.alb.name}</span>
            `
          : nothing}
        ${this.art && !this.alb
          ? html`${this.art.albumArtist || this.art.name}`
          : nothing}
        ${!this.alb && !this.art ? html`JSMusicDB` : nothing}
      </div>
      ${this._renderReloading()}
    </h1>`;
  }
}
