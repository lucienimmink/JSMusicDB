import { LitElement, customElement, html, css, property } from 'lit-element';
import '../track/track';
import musicdb from '../musicdb';
import timeSpan from '../../utils/timespan';

import container from '../../styles/container';
import buttons from '../../styles/buttons';
import { nothing } from 'lit-html';

@customElement('album-details')
export class AlbumDetails extends LitElement {
  @property()
  artist: string;
  @property()
  album: string;
  albumDetails: any;
  shrunk: boolean;

  static get styles() {
    return css`
      ${container}
      ${buttons}
      .jumbotron {
        color: var(--text-color);
        background: var(--background2, #f2f4f7);
        padding: 1rem;
        overflow: hidden;
      }
      album-art {
        flex: 0 0 125px;
        max-width: 125px;
        width: 125px;
        height: 125px;
        max-height: 125px;
        margin-right: 1rem;
        border: 1px solid var(--background, #f3f4f5);
        box-shadow: 0px 0px 1px var(--primary, #006ecd);
      }
      .details {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      h2,
      h3,
      h4 {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0;
        flex-grow: 0;
        font-weight: lighter;
      }
      h2 {
        margin-top: -5px;
        font-size: 1.5rem;
        line-height: 1.3;
      }
      h3,
      h4 {
        font-size: 1.2rem;
      }
      h3 {
        flex-grow: 1;
      }
      @media (min-width: 768px) {
        .jumbotron {
          padding: 2rem;
        }
        album-art {
          flex: 0 0 175px;
          max-width: 175px;
          width: 175px;
          height: 175px;
          max-height: 175px;
          margin-left: -2rem;
        }
        .shrunk album-art {
          flex: 0 0 75px;
          max-width: 75px;
          width: 75px;
          height: 75px;
          max-height: 75px;
        }
        h2 {
          font-size: 2.5rem;
        }
        h3,
        h4 {
          font-size: 1.5rem;
        }
        .shrunk h4 {
          display: none;
        }
      }
      @media (min-width: 992px) {
        album-art {
          flex: 0 0 190px;
          max-width: 190px;
          width: 190px;
          height: 190px;
          max-height: 190px;
        }
      }
    `;
  }

  constructor() {
    super();
    this.artist = '';
    this.album = '';
    this.albumDetails = {};
    this.shrunk = false;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('scroll', this._handleScroll);
  }
  disconnectedCallback() {
    window.removeEventListener('scroll', this._handleScroll);
    super.disconnectedCallback();
  }
  _handleScroll = () => {
    if (window.pageYOffset > 0) {
      this.shrunk = true;
    } else {
      this.shrunk = false;
    }
    this.requestUpdate();
  };

  attributeChangedCallback(name: any, oldval: any, newval: any) {
    if (name === 'album') {
      this.getDetails(this.artist, newval);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }
  getDetails(artist = this.artist, album = this.album) {
    musicdb
      .then((mdb: any) => {
        this.albumDetails = mdb.albums[`${artist}|${album}`];
        this.requestUpdate();
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
  calculateLength(tracks: Array<any>) {
    let duration = 0;
    if (tracks) {
      tracks.forEach(track => {
        duration += track.duration;
      });
      return timeSpan(duration);
    }
    return 0;
  }
  _playAlbum (e:Event) {
    e.preventDefault();
    this.dispatchEvent(new Event('play'));
  }
  render() {
    return html`
      <div class="jumbotron ${this.shrunk ? 'shrunk' : ''}">
        <div class="container">
          <album-art
            artist="${this.albumDetails?.artist?.albumArtist ||
            this.albumDetails?.artist?.name}"
            album="${this.albumDetails?.name}"
          ></album-art>
          <div class="details">
            <h2>${this.albumDetails?.name}</h2>
            <h3>
              ${this.albumDetails?.artist?.albumArtist ||
              this.albumDetails?.artist?.name}
            </h3>
            <h4>
              ${this.albumDetails?.year
                ? html`${this.albumDetails?.year} •`
                : nothing}
              songs: ${this.albumDetails?.tracks?.length} •
              ${this.calculateLength(this.albumDetails?.tracks)} •
              ${this.albumDetails?.type}
            </h4>
            <h4><button class="btn btn-primary" @click=${(e: any) => this._playAlbum(e)}>Play album</button></h4>
          </div>
        </div>
      </div>
    `;
  }
}
