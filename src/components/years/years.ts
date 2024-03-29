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
import { handleScroll } from '../../utils/virtual-scroll';
import '../app-link/app-link';
import '../album/album-in-list';
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
      const sortedYears = Object.keys(mdb.years)
        .filter((year: string) => year !== '0')
        .sort((a: string, b: string) => {
          return parseInt(a, 10) < parseInt(b, 10) ? 1 : -1;
        });
      sortedYears.forEach((year: string) => {
        const mdbYear = mdb.years[year];
        this.years.push(mdbYear);
        const header = {
          header: mdbYear.year,
          albums: mdbYear?.albums?.length,
        };
        this.albums.push(header);
        mdbYear.albums?.forEach((album: any) => {
          this.albums.push(album);
        });
      });
      this.requestUpdate();
    });
  };
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this._getAlbums, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._getAlbums, this);
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
        `,
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
        <album-in-list
          @click=${this._handleClick}
          .album=${album}
        ></album-in-list>
      </li>
    `;
  }

  private _handleClick(e: any) {
    const { target } = e;
    target.style.viewTransitionName = 'album-art';
  }

  render() {
    return html` ${this._renderJumplist()}
      <div class="container">
        <ol class="virtual-scroll">
          ${this.albums.length > 0 ? this._renderList() : nothing}
        </ol>
      </div>`;
  }
}
