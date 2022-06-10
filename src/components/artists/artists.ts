import '@lit-labs/virtualizer';
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
import musicdb from '../musicdb';
import './../app-link/app-link';
@customElement('artists-nav')
export class LetterNav extends LitElement {
  letters: Array<any>;
  artists: Array<any>;
  showJumpList: boolean;
  @property()
  activeroute: string;
  @property({ type: Boolean })
  hasVisiblePlayer: boolean;
  @state()
  active = false;
  static get styles() {
    return [container, headers, jumplist, smallMuted, virtualScroll];
  }
  _handleJump = (e: any, l: string) => {
    e.preventDefault();
    this.showJumpList = false;
    const scroller = this.shadowRoot?.querySelector('lit-virtualizer');
    const index = this.artists.findIndex(letter => letter.header === l);
    const offsetted = index === 0 ? 0 : index - 1;
    // @ts-ignore
    scroller.scrollToIndex(offsetted, 'start');
    this.requestUpdate();
  };

  _getArtists = () => {
    musicdb
      .then((mdb: any) => {
        this.artists = [];
        this.letters = mdb.sortedLetters;
        this.letters.forEach((letter: any) => {
          const header = {
            header: letter.letter,
            artists: letter.artists.length,
          };
          this.artists.push(header);
          letter
            .sortAndReturnArtistsBy('sortName', 'asc')
            .map((artist: any) => {
              this.artists.push(artist);
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
    EventBus.on(REFRESH, this._getArtists, this);
    EventBus.on(SWITCH_ROUTE, this.isActiveRoute, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._getArtists, this);
    EventBus.off(SWITCH_ROUTE, this.isActiveRoute, this);
  }
  constructor() {
    super();
    this.letters = [];
    this.artists = [];
    this.activeroute = '';
    this.showJumpList = false;
    this.hasVisiblePlayer = false;
    this._getArtists();
  }
  isActiveRoute(event: Event, route: string) {
    this.active = route === 'artists';
  }
  render() {
    return html`
      ${this.active
        ? html`
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
                ${this.artists.length > 0
                  ? html` <lit-virtualizer
                      .scrollTarget=${window}
                      .items=${this.artists}
                      .renderItem=${(artist: any) => html`
                        ${artist.header
                          ? html`
                              <li
                                class="header"
                                @click="${() => {
                                  this.showJumpList = true;
                                  this.requestUpdate();
                                }}"
                              >
                                ${artist.header}
                                <span class="small muted"
                                  >(${artist.artists})</span
                                >
                              </li>
                            `
                          : html`
                              <li>
                                <app-link
                                  flex
                                  text
                                  href="/letter/${artist.letter
                                    .escapedLetter}/artist/${artist.escapedName}"
                                >
                                  <album-art
                                    artist="${artist.albumArtist ||
                                    artist.name}"
                                    dimension="50"
                                  ></album-art>
                                  <div class="details">
                                    <span class="artist"
                                      >${artist.albumArtist ||
                                      artist.name}</span
                                    >
                                    <span class="small muted"
                                      >Albums: ${artist.albums.length}</span
                                    >
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
          `
        : nothing}
    `;
  }
}
