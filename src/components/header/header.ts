import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import header from '../../styles/header';
import responsive from '../../styles/responsive';
import { global as EventBus } from '../../utils/EventBus';
import {
  DONE_RELOADING,
  getJwt,
  getProgress,
  getServer,
  IS_RELOADING,
  POLL_INTERVALL,
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

  static get styles() {
    return [responsive, header];
  }
  constructor() {
    super();
    this.artist = '';
    this.album = '';
    this.art = null;
    this.alb = null;
    this.isReloading = true;
    this.progress = '';
    getJwt().then((jwt: any) => {
      if (jwt) {
        getServer().then((server: any) => {
          this._poll({ server, jwt });
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
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(CHANGE_TITLE, this._doChangeTitle, this);
  }
  _doChangeTitle(target: any, data: any) {
    this._changeTitle(data);
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
    document.title = `${dynamic.join(' • ')}JSMusicDB`;
  };
  _poll = ({ server, jwt }: { server: any; jwt: any }) => {
    getProgress(server, jwt).then(
      ({ progress, status }: { progress: any; status: any }) => {
        if (status !== 'ready' && status !== 'error') {
          this.isReloading = true;
          this.progress = progress ? `${progress}%` : 'scan';
          this._changeTitle();
          EventBus.emit(IS_RELOADING, this);
        } else if (this.isReloading === true) {
          EventBus.emit(DONE_RELOADING, this);
          this.isReloading = false;
          this._changeTitle();
        }
        if (status !== 'error') {
          setTimeout(() => {
            this._poll({ server, jwt });
          }, POLL_INTERVALL);
        }
      }
    );
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
  render() {
    return html`<h1>
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
      ${this.isReloading
        ? html`<progress-spinner>${this.progress}</progress-spinner>`
        : nothing}
    </h1>`;
  }
}
