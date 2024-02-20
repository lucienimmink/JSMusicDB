import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import musicdb from '../../components/musicdb';
import grid from '../../styles/grid';
import panel from '../../styles/panel';
import smallMuted from '../../styles/small-muted';
import { global as EventBus } from '../../utils/EventBus';
import { REFRESH } from '../../utils/musicdb';
import './../artist/artist-in-grid';

@customElement('artists-in-letter')
export class Letter extends LitElement {
  @property()
  letter: string;
  @state()
  artists: Array<any>;

  static get styles() {
    return [smallMuted, panel, grid];
  }
  constructor() {
    super();
    this.letter = '';
    this.artists = [];
  }
  async getArtists(event: any, l = this.letter) {
    l = decodeURIComponent(l);
    const mdb: any = await musicdb;
    const activeLetter: any = mdb.letters[l];
    this.artists =
      activeLetter?.sortAndReturnArtistsBy('sortName', 'asc') || [];
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this.getArtists, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this.getArtists, this);
  }
  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has('letter')) {
      this.getArtists(null, this.letter);
    }
  }
  _handleClick(e: any) {
    const { target } = e;
    target.style.viewTransitionName = 'album-art';
  }
  private _renderArtist(artist: any) {
    return html`
      <artist-in-grid
        .artist=${artist}
        @click=${this._handleClick}
      ></artist-in-grid>
    `;
  }
  render() {
    return html` ${this.artists.map((artist: any) =>
      this._renderArtist(artist),
    )}`;
  }
}
