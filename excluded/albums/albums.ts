import '@lit-labs/virtualizer';
import { localized, t } from '@weavedev/lit-i18next';
import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import container from '../../styles/container';
import headers from '../../styles/headers';
import jumplist from '../../styles/jumplist';
import smallMuted from '../../styles/small-muted';
import virtualScroll from '../../styles/virtual-scroll';
import { global as EventBus } from '../../utils/EventBus';
import { REFRESH } from '../../utils/musicdb';
import { SWITCH_ROUTE } from '../../utils/router';
import { handleScroll } from '../../utils/virtual-scroll';
import '../app-link/app-link';
import musicdb from '../musicdb';

@customElement('albums-nav')
@localized()
export class LetterNav extends LitElement {
  albums: Array<any>;
  @state()
  showJumpList: boolean;
  @property()
  activeroute: string;
  @property({ type: Boolean })
  hasVisiblePlayer: boolean;
  @state()
  letters: Array<any>;
  @state()
  active = false;
  static get styles() {
    return [container, headers, jumplist, smallMuted, virtualScroll];
  }
  _handleJump = (e: any, l: string) => {
    e.preventDefault();
    const scroller = this.shadowRoot?.querySelector('lit-virtualizer');
    const index = this.albums.findIndex(letter => letter.id === l);
    this.showJumpList = false;
    handleScroll(scroller, index);
  };
  _getAlbums = () => {
    musicdb
      .then((mdb: any) => {
        this.albums = [];
        this.letters = mdb.sortedLetters;
        this.letters.forEach((letter: any) => {
          letter
            .sortAndReturnArtistsBy('sortName', 'asc')
            .map((artist: any) => {
              const header = {
                header: artist.albumArtist || artist.name,
                albums: artist.albums.length,
                id: artist.letter.letter,
              };
              this.albums.push(header);
              artist.albums.map((album: any) => {
                this.albums.push(album);
              });
            });
        });
      })
      .catch((error: any) => {
        console.log(error);
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
    EventBus.on(SWITCH_ROUTE, this.isActiveRoute, this);
  }
  isActiveRoute(event: Event, route: string) {
    this.active = route === 'albums';
  }
  constructor() {
    super();
    this.letters = [];
    this.albums = [];
    this.showJumpList = false;
    this.activeroute = '';
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
      ${this.letters.map(
        (letter: any) => html`
          <li>
            <a
              href="#"
              @click="${(e: any) => {
                this._handleJump(e, letter.letter);
              }}"
              >${letter.letter}</a
            >
          </li>
        `
      )}
    </ul>`;
  }
  private _renderAlbum(album: any) {
    return html`<li>
      <app-link
        flex
        text
        href="/letter/${album.artist.letter.escapedLetter}/artist/${album.artist
          .escapedName}/album/${album.escapedName}"
      >
        <album-art
          artist="${album.artist.albumArtist || album.artist.name}"
          album="${album.name}"
          dimension="50"
        ></album-art>
        <div class="details">
          <span class="album">${album.name}</span>
          ${album.year
            ? html`
                <span class="small muted"
                  >${t('labels.year')}: ${album.year}</span
                >
              `
            : nothing}
        </div>
      </app-link>
    </li>`;
  }
  private _renderList() {
    return html`<lit-virtualizer
      .scrollTarget=${window}
      .items=${this.albums}
      .renderItem=${(album: any) => html`
        ${album?.header
          ? html`
              <li
                class="header"
                @click="${() => {
                  this.showJumpList = true;
                }}"
              >
                ${album.header}
                <span class="small muted">(${album.albums})</span>
              </li>
            `
          : this._renderAlbum(album)}
      `}
    >
    </lit-virtualizer>`;
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
