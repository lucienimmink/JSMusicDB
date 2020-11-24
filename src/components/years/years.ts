import { LitElement, customElement, html, css, property } from "lit-element";
import 'lit-virtualizer';
import '../app-link/app-link';
import musicdb from '../musicdb'
import headers from '../styles/headers';
import container from '../styles/container';
import jumplist from '../styles/jumplist';
import smallMuted from '../styles/small-muted'

@customElement('years-nav')
export class LetterNav extends LitElement {
  years: Array<any>;
  albums: Array<any>;
  showJumpList: boolean;
  @property()
  activeroute: string;
  static get styles() {
    return css`
    ${container}
    .container {
      display: block;
    }
    ${headers}
    ${jumplist}
    .jumplist a {
      padding: 12px;
    }
    @media (min-width: 768px) {
      .jumplist a {
        padding: 20px;
      }
    }
    ${smallMuted}
    ol {
      list-style: none;
      margin: 0 0 20px;
      padding: 0;
      width: 100%;
    }
    ol li {
      display: block;
      height: 70px;
      border-top: 1px solid var(--background3);
      box-sizing: border-box;
      width: 100%;
    }
    ol app-link {
      display: flex;
      padding: 10px 1rem;
      transition: background 0.2s ease-in-out;
    }
    ol app-link:hover {
      background: rgba(0,0,0,0.1);
    }
    album-art {
      width: 50px;
      height: 50px;
      margin-right: 10px;
      flex-grow: 0;
      border: 1px solid var(--background3, #F3F4F5);
      background: rgba(255,255,255,0.85);
      box-shadow: 0px 0px 1px var(--primary, #006ecd);
    }
    .details {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      max-width: calc(100vw - 80px);
    }
    .details .artist {
      display: block;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    `
  }
  _handleJump = (e: any, y: string) => {
    e.preventDefault();
    this.showJumpList = false;
    const scroller = this.shadowRoot?.querySelector('lit-virtualizer');
    const index = this.albums.findIndex((letter) => letter.header === y);
    this.requestUpdate();
    // @ts-ignore
    scroller.scrollToIndex(index, 'start');
  }
  attributeChangedCallback(name: any, oldval: any, newval: any) {
    if (name === "activeroute" && newval === 'years') {
      this._getAlbums();
    } else {
      this.years = [];
      this.albums = [];
    }
  }
  _getAlbums = () => {
    musicdb.then((mdb:any) => {
      const sortedYears = Object.keys(mdb.years).sort((a: string,b: string) => {
        return parseInt(a, 10) < parseInt(b, 10) ? 1 : -1
      });
      if (sortedYears[0] === 'undefined') {
        sortedYears.shift(); // remove 'undefined' that is not a year silly
      }
      sortedYears.forEach((year: string) => {
        this.years.push(mdb.years[year]);
      });
      this.years.map((year: any) => {
        const header = {
          header: year.year,
          albums: year.albums.length
        }
        this.albums.push(header);
        year.albums.map((album:any) => {
          this.albums.push(album);
        })
      });
      this.requestUpdate();
    });
  }
  constructor() {
    super();
    this.years = [];
    this.albums = [];
    this.activeroute = '';
    this.showJumpList = false;
  }
  render() {
    return html`
      <ul class="jumplist ${this.showJumpList ? 'show' : ''}">
        ${this.years.map((year: any) => html`
          <li>
            <a href="#" @click="${(e: any) => { this._handleJump(e, year.year)}}">${year.year}</a>
          </li>
        `)}
      </ul>
      <div class="container">
        <ol class="virtual-scroll">
          <lit-virtualizer
            .scrollTarget=${window}
            .items=${this.albums}
            .renderItem=${(album: any) => html`
              ${album.header ? html`
                <li class="header" @click="${() => { this.showJumpList = true; this.requestUpdate() }}">
                  ${album.header} <span class="small muted">(${album.albums})</span>
                </li>
              ` : html`
                <li>
                  <app-link flex text href="/letter/${album.artist.letter.escapedLetter}/artist/${album.artist.escapedName}/album/${album.escapedName}">
                    <album-art artist="${album.artist.albumArtist || album.artist.name}" album="${album.name}"></album-art>
                    <div class="details">
                      <span class="artist">${album.name}</span>
                      <span class="small muted">${album.artist.albumArtist || album.artist.name}</span>
                    </div>
                  </app-link>
                </li>
                `}
              `}>
          </lit-virtualizer>
        </ol>
      </div>
    `
  }
}
