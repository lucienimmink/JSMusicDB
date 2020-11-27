import { LitElement, customElement, html } from 'lit-element';
import { nothing } from 'lit-html';
import { getRecentlyListened, getLastFMUserName } from '../../utils/lastfm';
import musicdb from '../musicdb';
import headers from '../../styles/headers';
import container from '../../styles/container';
import smallMuted from '../../styles/small-muted';
import panel from '../../styles/panel';

import { cdIcon } from '../icons/cd';
import home from '../../styles/home';
import { DUMMY_TRACK } from '../../utils/musicdb';

const INTERVAL = 1000 * 30;
const LATEST_ADDITIONS = 14;

@customElement('home-nav')
export class HomeNav extends LitElement {
  recenttracks: Array<any>;
  recentAdded: Array<any>;
  counter: any;
  static get styles() {
    return [container, headers, smallMuted, panel, home];
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
                          artist="${album.artist.albumArtist ||
                          album.artist.name}"
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
