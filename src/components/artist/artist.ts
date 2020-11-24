import { LitElement, customElement, html, css, property } from "lit-element";
import '../app-link/app-link';
import musicdb from '../../components/musicdb'
import smallMuted from '../styles/small-muted'
import panel from '../styles/panel'
import { nothing } from 'lit-html';

@customElement('albums-in-artist')
export class Artist extends LitElement {
  @property()
  artist: string;
  albums: Array<any>
  static get styles() {
    return css`
      ${smallMuted}
      ${panel}
      :host {
        display: block;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-content: flex-start;
        align-items: stretch;
        display: flex;
        padding: 25px 0 0;
      }
      @media (min-width: 768px) {
        :host {
          margin-left: 100px;
          width: calc(100% - 150px);
        }
      }
    `
  }
  constructor() {
    super();
    this.artist = '';
    this.albums = [];
  }
  attributeChangedCallback(name: any, oldval: any, newval: any) {
    if (name === "artist") {
      this.getAlbums(newval);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }
  getAlbums(artist = this.artist) {
    musicdb.then((mdb: any) => {
      this.albums = mdb.artists[artist]?.sortAndReturnAlbumsBy("year", "asc") || [];
      this.requestUpdate();
    }).catch((error: any) => {
      console.log(error);
    })
  }
  render() {
    return html`
      ${this.albums.map((album: any) => html`
        <app-link href="/letter/${album.artist.letter.escapedLetter}/artist/${album.artist.escapedName}/album/${album.escapedName}">
          <div class="panel">
            <album-art artist="${album.artist.albumArtist || album.artist.name }" album="${album.name}"></album-art>
            <div class="panel-info color-type-primary-alt">
              <span>${ album.name }</span>
              ${album.year === 0 ? nothing : html`
              <span class="small muted">Year: ${ album.year }</span>
              `}
            </div>
          </div>
        </app-link>
      `)}
    `
  }
}
