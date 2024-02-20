import '@lit-labs/virtualizer';
import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import container from '../../styles/container';
import headers from '../../styles/headers';
import jumplist from '../../styles/jumplist';
import smallMuted from '../../styles/small-muted';
import virtualScroll from '../../styles/virtual-scroll';
import { global as EventBus } from '../../utils/EventBus';
import { REFRESH } from '../../utils/musicdb';
import { handleScroll } from '../../utils/virtual-scroll';
import '../app-link/app-link';
import '../album/album-in-list';
import musicdb from '../musicdb';

@customElement('albums-nav')
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
  _getAlbums = async () => {
    const mdb: any = await musicdb;
    this.albums = [];
    this.letters = mdb.sortedLetters;
    this.letters.forEach((letter: any) => {
      letter.sortAndReturnArtistsBy('sortName', 'asc').map((artist: any) => {
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
        `,
      )}
    </ul>`;
  }
  private _renderAlbum(album: any) {
    return html`<li>
      <album-in-list
        @click=${this._handleClick}
        .album=${album}
      ></album-in-list>
    </li>`;
  }
  private _rendderAlbums(album: any) {
    return html`${album?.header
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
      : this._renderAlbum(album)}`;
  }
  private _renderList() {
    return html`<lit-virtualizer
      .scrollTarget=${window}
      .items=${this.albums}
      .renderItem=${(album: any) => this._rendderAlbums(album)}
    >
    </lit-virtualizer>`;
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
