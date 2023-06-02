import { localized, t } from '@weavedev/lit-i18next';
import { LitElement, html, nothing } from 'lit';
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
  REFRESH,
  getRecentlyPlayed,
  setRecentlyPlayed,
} from '../../utils/musicdb';
import { getJwt, getRSSFeed, getServer } from '../../utils/node-mp3stream';
import { UPDATE_TRACK } from '../../utils/player';
import { TOGGLE_SETTING, getSettingByName } from '../../utils/settings';
import { cdSVG } from '../icons/cd';
import { heartIcon } from '../icons/heart';
import { hqIcon } from '../icons/hq';
import musicdb from '../musicdb';

@customElement('home-nav')
@localized()
export class HomeNav extends LitElement {
  @state()
  recenttracks: Array<any>;
  @state()
  recentAdded: Array<any>;
  newReleases: Array<any>;
  counter: any;
  @state()
  currentTrack: any = window._track || null;

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
    EventBus.on(TOGGLE_SETTING, this._updateFeed, this);
    EventBus.on(UPDATE_TRACK, this._updatePlayer, this);

    getLastFMUserName().then(async (name: string) => {
      if (name !== 'mdb-skipped') {
        this._setDummyData();
        this.recenttracks = await getRecentlyPlayed();
        this._updateRecentlyPlayed(name);
        this._poll(name);
      }
    });
    this._updateFeed();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._init, this);
    EventBus.off(TOGGLE_SETTING, this._updateFeed, this);
    EventBus.off(UPDATE_TRACK, this._updatePlayer, this);
    clearInterval(this.counter);
  }
  _init() {
    musicdb
      .then((mdb: any) => {
        this.recentAdded = mdb.getLatestAdditions(this.LATEST_ADDITIONS);
        this._updateFeed();
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
  _updatePlayer(target: any, data: any) {
    this.currentTrack = data?.current;
    this.requestUpdate();
  }
  async _updateFeed() {
    const feedURL = await getSettingByName('feed');
    if (feedURL) {
      const jwt: any = await getJwt();
      const server: any = await getServer();
      if (jwt && server) {
        this.newReleases = [];
        const list: any = [];
        const feed = await getRSSFeed(server, jwt, feedURL);
        const parser = new DOMParser();
        const doc = parser.parseFromString(feed, 'application/xml');
        const items = doc.querySelectorAll('item');
        const mdb: any = await musicdb;
        items.forEach(item => {
          const release = item.querySelector('title')?.innerHTML;
          const splitted = release?.split('-');
          const artist = splitted?.splice(0, 1)[0].trim();
          const album = splitted
            ?.join('-')
            .trim()
            .replaceAll(` (Lossless)`, '');
          const isHires = release?.includes(` (Lossless)`);
          const link = item.querySelector('link')?.innerHTML;
          const mbdArtist = mdb.getArtistByName(artist);
          if (mbdArtist) {
            list.push({ artist, album, link, isHires });
          }
        });
        this.newReleases = list;
      }
    } else {
      this.newReleases = [];
    }
  }
  _poll(name: string) {
    this.counter = setInterval(() => {
      this._updateRecentlyPlayed(name);
    }, this.INTERVAL);
  }
  async _updateRecentlyPlayed(name: string) {
    let lastFMTracks = [];
    if (name !== 'mdb-skipped') {
      const { recenttracks } = await getRecentlyListened(name);
      lastFMTracks = recenttracks?.track;
    }
    const tracks = lastFMTracks?.filter((track: any) => {
      if (track['@attr']?.nowplaying) {
        return false;
      }
      return true;
    });
    await setRecentlyPlayed(tracks);
    this.recenttracks = tracks;
  }
  _setDummyData() {
    this.recenttracks = [];
    for (let i = 0; i < 7; i++) {
      this.recenttracks.push(DUMMY_TRACK);
    }
  }
  _formatDate(dateString: string, track: any = null) {
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
    if (track) {
      return html`
        ${track.isPlaying
          ? html`<span class="playing">${t('labels.playing')}</span>`
          : html`<span class="playing">${t('labels.paused')}</span>`}
        <span class="small muted">${t('labels.right-now')}</span>
      `;
    }
    return html`
      <span class="playing">${t('labels.playing')}</span>
      <span class="small muted">${t('labels.right-now')}</span>
    `;
  }
  _onError(e: Event) {
    // @ts-ignore
    e.target.src = `data:image/svg+xml;base64,${btoa(cdSVG)}`;
  }

  private _renderRecentTracks() {
    return html`${this.recenttracks?.length > 0 || this.currentTrack
      ? html`
          <div class="container">
            <h2 class="header">${t('headers.recently-listened')}</h2>
            <ol>
              ${this.currentTrack
                ? html`
                    <li>
                      <div>
                        <album-art
                          artist="${this.currentTrack?.artist?.albumArtist ||
                          this.currentTrack?.artist?.name}"
                          album="${this.currentTrack?.album?.name}"
                        ></album-art>
                      </div>
                      <span class="details">
                        <span
                          >${this.currentTrack?.artist?.albumArist ||
                          this.currentTrack?.artist?.name}
                          • ${this.currentTrack?.title}
                          <br />
                          <span class="small muted"
                            >${this.currentTrack?.album?.name}</span
                          >
                        </span>
                      </span>
                      <span class="time">
                        ${this._formatDate('0', this.currentTrack)}
                      </span>
                    </li>
                  `
                : nothing}
              ${this.recenttracks.map(
                (track: any) => html`
                  <li class="${track.dummy ? 'dummy ' : ''}">
                    <div>
                      <img
                        src="${track?.image[2]['#text']}"
                        class="album-art"
                        alt="${track.artist['#text']} • ${track.name}"
                        @error="${(e: Event) => this._onError(e)}"
                      />
                      ${track.loved === '1'
                        ? html`<span class="heart">${heartIcon}</span>`
                        : nothing}
                    </div>
                    <span class="details">
                      <span
                        >${track.artist.name} • ${track.name}
                        <br />
                        <span class="small muted">${track.album['#text']}</span>
                      </span>
                    </span>
                    <span class="time">
                      ${this._formatDate(track?.date?.uts || '0', track)}
                    </span>
                  </li>
                `
              )}
            </ol>
          </div>
        `
      : nothing}`;
  }
  private _renderRecentlyAdded() {
    return html`${this.recentAdded.length > 0
      ? html`
          <div class="container">
            <h2 class="header">${t('headers.recently-added')}</h2>
            <div class="grid">
              ${this.recentAdded.map(
                (album: any) => html`
                  <app-link
                    href="/letter/${album.artist.letter
                      ?.escapedLetter}/artist/${album.artist
                      ?.escapedName}/album/${album.escapedName}"
                  >
                    <div class="panel panel-home">
                      <album-art
                        artist="${album.artist.albumArtist ||
                        album.artist.name}"
                        album="${album.name}"
                        no-lazy
                      ></album-art>
                      <div class="panel-info color-type-primary-alt">
                        <span>${album.name}</span>
                        ${album.year === 0
                          ? nothing
                          : html`
                              <span class="small muted"
                                >${t('labels.year')}: ${album.year}</span
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
      : nothing}`;
  }
  private _renderNewReleases() {
    return html`${this.newReleases.length > 0
      ? html` <div class="container">
          <h2 class="header">
            ${t('headers.new-releases')}
            <span class="small muted">(${this.newReleases.length})</span>
          </h2>
          <ol>
            ${this.newReleases.map(
              (release: any) => html` <a
                href="${release.link}"
                target="_blank"
                rel="noopener"
              >
                <div>
                  <album-art
                    artist="${release.artist}"
                    album="${release.album}"
                    static
                  ></album-art>
                </div>
                <span class="details"
                  ><span>
                    ${release.artist} &bull; ${release.album}
                    ${release.isHires
                      ? html`<span class="small muted hq-icon">${hqIcon}</span>`
                      : nothing}
                  </span>
                </span>
              </a>`
            )}
          </ol>
        </div>`
      : nothing}`;
  }

  render() {
    return html`
      ${this._renderRecentTracks()} ${this._renderRecentlyAdded()}
      ${this._renderNewReleases()}
    `;
  }
}
