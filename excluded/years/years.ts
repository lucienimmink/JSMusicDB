import '@lit-labs/virtualizer';
import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import container from '../../styles/container';
import headers from '../../styles/headers';
import jumplist from '../../styles/jumplist';
import smallMuted from '../../styles/small-muted';
import virtualScroll from '../../styles/virtual-scroll';
import years from '../../styles/years';
import { global as EventBus } from '../../utils/EventBus';
import { REFRESH } from '../../utils/musicdb';
import { SWITCH_ROUTE } from '../../utils/router';
import { handleScroll } from '../../utils/virtual-scroll';
import '../app-link/app-link';
import musicdb from '../musicdb';

@customElement('years-nav')
export class LetterNav extends LitElement {
  years: Array<any>;
  albums: Array<any>;
  @state()
  showJumpList: boolean;
  @property()
  activeroute: string;
  @property({ type: Boolean })
  hasVisiblePlayer: boolean;
  @state()
  active = false;
  static get styles() {
    return [headers, container, jumplist, smallMuted, virtualScroll, years];
  }
  _handleJump = (e: any, y: string) => {
    e.preventDefault();
    const scroller = this.shadowRoot?.querySelector('lit-virtualizer');
    const index = this.albums.findIndex(letter => letter.header === y);
    this.showJumpList = false;
    handleScroll(scroller, index);
  };
  _getAlbums = () => {
    musicdb.then((mdb: any) => {
      this.years = [];
      this.albums = [];
      const sortedYears = Object.keys(mdb.years).sort(
        (a: string, b: string) => {
          return parseInt(a, 10) < parseInt(b, 10) ? 1 : -1;
        }
      );
      if (sortedYears[0] === 'undefined') {
        sortedYears.shift(); // remove 'undefined' that is not a year silly
      }
      sortedYears.forEach((year: string) => {
        this.years.push(mdb.years[year]);
      });
      this.years.forEach((year: any) => {
        const header = {
          header: year.year,
          albums: year.albums.length,
        };
        this.albums.push(header);
        year.albums.forEach((album: any) => {
          this.albums.push(album);
        });
      });
      this.requestUpdate();
    });
  };
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this._getAlbums, this);
    EventBus.on(SWITCH_ROUTE, this.isActiveRoute, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._getAlbums, this);
    EventBus.off(SWITCH_ROUTE, this.isActiveRoute, this);
  }
  isActiveRoute(event: Event, route: string) {
    this.active = route === 'years';
  }
  constructor() {
    super();
    this.years = [];
    this.albums = [];
    this.activeroute = '';
    this.showJumpList = false;
    this.hasVisiblePlayer = false;
    this._getAlbums();
  }
  private _renderJumplist() {
    return html`<ul
      class="jumplist ${this.showJumpList ? 'show ' : ''} ${this
        .hasVisiblePlayer
        ? 'player'
        : ''}"
    >
      ${this.years.map(
        (year: any) => html`
          <li>
            <a
              href="#"
              @click="${(e: any) => {
                this._handleJump(e, year.year);
              }}"
              >${year.year}</a
            >
          </li>
        `
      )}
    </ul>`;
  }
  private _renderList() {
    return html`<lit-virtualizer
      .scrollTarget=${window}
      .items=${this.albums}
      .renderItem=${(album: any) => html`
        ${album?.header
          ? html`
              <li class="header" @click="${() => (this.showJumpList = true)}">
                ${album.header}
                <span class="small muted">(${album.albums})</span>
              </li>
            `
          : html` ${album ? this._renderAlbum(album) : nothing}`}
      `}
    >
    </lit-virtualizer>`;
  }
  private _renderAlbum(album: any) {
    return html`
      <li>
        <app-link
          flex
          text
          href="/letter/${album.artist.letter.escapedLetter}/artist/${album
            .artist.escapedName}/album/${album.escapedName}"
        >
          <album-art
            artist="${album.artist.albumArtist || album.artist.name}"
            album="${album.name}"
            dimension="50"
          ></album-art>
          <div class="details">
            <span class="artist">${album.name}</span>
            <span class="small muted"
              >${album.artist.albumArtist || album.artist.name}</span
            >
          </div>
        </app-link>
      </li>
    `;
  }
  render() {
    return html`
      ${this.active
        ? html` ${this._renderJumplist()}
            <div class="container">
              <ol class="virtual-scroll">
                ${this.albums.length > 0 ? this._renderList() : nothing}
              </ol>
            </div>`
        : nothing}
    `;
  }
}
