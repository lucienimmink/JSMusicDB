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

import '../album/album-in-grid';
import { LOCALE, getRelativeTime } from '../../utils/date';

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(LOCALE, {
  // @ts-ignore
  dateStyle: 'medium',
  timeStyle: 'short',
});

@customElement('home-nav')
export class HomeNav extends LitElement {
  @state()
  recenttracks: Array<any>;
  @state()
  recentAdded: Array<any>;
  newReleases: Array<any>;
  private pollTimer: number | undefined;
  @state()
  // @ts-ignore
  currentTrack: any = window._track || null;
  @state()
  recentlyListenedLimit = '6';

  private readonly INTERVAL = 1000 * 9;
  private readonly LATEST_ADDITIONS = 12;

  static get styles() {
    return [container, headers, smallMuted, panel, home];
  }
  constructor() {
    super();
    this.recenttracks = [];
    this.recentAdded = [];
    this.newReleases = [];
  }
  connectedCallback() {
    super.connectedCallback();

    EventBus.on(REFRESH, this._init, this);
    EventBus.on(TOGGLE_SETTING, this._updateFeed, this);
    EventBus.on(UPDATE_TRACK, this._updatePlayer, this);

    void this._init();
    void this._loadRecentTracks();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._init, this);
    EventBus.off(TOGGLE_SETTING, this._updateFeed, this);
    EventBus.off(UPDATE_TRACK, this._updatePlayer, this);
    if (this.pollTimer !== undefined) {
      window.clearTimeout(this.pollTimer);
      this.pollTimer = undefined;
    }
  }
  async _init() {
    const mdb: any = await musicdb;
    if (!this.isConnected) return;
    this.recentAdded = mdb.getLatestAdditions(this.LATEST_ADDITIONS);
    this.recentlyListenedLimit =
      (await getSettingByName('recentlyListenedLimit')) || '6';
    await this._updateFeed();
  }
  private async _loadRecentTracks() {
    const name = await getLastFMUserName();
    if (!this.isConnected || name === 'mdb-skipped') return;

    try {
      this._setDummyData();
      this.recenttracks = await getRecentlyPlayed();
      if (this.isConnected) await this._updateRecentlyPlayed(name);
    } catch (error) {
      console.error('Unable to load recently played tracks:', error);
    } finally {
      if (this.isConnected) this._poll(name);
    }
  }
  // @ts-ignore
  _updatePlayer(target: any, data: any) {
    this.currentTrack = data?.current;
    this.requestUpdate();
  }
  async _updateFeed(_target?: object, setting?: { setting?: string }) {
    if (setting?.setting && setting.setting !== 'feed') return;

    const feedURL = await getSettingByName('feed');
    if (!feedURL) {
      this.newReleases = [];
      return;
    }

    const [jwt, server] = await Promise.all([getJwt(), getServer()]);
    if (!jwt || !server) return;

    this.newReleases = [];
    const feed = await getRSSFeed(server, jwt, feedURL);
    const document = new DOMParser().parseFromString(feed, 'application/xml');
    const mdb: any = await musicdb;
    const releases: any[] = [];
    document.querySelectorAll('item').forEach(item => {
      const release = this._parseReleaseItem(item, mdb);
      if (release) releases.push(release);
    });
    this.newReleases = releases;
  }
  private _parseReleaseItem(item: Element, mdb: any) {
    const title = item.querySelector('title')?.textContent;
    if (!title) return null;

    const [rawArtist, ...albumParts] = title.split('-');
    const artist = rawArtist.trim();
    const album = albumParts.join('-').trim().replaceAll(' (Lossless)', '');
    if (!artist || !album || !mdb.getArtistByName(artist)) return null;

    return {
      artist,
      album,
      link: item.querySelector('link')?.textContent,
      isHires: title.includes(' (Lossless)'),
    };
  }
  _poll(name: string) {
    this.pollTimer = window.setTimeout(async () => {
      try {
        if (this.isConnected) await this._updateRecentlyPlayed(name);
      } catch (error) {
        console.error('Unable to update recently played tracks:', error);
      } finally {
        if (this.isConnected) this._poll(name);
      }
    }, this.INTERVAL);
  }
  async _updateRecentlyPlayed(name: string) {
    let lastFMTracks = [];
    if (name !== 'mdb-skipped') {
      const { recenttracks } = await getRecentlyListened(
        name,
        this.recentlyListenedLimit,
      );
      lastFMTracks = recenttracks?.track;
    }
    const tracks = lastFMTracks?.filter((track: any) => {
      if (track['@attr']?.nowplaying) {
        return false;
      }
      return true;
    });
    if (tracks) {
      await setRecentlyPlayed(tracks);
      this.recenttracks = tracks;
    }
  }
  _setDummyData() {
    this.recenttracks = [];
    for (let i = 0; i < 7; i++) {
      this.recenttracks.push(DUMMY_TRACK);
    }
  }
  _formatDate(dateString: string, track: any = null) {
    const date = new Date(Number(dateString) * 1000);
    if (dateString === '0') {
      const state = !track || track.isPlaying ? 'Playing' : 'Paused';
      return html`<span class="playing">${state}</span>
        <span class="small muted">right now</span>`;
    }

    const dateTime = DATE_TIME_FORMATTER.format(date).split(', ');
    return html`
      <span>${dateTime[1]}</span>
      <span class="small muted"
        >${getRelativeTime(date.getTime(), { skipToday: true })}</span
      >
    `;
  }
  _onError(e: Event) {
    // @ts-ignore
    e.target.src = `data:image/svg+xml;base64,${btoa(cdSVG)}`;
  }
  private _renderCurrentTrack() {
    return html`<li>
      <div>
        <album-art
          artist="${
            this.currentTrack?.artist?.albumArtist ||
            this.currentTrack?.artist?.name
          }"
          album="${this.currentTrack?.album?.name}"
          mbid="${this.currentTrack?.album?.mbid}"
          dimension="70"
          static
        ></album-art>
      </div>
      <span class="details">
        <span>
          ${this.currentTrack?.trackArtist} • ${this.currentTrack?.title}
          <br />
          <span class="small muted">${this.currentTrack?.album?.name}</span>
        </span>
      </span>
      <span class="time">${this._formatDate('0', this.currentTrack)}</span>
    </li>`;
  }
  private _renderRecentTrack(track: any) {
    return html`<li class="${track.dummy ? 'dummy ' : ''}">
      <div>
        <img
          src="${track?.image?.[2]?.['#text']}"
          class="album-art"
          alt="${track.artist.name} • ${track.name}"
          @error="${this._onError}"
          crossorigin="anonymous"
        />
        ${
          track.loved === '1'
            ? html`<span class="heart">${heartIcon}</span>`
            : nothing
        }
      </div>
      <span class="details">
        <span>
          ${track.artist.name} • ${track.name}
          <br />
          <span class="small muted">${track.album['#text']}</span>
        </span>
      </span>
      <span class="time">
        ${this._formatDate(track?.date?.uts || '0', track)}
      </span>
    </li>`;
  }
  private _renderRecentTracks() {
    if (!this.recenttracks?.length && !this.currentTrack) return nothing;

    return html`<div class="container">
      <h2 class="header">Recently listened</h2>
      <ol>
        ${this.currentTrack ? this._renderCurrentTrack() : nothing}
        ${this.recenttracks.map(track => this._renderRecentTrack(track))}
      </ol>
    </div>`;
  }
  private _renderRecentlyAdded() {
    return html`${
      this.recentAdded.length > 0
        ? html`
            <div class="container">
              <h2 class="header">Recently added</h2>
              <div class="grid">
                ${this.recentAdded?.map(
                  (album: any) => html`
                    <album-in-grid .album=${album} home></album-in-grid>
                  `,
                )}
              </div>
            </div>
          `
        : nothing
    }`;
  }
  private _renderNewReleases() {
    return html`${
      this.newReleases.length > 0
        ? html` <div class="container">
            <h2 class="header">
              New releases
              <span class="small muted">(${this.newReleases.length})</span>
            </h2>
            <ol>
              ${this.newReleases?.map(
                (release: any) =>
                  html` <a
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
                        ${
                          release.isHires
                            ? html`<span class="small muted hq-icon"
                                >${hqIcon}</span
                              >`
                            : nothing
                        }
                      </span>
                    </span>
                  </a>`,
              )}
            </ol>
          </div>`
        : nothing
    }`;
  }

  render() {
    return html`
      ${this._renderRecentTracks()} ${this._renderRecentlyAdded()}
      ${this._renderNewReleases()}
    `;
  }
}
