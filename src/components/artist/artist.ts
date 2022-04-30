import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import musicdb from '../../components/musicdb';
import artist from '../../styles/artist';
import panel from '../../styles/panel';
import smallMuted from '../../styles/small-muted';
import { global as EventBus } from '../../utils/EventBus';
import { REFRESH } from '../../utils/musicdb';
import '../app-link/app-link';

@customElement('albums-in-artist')
export class Artist extends LitElement {
  @property()
  artist: string;
  albums: Array<any>;
  static get styles() {
    return [smallMuted, panel, artist];
  }
  constructor() {
    super();
    this.artist = '';
    this.albums = [];
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this._getAlbums, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._getAlbums, this);
  }
  attributeChangedCallback(name: any, oldval: any, newval: any) {
    if (name === 'artist') {
      this._getAlbums(newval);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }
  _getAlbums(artist = this.artist) {
    musicdb
      .then((mdb: any) => {
        this.albums =
          mdb.artists[artist]?.sortAndReturnAlbumsBy('year', 'asc') || [];
        this.requestUpdate();
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
  render() {
    return html`
      ${this.albums.map(
        (album: any) => html`
          <app-link
            href="/letter/${album.artist.letter.escapedLetter}/artist/${album
              .artist.escapedName}/album/${album.escapedName}"
          >
            <div class="panel">
              <album-art
                artist="${album.artist.albumArtist || album.artist.name}"
                album="${album.name}"
              ></album-art>
              <div class="panel-info color-type-primary-alt">
                <span>${album.name}</span>
                ${album.year === 0
                  ? nothing
                  : html`
                      <span class="small muted">Year: ${album.year}</span>
                    `}
              </div>
            </div>
          </app-link>
        `
      )}
    `;
  }
}
