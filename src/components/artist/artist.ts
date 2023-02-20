import { localized, t } from '@weavedev/lit-i18next';
import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import musicdb from '../../components/musicdb';
import grid from '../../styles/grid';
import panel from '../../styles/panel';
import smallMuted from '../../styles/small-muted';
import { global as EventBus } from '../../utils/EventBus';
import { REFRESH } from '../../utils/musicdb';
import { SWITCH_ROUTE } from '../../utils/router';
import '../app-link/app-link';

@customElement('albums-in-artist')
@localized()
export class Artist extends LitElement {
  @property()
  artist: string;
  @state()
  albums: Array<any>;
  @state()
  active = false;
  static get styles() {
    return [smallMuted, panel, grid];
  }
  constructor() {
    super();
    this.artist = '';
    this.albums = [];
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(SWITCH_ROUTE, this.isActiveRoute, this);
    if (this.active) {
      EventBus.on(REFRESH, this._getAlbums, this);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (!this.active) {
      EventBus.off(REFRESH, this._getAlbums, this);
      EventBus.off(SWITCH_ROUTE, this.isActiveRoute, this);
    }
  }
  isActiveRoute(event: Event, route: string) {
    this.active = route === 'artist';
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
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
  private _renderAlbum(album: any) {
    return html`
      <app-link
        href="/letter/${album.artist.letter.escapedLetter}/artist/${album.artist
          .escapedName}/album/${album.escapedName}"
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
                  <span class="small muted"
                    >${t('labels.year')}: ${album.year}</span
                  >
                `}
          </div>
        </div>
      </app-link>
    `;
  }

  render() {
    return html`
      ${this.active
        ? html` ${this.albums.map((album: any) => this._renderAlbum(album))}`
        : nothing}
    `;
  }
}
