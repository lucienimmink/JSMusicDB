import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import container from '../../styles/container';
import headers from '../../styles/headers';
import home from '../../styles/home';
import panel from '../../styles/panel';
import smallMuted from '../../styles/small-muted';
import { global as EventBus } from '../../utils/EventBus';
import { getLastFMUserName, getRecentlyListened } from '../../utils/lastfm';
import {
  DUMMY_TRACK,
  getRecentlyPlayed,
  REFRESH,
  setRecentlyPlayed,
} from '../../utils/musicdb';
import { getJwt, getRSSFeed, getServer } from '../../utils/node-mp3stream';
import { SWITCH_ROUTE } from '../../utils/router';
import { cdSVG } from '../icons/cd';
import musicdb from '../musicdb';

@customElement('home-nav')
export class HomeNav extends LitElement {
  @state()
  recenttracks: Array<any>;
  @state()
  recentAdded: Array<any>;
  newReleases: Array<any>;
  counter: any;
  @state()
  active = false;

  private readonly INTERVAL = 1000 * 9;
  private readonly LATEST_ADDITIONS = 10;

  static get styles() {
    return [container, headers, smallMuted, panel, home];
  }
  constructor() {
    super();
    this.recenttracks = [];
    this.recentAdded = [];
    this.newReleases = [];
    this.counter = -1;
    this._init();
  }
  async connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this._init, this);
    EventBus.on(SWITCH_ROUTE, this.isActiveRoute, this);
    getLastFMUserName().then((name: any) => {
      if (name !== 'mdb-skipped') {
        this._setDummyData();
        this._updateRecentlyPlayed(name);
        if (this.counter !== -1) {
          clearInterval(this.counter);
          this.counter = -1;
        }
        if (this.active) this._poll(name);
      }
    });
    const jwt: any = await getJwt();
    const server: any = await getServer();
    if (jwt && server) {
      const list: any = [];
      const feed = await getRSSFeed(
        server,
        jwt,
        'https://en.metal-tracker.com/site/rss.html'
      );
      const parser = new DOMParser();
      const doc = parser.parseFromString(feed, 'application/xml');
      const items = doc.querySelectorAll('item');
      const mdb: any = await musicdb;
      items.forEach(item => {
        const release = item.querySelector('title')?.innerHTML;
        const artist = release?.split('-')[0].trim();
        const album = release?.split('-')[1].trim();
        const link = item.querySelector('link')?.innerHTML;
        const mbdArtist = mdb.getArtistByName(artist);
        if (mbdArtist) {
          list.push({ artist, album, link });
        } else {
          console.log(
            `new release: ${artist} - ${album} found but not found in musicdb; skipping release`
          );
        }
      });
      this.newReleases = list;
    }
  }
  isActiveRoute(event: Event, route: string) {
    this.active = route === 'home';
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._init, this);
    EventBus.off(SWITCH_ROUTE, this.isActiveRoute, this);
    clearInterval(this.counter);
  }
  _init() {
    musicdb
      .then((mdb: any) => {
        this.recentAdded = mdb.getLatestAdditions(this.LATEST_ADDITIONS);
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
  _poll(name: any) {
    this.counter = setInterval(() => {
      this._updateRecentlyPlayed(name);
    }, this.INTERVAL);
  }
  async _updateRecentlyPlayed(name: string) {
    this.recenttracks = await getRecentlyPlayed();
    getRecentlyListened(name)
      .then(async ({ recenttracks }: { recenttracks: any }) => {
        await setRecentlyPlayed(recenttracks?.track);
        this.recenttracks = await getRecentlyPlayed();
      })
      .catch(() => {
        //
      });
  }
  _setDummyData() {
    this.recenttracks = [];
    for (let i = 0; i < 7; i++) {
      this.recenttracks.push(DUMMY_TRACK);
    }
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
  _onError(e: Event) {
    // @ts-ignore
    e.target.src = `data:image/svg+xml;base64,${btoa(cdSVG)}`;
  }
  render() {
    return html`
      ${this.active
        ? html`
            ${this.recenttracks?.length > 0
              ? html`
                  <div class="container">
                    <h2 class="header">Recently listened</h2>
                    <ol>
                      ${this.recenttracks.map(
                        (track: any) => html`
                          <li class="${track.dummy ? 'dummy ' : ''}">
                            <img
                              src="${track.image[1]['#text']}"
                              class="album-art"
                              alt="${track.artist['#text']} • ${track.name}"
                              @error="${(e: Event) => this._onError(e)}"
                            />
                            <span class="details">
                              ${track.artist['#text']} • ${track.name}
                              <span class="small muted"
                                >${track.album['#text']}</span
                              >
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
                            <div class="panel panel-home">
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
            ${this.newReleases.length > 0
              ? html` <div class="container">
                  <h2 class="header">
                    New releases
                    <span class="small muted"
                      >(${this.newReleases.length})</span
                    >
                  </h2>
                  <ol>
                    ${this.newReleases.map(
                      (release: any) => html` <li>
                        <a
                          href="${release.link}"
                          target="_blank"
                          rel="noopener"
                        >
                          <album-art
                            artist="${release.artist}"
                            album="${release.album}"
                          ></album-art>
                          <span class="details">
                            ${release.artist} &bull; ${release.album}
                          </span>
                        </a>
                      </li>`
                    )}
                  </ol>
                </div>`
              : nothing}
          `
        : nothing}
    `;
  }
}
