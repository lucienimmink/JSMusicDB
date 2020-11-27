import { LitElement, customElement, html, property } from 'lit-element';
import '../track/track';
import musicdb from '../musicdb';
import timeSpan from '../../utils/timespan';

import container from '../../styles/container';
import buttons from '../../styles/buttons';
import { nothing } from 'lit-html';
import albumDetails from '../../styles/album-details';

@customElement('album-details')
export class AlbumDetails extends LitElement {
  @property()
  artist: string;
  @property()
  album: string;
  albumDetails: any;
  shrunk: boolean;

  static get styles() {
    return [container, buttons, albumDetails];
  }

  constructor() {
    super();
    this.artist = '';
    this.album = '';
    this.albumDetails = {
      dummy: true,
      artist: { name: 'Dummy' },
      name: 'Dummy',
      year: 2000,
      tracks: [],
      type: 'dummy',
    };
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
  _playAlbum(e: Event) {
    e.preventDefault();
    this.dispatchEvent(new Event('play'));
  }
  render() {
    return html`
      <div class="jumbotron ${this.shrunk ? 'shrunk ' : ''}">
        <div class="container ${this.albumDetails?.dummy ? 'dummy ' : ''}">
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
            <h4>
              <button
                class="btn btn-primary"
                @click=${(e: any) => this._playAlbum(e)}
              >
                Play album
              </button>
            </h4>
          </div>
        </div>
      </div>
    `;
  }
}
