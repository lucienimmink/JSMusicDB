import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './../app-link/app-link';
import { barsIcon } from '../icons/bars';
import musicdb from '../musicdb';
import responsive from '../../styles/responsive';
import {
  DONE_RELOADING,
  getJwt,
  getProgress,
  getServer,
  IS_RELOADING,
  POLL_INTERVALL,
} from '../../utils/node-mp3stream';
import header from '../../styles/header';
import { global as EventBus } from '../../utils/EventBus';
import { CHANGE_TITLE } from '../../utils/player';
import { TOGGLE_MENU } from '../side-nav/side-nav';

@customElement('main-header')
export class Header extends LitElement {
  @property()
  artist: string;
  @property()
  album: string;

  art: any;
  alb: any;

  isReloading: boolean;
  progress: string;

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
    this.isReloading = false;
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
        if (status !== 'ready') {
          this.isReloading = true;
          this.progress = progress ? `${progress}%` : 'scan';
          this._changeTitle();
          EventBus.emit(IS_RELOADING, this);
          this.requestUpdate();
        } else {
          if (this.isReloading === true) {
            EventBus.emit(DONE_RELOADING, this);
            this.isReloading = false;
            this._changeTitle();
            this.requestUpdate();
          }
        }
        setTimeout(() => {
          this._poll({ server, jwt });
        }, POLL_INTERVALL);
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
