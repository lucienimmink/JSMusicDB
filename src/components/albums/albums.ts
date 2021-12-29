import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@lit-labs/virtualizer';
import '../app-link/app-link';
import musicdb from '../musicdb';
import headers from '../../styles/headers';
import container from '../../styles/container';
import jumplist from '../../styles/jumplist';
import smallMuted from '../../styles/small-muted';
import virtualScroll from '../../styles/virtual-scroll';
import { REFRESH } from '../../utils/musicdb';
import { global as EventBus } from '../../utils/EventBus';

@customElement('albums-nav')
export class LetterNav extends LitElement {
  letters: Array<any>;
  albums: Array<any>;
  showJumpList: boolean;
  @property()
  activeroute: string;
  @property({ type: Boolean })
  hasVisiblePlayer: boolean;
  static get styles() {
    return [container, headers, jumplist, smallMuted, virtualScroll];
  }
  _handleJump = (e: any, l: string) => {
    e.preventDefault();
    this.showJumpList = false;
    const scroller = this.shadowRoot?.querySelector('lit-virtualizer');
    const index = this.albums.findIndex(letter => letter.id === l);
    const offsetted = index === 0 ? 0 : index - 1;
    // @ts-ignore
    scroller.scrollToIndex(offsetted, 'start');
    this.requestUpdate();
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
        this.requestUpdate();
      })
      .catch((error: any) => {
        console.log(error);
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
  render() {
    return html`
      <ul
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
      </ul>
      <div class="container">
        <ol class="virtual-scroll">
          ${this.albums.length > 0
            ? html` <lit-virtualizer
                .scrollTarget=${window}
                .items=${this.albums}
                .renderItem=${(album: any) => html`
                  ${album?.header
                    ? html`
                        <li
                          class="header"
                          @click="${() => {
                            this.showJumpList = true;
                            this.requestUpdate();
                          }}"
                        >
                          ${album.header}
                          <span class="small muted">(${album.albums})</span>
                        </li>
                      `
                    : html`
                        <li>
                          <app-link
                            flex
                            text
                            href="/letter/${album.artist.letter
                              .escapedLetter}/artist/${album.artist
                              .escapedName}/album/${album.escapedName}"
                          >
                            <album-art
                              artist="${album.artist.albumArtist ||
                              album.artist.name}"
                              album="${album.name}"
                            ></album-art>
                            <div class="details">
                              <span class="album">${album.name}</span>
                              ${album.year
                                ? html`
                                    <span class="small muted"
                                      >Year: ${album.year}</span
                                    >
                                  `
                                : nothing}
                            </div>
                          </app-link>
                        </li>
                      `}
                `}
              >
              </lit-virtualizer>`
            : nothing}
        </ol>
      </div>
    `;
  }
}
