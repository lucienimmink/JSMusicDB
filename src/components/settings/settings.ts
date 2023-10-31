import timeSpan from '@addasoft/timespan';
import { clear, createStore } from 'idb-keyval';
import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import buttons from '../../styles/buttons';
import container from '../../styles/container';
import headers from '../../styles/headers';
import responsive from '../../styles/responsive';
import settings from '../../styles/settings';
import smallMuted from '../../styles/small-muted';
import { global as EventBus } from '../../utils/EventBus';
import { updateSunriseData } from '../../utils/colour';
import {
  RESET_LASTFM,
  getLastFMUserName,
  removeLastFMLink,
} from '../../utils/lastfm';
import { REFRESH } from '../../utils/musicdb';
import {
  DONE_RELOADING,
  HAS_SSE,
  IS_RELOADING,
  RESET_SERVER,
  canGetRSSFeed,
  getJwt,
  getRescan,
  getServer,
  getVersion,
  resetServer,
} from '../../utils/node-mp3stream';
import {
  TOGGLE_SETTING,
  getLastParsed,
  getSettings,
  setSetting,
} from '../../utils/settings';
import { cloudDownloadIcon } from '../icons/cloudDownload';
import { disconnectIcon } from '../icons/disconnect';
import { syncIcon } from '../icons/sync';
import { trashIcon } from '../icons/trash';
import { unlinkIcon } from '../icons/unlink';
import musicdb, { updateAndRefresh } from '../musicdb';

@customElement('settings-nav')
export class SettingsNav extends LitElement {
  @state()
  settings: any;
  stats: any;
  @state()
  lastFMUsername: any;
  @state()
  mp3stream: any;
  mdb: any;
  @state()
  isReloading: boolean;
  showVersion: boolean;
  @state()
  canGetRSSFeed = false;

  static get styles() {
    return [buttons, container, headers, smallMuted, responsive, settings];
  }
  constructor() {
    super();
    this.settings = {};
    this.stats = {};
    this.mdb = null;
    this.lastFMUsername = '';
    this.mp3stream = '';
    this.isReloading = false;
    this.showVersion = true;
    this._init();
    getSettings().then(async (setting: any) => {
      this.settings = setting;
      if (!this.settings) {
        this.settings = {};
      }
      await updateSunriseData(this.settings?.gps || false);
      if (!this.settings?.theme) {
        this.settings.theme = 'light';
      }
      this.lastFMUsername = await getLastFMUserName();
      this.mp3stream = await getServer();
      if (this.mp3stream && this.stats) {
        this.stats.mp3stream = await getVersion(this.mp3stream);
      }
      this.canGetRSSFeed = await canGetRSSFeed(this.mp3stream);
    });
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this._init, this);
    EventBus.on(IS_RELOADING, this._setIsReloadingTrue, this);
    EventBus.on(DONE_RELOADING, this._setIsReloadingFalse, this);
    EventBus.on(HAS_SSE, this._updateSEE, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._init, this);
    EventBus.off(IS_RELOADING, this._setIsReloadingTrue, this);
    EventBus.off(DONE_RELOADING, this._setIsReloadingFalse, this);
    EventBus.off(HAS_SSE, this._updateSEE, this);
  }
  private _init() {
    musicdb
      .then(async (mdb: any) => {
        this.mdb = mdb;
        this._populateStats();
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
  private _setIsReloadingTrue() {
    this.isReloading = true;
  }
  private async _setIsReloadingFalse() {
    this.isReloading = false;
    await this._refreshCollection();
  }
  private _updateSEE(event: Event, value: boolean) {
    this.stats.isUsingSSE = value;
  }
  _formatDate(date: any, fallback: string) {
    if (!date) {
      return fallback;
    }
    const formatter = new Intl.DateTimeFormat('en-GB', {
      // @ts-ignore
      timeStyle: 'medium',
    });
    return formatter.format(date);
  }
  private async _populateStats() {
    this.stats.albums = this.mdb.totals.albums;
    this.stats.artists = this.mdb.totals.artists;
    this.stats.tracks = this.mdb.totals.tracks;
    this.stats.time = timeSpan(this.mdb.totals.playingTime, true, 'en-GB');
    this.stats.parsingTime = this.mdb.totals.parsingTime;
    const date = await getLastParsed();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      // @ts-ignore
      dateStyle: 'full',
      timeStyle: 'medium',
    });
    this.stats.parsed = formatter.format(date);
    this.requestUpdate();
  }
  async _toggle(prop: string, e: Event, value: any = null) {
    // e.preventDefault();
    const current = this.settings ? this.settings[prop] : false;
    if (!value) {
      value = !current;
    }
    if (prop === 'gps') {
      await updateSunriseData(value);
    }
    if (prop === 'visual' && value === false) {
      await setSetting('smallArt', false);
      EventBus.emit(TOGGLE_SETTING, this, {
        setting: 'smallArt',
        value: false,
      });
    }
    await setSetting(prop, value);
    EventBus.emit(TOGGLE_SETTING, this, { setting: prop, value });
    this.settings = await getSettings();
  }
  async _setFeed(e: Event) {
    // @ts-ignore
    const value = e?.target?.value;
    await setSetting('feed', value);
    EventBus.emit(TOGGLE_SETTING, this, {
      setting: 'feed',
      value,
    });
    this.settings = await getSettings();
  }
  async _reloadCollection() {
    const jwt: any = await getJwt();
    const server: any = await getServer();
    if (jwt && server) {
      getRescan(server, jwt);
      this.isReloading = true;
    }
  }
  async _refreshCollection() {
    this.stats.parsingTime = 0;
    this.requestUpdate();
    await updateAndRefresh();
    this._populateStats();
  }
  async _resetmp3Stream() {
    await resetServer();
    this.mp3stream = null;
    EventBus.emit(RESET_SERVER, this);
  }
  async _resetLastfM() {
    await removeLastFMLink();
    this.lastFMUsername = null;
    EventBus.emit(RESET_LASTFM, this);
  }
  _clearImageCache() {
    clear(createStore('album-art-db', 'album-art-store'));
  }
  private _renderUserInfo() {
    return html`<div class="container container-block">
      <h2 class="header">User settings</h2>
      <p>
        Linked to node-mp3stream server:
        ${this.mp3stream ? this.mp3stream : 'false'}
        ${this.mp3stream
          ? html`<button
              class="btn btn-secondary btn-small"
              @click=${this._resetmp3Stream}
            >
              <span class="icon">${disconnectIcon}</span> Disconnect
            </button>`
          : nothing}
      </p>
      <p>
        Linked to last.fm account:
        ${this?.lastFMUsername !== 'mdb-skipped' ? this.lastFMUsername : 'none'}
        ${this?.lastFMUsername
          ? html`<button
              class="btn btn-secondary btn-small"
              @click=${this._resetLastfM}
            >
              <span class="icon">${unlinkIcon}</span> ${this?.lastFMUsername !==
              'mdb-skipped'
                ? html`Unlink`
                : html`Link`}
            </button>`
          : nothing}
      </p>
    </div>`;
  }
  private _renderCollectionSettings() {
    return html`<div class="container container-block">
      <h2 class="header">Collection settings</h2>
      <p>
        Collection:
        <button
          class="btn btn-secondary btn-small"
          ?disabled="${!this.stats?.parsingTime}"
          @click=${() => {
            this._refreshCollection();
          }}
        >
          <span class="icon">${syncIcon}</span> Refresh
        </button>
        <button
          class="btn btn-primary btn-small"
          ?disabled="${this.isReloading}"
          @click=${() => {
            this._reloadCollection();
          }}
        >
          <span class="icon">${cloudDownloadIcon}</span> Reload
        </button>
      </p>
      <p>
        Purge image cache:
        <button
          class="btn btn-secondary btn-small"
          @click=${this._clearImageCache}
        >
          <span class="icon">${trashIcon}</span> Clear
        </button>
      </p>
    </div>`;
  }
  private _renderPlayerSettings() {
    return html`<div class="container container-block">
      <h2 class="header">Player settings</h2>
      <p>
        <label>
          <input
            type="checkbox"
            ?checked=${this.settings?.playliststate}
            @click="${(e: Event) => this._toggle('playliststate', e)}"
          />
          Save playlist state
        </label>
      </p>
      <p>
        <label>
          <input
            type="checkbox"
            @click="${(e: Event) => this._toggle('manualScrobble', e)}"
            ?checked=${this.settings?.manualScrobble}
          />
          Manual scrobbling
        </label>
      </p>
      <p>
        <label>
          <input
            type="checkbox"
            @click="${(e: Event) => this._toggle('continues', e)}"
            ?checked=${this.settings?.continues}
          />
          Continues play mode
        </label>
      </p>
      <p>
        <label>
          <input
            type="checkbox"
            @click="${(e: Event) => this._toggle('replaygain', e)}"
            ?checked=${this.settings?.replaygain}
          />
          Apply replaygain
        </label>
      </p>
      <p>
        <label>
          <input
            type="checkbox"
            @click="${(e: Event) => this._toggle('followTrack', e)}"
            ?checked=${this.settings?.followTrack}
          />
          Show album if track changes
        </label>
      </p>
    </div>`;
  }
  private _renderThemeSettings() {
    return html`<div class="container container-block">
        <h2 class="header">Theme settings</h2>
        <p>
          <label>
            <input
              type="checkbox"
              @click="${(e: Event) => this._toggle('dynamicTheme', e)}"
              ?checked=${this.settings?.dynamicTheme}
            />
            Dynamic accent colour
          </label>
        </p>
        <p class="radio-group">
          <label>
            <input
              type="radio"
              @click="${(e: Event) => this._toggle('theme', e, 'light')}"
              .checked=${this.settings?.theme === 'light'}
            />
            Light theme
          </label>
          <label>
            <input
              type="radio"
              @click="${(e: Event) => this._toggle('theme', e, 'dark')}"
              .checked=${this.settings?.theme === 'dark'}
            />
            Dark theme
          </label>
          <label>
            <input
              type="radio"
              @click="${(e: Event) => this._toggle('theme', e, 'system')}"
              .checked=${this.settings?.theme === 'system'}
            />
            System theme
          </label>
          <label>
            <input
              type="radio"
              @click="${(e: Event) => this._toggle('theme', e, 'auto')}"
              .checked=${this.settings?.theme === 'auto'}
            />
            Dynamic theme&nbsp;
            <span class="small muted"
              >Dark theme between ${this._formatDate(
                this.settings?.start,
                '21:00:00',
              )} and ${this._formatDate(this.settings?.stop, '09:00:00')}
              </span>
          </label>
        </p>
        ${
          this.settings?.theme === 'auto'
            ? html`
                <p>
                  <label>
                    <input
                      type="checkbox"
                      @click="${(e: Event) => this._toggle('gps', e)}"
                      ?checked=${this.settings?.gps}
                    />
                    Track location to precisly determine when to switch to dark
                    theme
                  </label>
                </p>
              `
            : nothing
        }
        </div>
        <div class="container container-block md-up">
          <h2 class="header">Now playing screen settings</h2>
            <p>
              <label>
                <input
                  type="checkbox"
                  @click="${(e: Event) => this._toggle('visual', e)}"
                  .checked=${this.settings?.visual}
                />
                Show visualisation during playback
              </label>
            </p>
            <p>
              ${
                this.settings?.visual
                  ? html`
                      <label>
                        <input
                          type="checkbox"
                          @click="${(e: Event) =>
                            this._toggle('classicVis', e)}"
                          .checked=${this.settings?.classicVis}
                        />
                        Show classic LED visualisation
                      </label>
                    `
                  : nothing
              }
            </p>
            <p>
              ${
                this.settings?.visual
                  ? html`
                      <label>
                        <input
                          type="checkbox"
                          @click="${(e: Event) => this._toggle('smallArt', e)}"
                          .checked=${this.settings?.smallArt}
                        />
                        Show smaller album art
                      </label>
                    `
                  : nothing
              }
            </p>
          </div>
      </div>`;
  }
  private _renderRSSFeedSettings() {
    return html`${this.canGetRSSFeed
      ? html`
          <div class="container container-block">
            <h2 class="header">RSS Feed for showing upcoming releases</h2>
            <p>
              <input
                type="url"
                placeholder="RSS feed URL for upcoming releases. Leave empty to disable."
                .value=${this.settings?.feed || ''}
                @change="${(e: Event) => this._setFeed(e)}"
              />
            </p>
          </div>
        `
      : nothing}`;
  }
  private _renderInformation() {
    return html`<div class="container container-block">
      <h2 class="header">Statistics</h2>
      <p>Artists: ${this.stats?.artists}</p>
      <p>Albums: ${this.stats?.albums}</p>
      <p>Tracks: ${this.stats?.tracks}</p>
      <p>Total playing time: ${this.stats?.time}</p>
      <p>Time needed to parse: ${this.stats?.parsingTime}ms</p>
      <p>Last updated: ${this.stats?.parsed}</p>
      ${this.showVersion
        ? html`<p>Version: ${import.meta.env.PACKAGE_VERSION}</p>`
        : nothing}
      ${this.stats?.mp3stream
        ? html` <p>Node-mp3stream version: ${this.stats?.mp3stream}</p> `
        : nothing}
    </div>`;
  }
  render() {
    return html`
      ${this._renderUserInfo()} ${this._renderCollectionSettings()}
      ${this._renderPlayerSettings()} ${this._renderThemeSettings()}
      ${this._renderRSSFeedSettings()} ${this._renderInformation()}
    `;
  }
}
