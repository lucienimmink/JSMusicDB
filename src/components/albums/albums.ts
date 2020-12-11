import { LitElement, customElement, html, property } from 'lit-element';
import 'lit-virtualizer';
import '../app-link/app-link';
import musicdb from '../musicdb';
import headers from '../../styles/headers';
import container from '../../styles/container';
import jumplist from '../../styles/jumplist';
import smallMuted from '../../styles/small-muted';
import virtualScroll from '../../styles/virtual-scroll';
import { REFRESH } from '../../utils/musicdb';

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
    // @ts-ignore
    scroller.scrollToIndex(index, 'start');
    this.requestUpdate();
  };
  attributeChangedCallback(name: any, oldval: any, newval: any) {
    if (name === 'activeroute' && newval === 'albums') {
      this._getAlbums();
    } else {
      this.albums = [];
      this.letters = [];
    }
    super.attributeChangedCallback(name, oldval, newval);
  }
  _getAlbums = () => {
    musicdb
      .then((mdb: any) => {
        this.letters = mdb.sortedLetters;
        this.letters.map((letter: any) => {
          letter
            .sortAndReturnArtistsBy('sortName', 'asc')
            .map((artist: any) => {
              const header = {
                header: artist.name,
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
  constructor() {
    super();
    this.letters = [];
    this.albums = [];
    this.showJumpList = false;
    this.activeroute = '';
    this.hasVisiblePlayer = false;
    this.addEventListener(
      REFRESH,
      () => {
        this._getAlbums();
      },
      { passive: true }
    );
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
          <lit-virtualizer
            .scrollTarget=${window}
            .items=${this.albums}
            .renderItem=${(album: any) => html`
              ${album.header
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
                          <span class="small muted">Year: ${album.year}</span>
                        </div>
                      </app-link>
                    </li>
                  `}
            `}
          >
          </lit-virtualizer>
        </ol>
      </div>
    `;
  }
}
