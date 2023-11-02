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
import musicdb from '../musicdb';
import './../app-link/app-link';
import './../artist/artist-in-list';

@customElement('artists-nav')
export class LetterNav extends LitElement {
  @state()
  showJumpList: boolean;
  @property()
  activeroute: string;
  @property({ type: Boolean })
  hasVisiblePlayer: boolean;

  @state()
  artists: Array<any>;
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
    const index = this.artists.findIndex(letter => letter.header === l);
    this.showJumpList = false;
    handleScroll(scroller, index);
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
      })
      .catch((error: any) => {
        console.log(error);
      });
  };
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this._getArtists, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._getArtists, this);
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

  private _renderArtist(artist: any) {
    return html`<li>
      <artist-in-list
        .artist=${artist}
        @click=${this._handleClick}
      ></artist-in-list>
    </li>`;
  }
  private _renderArtists(artist: any) {
    return html`
      ${artist.header
        ? html`
            <li
              class="header"
              @click="${() => {
                this.showJumpList = true;
              }}"
            >
              ${artist.header}
              <span class="small muted">(${artist.artists})</span>
            </li>
          `
        : this._renderArtist(artist)}
    `;
  }

  private _renderList() {
    return html` <lit-virtualizer
      .scrollTarget=${window}
      .items=${this.artists}
      .renderItem=${(artist: any) => this._renderArtists(artist)}
    >
    </lit-virtualizer>`;
  }

  private _handleClick(e: any) {
    const { target } = e;
    target.style.viewTransitionName = 'album-art';
  }

  render() {
    return html`
      ${this._renderJumplist()}
      <div class="container">
        <ol class="virtual-scroll">
          ${this.artists.length > 0 ? this._renderList() : nothing}
        </ol>
      </div>
    `;
  }
}
