import { LitElement, customElement, html, css, property } from 'lit-element';
import './../app-link/app-link';
import { barsIcon } from '../icons/bars';
import musicdb from '../musicdb';
import responsive from '../../styles/responsive';
import { nothing } from 'lit-html';
import {
  DONE_RELOADING,
  getJwt,
  getProgress,
  getServer,
  IS_RELOADING,
} from '../../utils/node-mp3stream';

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

  static get styles() {
    return [
      responsive,
      css`
        a {
          color: var(--primary);
          text-decoration: none;
          transition: color 0.2s ease-in-out;
        }
        svg {
          width: 20px;
        }
        h1 {
          background: var(--background3, #e9ecef);
          color: var(--text-color);
          margin: 0px;
          padding: 0px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          display: block;
          height: 50px;
          font-weight: lighter;
          padding-left: 10px;
        }
        app-link {
          color: var(--primary, #006ecd);
          transition: color 0.2s ease-in-out;
        }
        progress-spinner {
          position: absolute;
          right: -10px;
          top: -14px;
          font-size: 0.8rem;
        }
        @media (min-width: 576px) {
          .md-up {
            display: inline;
          }
        }
      `,
    ];
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
    this.dispatchEvent(new Event('toggle-menu'));
  };
  _poll = ({ server, jwt }: { server: any; jwt: any }) => {
    getProgress(server, jwt).then(
      ({ progress, status }: { progress: any; status: any }) => {
        if (status !== 'ready') {
          this.isReloading = true;
          this.progress = progress ? `${progress}%` : 'scan';
          document
            .querySelector('lit-musicdb')
            ?.dispatchEvent(new CustomEvent(IS_RELOADING));
          this.requestUpdate();
        } else {
          if (this.isReloading === true) {
            document
              .querySelector('lit-musicdb')
              ?.dispatchEvent(new CustomEvent(DONE_RELOADING));
            this.isReloading = false;
            this.requestUpdate();
          }
        }
        setTimeout(() => {
          this._poll({ server, jwt });
        }, 5000);
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
      ${this.isReloading
        ? html`<progress-spinner>${this.progress}</progress-spinner>`
        : nothing}
    </h1>`;
  }
}
