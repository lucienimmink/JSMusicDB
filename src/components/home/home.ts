import { LitElement, customElement, html, css } from 'lit-element';
import { nothing } from 'lit-html';
import { getRecentlyListened, getLastFMUserName } from '../../utils/lastfm';
import musicdb from '../musicdb';
import headers from '../../styles/headers';
import container from '../../styles/container';
import smallMuted from '../../styles/small-muted';
import panel from '../../styles/panel';

import { cdIcon } from '../icons/cd';

const INTERVAL = 1000 * 30;
const LATEST_ADDITIONS = 14;

const DUMMY_TRACK = {
  image: [null, { "#text": null}],
  album:{ "#text": "dummy"},
  artist:{ "#text": "dummy"},
  name: 'dummy',
  date: { uts: new Date().getTime() / 1000 },
  dummy: true
};

@customElement('home-nav')
export class HomeNav extends LitElement {
  recenttracks: Array<any>;
  recentAdded: Array<any>;
  counter: any;
  static get styles() {
    return css`
      ${container}
      .container {
        display: block;
      }
      ${headers}
      ${smallMuted}
    ${panel}
    ol {
        list-style: none;
        margin: 0 0 20px;
        padding: 0;
        width: 100%;
      }
      li {
        display: flex;
        min-height: 75px;
        border-top: 1px solid var(--background3);
        box-sizing: border-box;
        width: 100%;
        display: flex;
        padding: 10px 1rem;
        transition: all 0.2s ease-in-out;
      }
      li .album-art {
        margin-right: 1rem;
        flex-grow: 0;
        width: 54px;
        min-width: 54px;
        height: 54px;
        border: 1px solid var(--background3, #f3f4f5);
        box-shadow: 0px 0px 1px var(--primary, #006ecd);
      }
      li .details {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      li .time {
        flex-grow: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        width: 70px;
        min-width: 70px;
        white-space: nowrap;
      }
      li .playing {
        color: var(--primary, #006ecd);
        transition: color 0.2s ease-in-out;
      }
      li.dummy {
        filter: blur(4px);
        opacity: 0.8;
      }
      .grid {
        display: flex;
        flex-wrap: wrap;
        margin: 1rem 1rem 3rem;
        justify-content: space-evenly;
      }
      @media (min-width: 768px) {
        app-link:nth-child(11),
        app-link:nth-child(12),
        app-link:nth-child(13),
        app-link:nth-child(14) {
          display: none;
        }
      }
      @media (min-width: 992px) {
        app-link:nth-child(11),
        app-link:nth-child(12),
        app-link:nth-child(13),
        app-link:nth-child(14) {
          display: block;
        }
      }
      @media (min-width: 1200px) {
        app-link:nth-child(13),
        app-link:nth-child(14) {
          display: none;
        }
      }
    `;
  }
  constructor() {
    super();
    this.recenttracks = [];
    this.recentAdded = [];
    this.counter = -1;
    getLastFMUserName().then((name: any) => {
      if (name !== 'mdb-skipped') {
        this._setDummyData();
        this._poll(name);
      }
    });
    musicdb
      .then((mdb: any) => {
        this.recentAdded = mdb.getLatestAdditions(LATEST_ADDITIONS);
        this.requestUpdate();
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
  _poll(name: any) {
    getRecentlyListened(name).then(
      ({ recenttracks }: { recenttracks: any }) => {
        this.recenttracks = recenttracks?.track;
        this.requestUpdate();
        this.counter = setTimeout(() => {
          this._poll(name);
        }, INTERVAL);
      }
    );
  }
  _setDummyData() {
    for (let i = 0; i < 7; i++) {
      this.recenttracks.push(DUMMY_TRACK);
    }
    this.requestUpdate();
  }
  _formatDate(dateString: string) {
    const date = new Date(Number(dateString) * 1000);
    if (dateString !== '0') {
      const formatter = new Intl.DateTimeFormat('en-GB', {
        // @ts-ignore
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      const dateTime = formatter.format(date).split(', ');
      return html`
        <span>${dateTime[1]}</span>
        <span class="small muted">${dateTime[0]}</span>
      `;
    }
    return html`
      <span class="playing">Playing</span>
      <span class="small muted">Right now</span>
    `;
  }
  disconnectedCallback() {
    clearInterval(this.counter);
    super.disconnectedCallback();
  }
  _onError(e: Event) {
    // @ts-ignore
    e.target.src = `data:image/svg+xml;base64,${btoa(cdIcon.getHTML())}`;
  }
  render() {
    return html`
      ${this.recenttracks.length > 0
        ? html`
            <div class="container">
              <h2 class="header">Recently listened</h2>
              <ol>
                ${this.recenttracks.map(
                  (track: any) => html`
                    <li class="${track.dummy ? 'dummy ' : nothing}">
                      <img
                        src="${track.image[1]['#text']}"
                        class="album-art"
                        alt="${track.artist['#text']} • ${track.name}"
                        @error="${(e: Event) => this._onError(e)}"
                      />
                      <span class="details">
                        ${track.artist['#text']} • ${track.name}
                        <span class="small muted">${track.album['#text']}</span>
                      </span>
                      <span class="time">
                        ${this._formatDate(track?.date?.uts || '0')}
                      </span>
                    </li>
                  `
                )}
              </ol>
            </div>
          `
        : nothing}
      ${this.recentAdded.length > 0
        ? html`
            <div class="container">
              <h2 class="header">Recently added / updated</h2>
              <div class="grid">
                ${this.recentAdded.map(
                  (album: any) => html`
                    <app-link
                      href="/letter/${album.artist.letter
                        .escapedLetter}/artist/${album.artist
                        .escapedName}/album/${album.escapedName}"
                    >
                      <div class="panel">
                        <album-art
                          artist="${album.artist.albumArtist || album.artist.name}"
                          album="${album.name}"
                        ></album-art>
                        <div class="panel-info color-type-primary-alt">
                          <span>${album.name}</span>
                          ${album.year === 0
                            ? nothing
                            : html`
                                <span class="small muted"
                                  >Year: ${album.year}</span
                                >
                              `}
                        </div>
                      </div>
                    </app-link>
                  `
                )}
              </div>
            </div>
          `
        : nothing}
    `;
  }
}
