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
import years from '../../styles/years';
import { REFRESH } from '../../utils/musicdb';
import { global as EventBus } from '../../utils/EventBus';
@customElement('years-nav')
export class LetterNav extends LitElement {
  years: Array<any>;
  albums: Array<any>;
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
    this.showJumpList = false;
    const scroller = this.shadowRoot?.querySelector('lit-virtualizer');
    const index = this.albums.findIndex(letter => letter.header === y);
    const offsetted = index === 0 ? 0 : index - 1;
    // @ts-ignore
    scroller.scrollToIndex(offsetted, 'start');
    this.requestUpdate();
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
      this.years.map((year: any) => {
        const header = {
          header: year.year,
          albums: year.albums.length,
        };
        this.albums.push(header);
        year.albums.map((album: any) => {
          this.albums.push(album);
        });
      });
      this.requestUpdate();
    });
  };
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this._getAlbums(), this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._getAlbums(), this);
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
  render() {
    return html`
      <ul
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
      </ul>
      <div class="container">
        <ol class="virtual-scroll">
          <lit-virtualizer
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
                : html` ${album
                    ? html`
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
                              <span class="artist">${album.name}</span>
                              <span class="small muted"
                                >${album.artist.albumArtist ||
                                album.artist.name}</span
                              >
                            </div>
                          </app-link>
                        </li>
                      `
                    : nothing}`}
            `}
          >
          </lit-virtualizer>
        </ol>
      </div>
    `;
  }
}
