import { LitElement, customElement, html, property } from 'lit-element';
import 'lit-virtualizer';
import './../app-link/app-link';
import musicdb from '../musicdb';
import headers from '../../styles/headers';
import container from '../../styles/container';
import jumplist from '../../styles/jumplist';
import smallMuted from '../../styles/small-muted';
import virtualScroll from '../../styles/virtual-scroll';
@customElement('artists-nav')
export class LetterNav extends LitElement {
  letters: Array<any>;
  artists: Array<any>;
  showJumpList: boolean;
  @property()
  activeroute: string;
  static get styles() {
    return [container, headers, jumplist, smallMuted, virtualScroll];
  }
  _handleJump = (e: any, l: string) => {
    e.preventDefault();
    this.showJumpList = false;
    const scroller = this.shadowRoot?.querySelector('lit-virtualizer');
    const index = this.artists.findIndex(letter => letter.header === l);
    this.requestUpdate();
    // @ts-ignore
    scroller.scrollToIndex(index, 'start');
  };
  attributeChangedCallback(name: any, oldval: any, newval: any) {
    if (name === 'activeroute' && newval === 'artists') {
      this._getArtists();
    } else {
      this.artists = [];
      this.letters = [];
    }
    super.attributeChangedCallback(name, oldval, newval);
  }
  _getArtists = () => {
    musicdb
      .then((mdb: any) => {
        this.letters = mdb.sortedLetters;
        this.letters.map((letter: any) => {
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
  constructor() {
    super();
    this.letters = [];
    this.artists = [];
    this.activeroute = '';
    this.showJumpList = false;
  }
  render() {
    return html`
      <ul class="jumplist ${this.showJumpList ? 'show' : ''}">
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
                      <span class="small muted">(${artist.artists})</span>
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
                          artist="${artist.albumArtist || artist.name}"
                        ></album-art>
                        <div class="details">
                          <span class="artist"
                            >${artist.albumArtist || artist.name}</span
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
          </lit-virtualizer>
        </ol>
      </div>
    `;
  }
}
