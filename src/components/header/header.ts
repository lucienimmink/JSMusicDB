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
        this._changeCustomWindowControls
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
        this._changeCustomWindowControls
      );
    }
  }
  _doChangeTitle(target: any, data: any) {
    this._changeTitle(data);
    if (!this.customWindowsControl) document.title = this.dynamicTitle;
  }
  _changeTitle = (data: any = {}) => {
    const dynamic = [];
    if (this.isReloading) {
      dynamic.push(this.progress);
    }
    if (data?.title) {
      this.titleData = data;
    }
    if (this.titleData?.title) {
      dynamic.push(`${this.titleData.title} by ${this.titleData.artist}`);
    }
    if (dynamic.length > 0) {
      dynamic.push(''); // for the trailing bullit
    }
    this.dynamicTitle = `${dynamic.join(' • ')}JSMusicDB`;
  };
  _changeCustomWindowControls = () => {
    this.customWindowsControl =
      // @ts-ignore
      navigator?.windowControlsOverlay?.visible || false;
    if (!this.customWindowsControl) document.title = this.dynamicTitle;
  };
  _sse = ({ server: server, jwt: jwt }: { server: any; jwt: any }) => {
    setupStream(server, jwt).then((stream: any) => {
      stream.onmessage = (event: any) => {
        try {
          const { progress, status } = JSON.parse(event.data);
          this._updateProgress(progress, status);
        } catch (e) {
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
      }
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
  attributeChangedCallback(name: any, oldval: any, newval: any) {
    musicdb
      .then((mdb: any) => {
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
        this.requestUpdate();
      })
      .catch((error: any) => {
        console.log(error);
      });
    super.attributeChangedCallback(name, oldval, newval);
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
      class="${this.customWindowsControl ? 'customWindowControls' : ''}"
    >
      <a href="#" @click=${this._toggleMenu} title="open menu">${barsIcon}</a>
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
              >${this.alb.name}
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
