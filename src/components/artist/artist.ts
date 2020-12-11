import { LitElement, customElement, html, property } from 'lit-element';
import '../app-link/app-link';
import musicdb from '../../components/musicdb';
import smallMuted from '../../styles/small-muted';
import panel from '../../styles/panel';
import { nothing } from 'lit-html';
import artist from '../../styles/artist';
import { REFRESH } from '../../utils/musicdb';

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
    this.addEventListener(
      REFRESH,
      () => {
        this._getAlbums();
      },
      { passive: true }
    );
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
