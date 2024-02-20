import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import musicdb from '../../components/musicdb';
import grid from '../../styles/grid';
import { global as EventBus } from '../../utils/EventBus';
import { REFRESH } from '../../utils/musicdb';
import '../album/album-in-grid';

@customElement('albums-in-artist')
export class Artist extends LitElement {
  @property()
  artist: string;
  @state()
  albums: Array<any>;
  @state()
  active = false;
  static get styles() {
    return [grid];
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
  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has('artist')) {
      this._getAlbums(this.artist);
    }
  }
  async _getAlbums(artist = this.artist) {
    const mdb: any = await musicdb;
    this.albums =
      mdb.artists[artist]?.sortAndReturnAlbumsBy('year', 'asc') || [];
  }
  _handleClick(e: any) {
    const { target } = e;
    target.style.viewTransitionName = 'album-art';
  }
  private _renderAlbum(album: any) {
    return html`
      <album-in-grid
        .album=${album}
        @click=${this._handleClick}
      ></album-in-grid>
    `;
  }

  render() {
    return html` ${this.albums.map((album: any) => this._renderAlbum(album))}`;
  }
}
