import { LitElement, customElement, html } from 'lit-element';
import musicdb, { updateAndRefresh } from '../musicdb';
import timeSpan from '../../utils/timespan';
import {
  getLastParsed,
  setSetting,
  getSettings,
  TOGGLE_SETTING,
} from '../../utils/settings';
import {
  getLastFMUserName,
  removeLastFMLink,
  RESET_LASTFM,
} from '../../utils/lastfm';
import {
  DONE_RELOADING,
  getJwt,
  getRescan,
  getServer,
  IS_RELOADING,
  resetServer,
  RESET_SERVER,
} from '../../utils/node-mp3stream';
import headers from '../../styles/headers';
import container from '../../styles/container';
import smallMuted from '../../styles/small-muted';
import responsive from '../../styles/responsive';
import buttons from '../../styles/buttons';
import { nothing } from 'lit-html';
import { updateSunriseData } from '../../utils/colour';
import settings from '../../styles/settings';
import { REFRESH } from '../../utils/musicdb';
import { global as EventBus } from '../../utils/EventBus';
import { trashIcon } from '../icons/trash';
import { syncIcon } from '../icons/sync';
import { clear, createStore } from 'idb-keyval';
import { cloudDownloadIcon } from '../icons/cloudDownload';

@customElement('settings-nav')
export class LetterNav extends LitElement {
  settings: any;
  stats: any;
  lastFMUsername: any;
  mp3stream: any;
  isReloading: boolean;
  showVersion: boolean;
  static get styles() {
    return [buttons, container, headers, smallMuted, responsive, settings];
  }
  constructor() {
    super();
    this.settings = {};
    this.stats = {};
    this.lastFMUsername = '';
    this.mp3stream = '';
    this.isReloading = false;
    this.showVersion = true;
    this._init();
    this._listen();
    getSettings().then(async (settings: any) => {
      this.settings = settings;
      if (!this.settings) {
        this.settings = {};
      }
      await updateSunriseData(this.settings?.gps || false);
      if (!this.settings?.theme) {
        this.settings.theme = 'light';
      }
      this.lastFMUsername = await getLastFMUserName();
      this.mp3stream = await getServer();
      this.requestUpdate();
    });
  }
  _listen() {
    EventBus.on(REFRESH, this._init, this);
    EventBus.on(
      IS_RELOADING,
      () => {
        this.isReloading = true;
        this.requestUpdate();
      },
      this
    );
    EventBus.on(
      DONE_RELOADING,
      () => {
        this.isReloading = false;
        this.requestUpdate();
      },
      this
    );
  }
  private _init() {
    musicdb
      .then((mdb: any) => {
        this.stats.albums = mdb.totals.albums;
        this.stats.artists = mdb.totals.artists;
        this.stats.tracks = mdb.totals.tracks;
        this.stats.time = timeSpan(mdb.totals.playingTime, true);
        this.stats.parsingTime = mdb.totals.parsingTime;
        getLastParsed().then((date: any) => {
          const formatter = new Intl.DateTimeFormat('en-GB', {
            // @ts-ignore
            dateStyle: 'full',
            timeStyle: 'medium',
          });
          this.stats.parsed = formatter.format(date);
          this.requestUpdate();
        });
        this.requestUpdate();
      })
      .catch((error: any) => {
        console.log(error);
      });
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
  async _toggle(prop: string, e: Event, value: any = null) {
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
    this.requestUpdate();
  }
  async _reloadCollection() {
    const jwt: any = await getJwt();
    const server: any = await getServer();
    if (jwt && server) {
      getRescan(server, jwt);
      this.isReloading = true;
      this.requestUpdate();
    }
  }
  async _refreshCollection() {
    this.stats.parsingTime = 0;
    this.requestUpdate();
    await updateAndRefresh();
    this._init();
  }
  async _resetmp3Stream() {
    await resetServer();
    this.mp3stream = null;
    EventBus.emit(RESET_SERVER, this);
    this.requestUpdate();
  }
  async _resetLastfM() {
    await removeLastFMLink();
    this.lastFMUsername = null;
    EventBus.emit(RESET_LASTFM, this);
    this.requestUpdate();
  }
  _clearImageCache() {
    clear(createStore('album-art-db', 'album-art-store'));
  }
  render() {
    return html`
      <div class="container">
        <h2 class="header">User information</h2>
        <p>
          Linked to last.fm:
          ${
            this?.lastFMUsername !== 'mdb-skipped'
              ? this.lastFMUsername
              : 'false'
          }
          ${
            this?.lastFMUsername
              ? html`<button
                  class="btn btn-secondary btn-small"
                  @click=${this._resetLastfM}
                >
                  <span class="icon">${trashIcon}</span> ${this
                    ?.lastFMUsername !== 'mdb-skipped'
                    ? html`un`
                    : html`re`}link
                </button>`
              : nothing
          }
        </p>
        <p>
          Connected to Node-mp3stream:
          ${this.mp3stream ? this.mp3stream : 'false'}
          ${
            this.mp3stream
              ? html`<button
                  class="btn btn-secondary btn-small"
                  @click=${this._resetmp3Stream}
                >
                  <span class="icon">${trashIcon}</span> disconnect
                </button>`
              : nothing
          }
        </p>
      </div>
      <div class="container">
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
            <span class="icon">${syncIcon}</span> Refresh now
          </button>
          <button
            class="btn btn-primary btn-small"
            ?disabled="${this.isReloading}"
            @click=${() => {
              this._reloadCollection();
            }}
          >
            <span class="icon">${cloudDownloadIcon}</span> Reload now
          </button>
        </p>
        <p>
          Purge image cache:
          <button
            class="btn btn-secondary btn-small"
            @click=${this._clearImageCache}
          >
            <span class="icon">${trashIcon}</span> clear
          </button>
        </p>
      </div>

      <div class="container">
        <h2 class="header">Player settings</h2>
        <p>
          <label>
            Save playliststate
            <input
              type="checkbox"
              ?checked=${this.settings?.playliststate}
              @click="${(e: Event) => this._toggle('playliststate', e)}"
          /></label>
        </p>
        <p>
          <label>
            Manual scrobbling
            <input
              type="checkbox"
              @click="${(e: Event) => this._toggle('manualScrobble', e)}"
              ?checked=${this.settings?.manualScrobble}
            />
          </label>
        </p>
        <p>
          <label>
            Continues play
            <input
              type="checkbox"
              @click="${(e: Event) => this._toggle('continues', e)}"
              ?checked=${this.settings?.continues}
            />
          </label>
        </p>
        <p>
          <label>
            Apply ReplayGain
            <input
              type="checkbox"
              @click="${(e: Event) => this._toggle('replaygain', e)}"
              ?checked=${this.settings?.replaygain}
            />
        </p>
      </div>

      <div class="container">
        <h2 class="header">Interface settings</h2>
        <p>
          <label>
            Dynamic accent colour
            <input
              type="checkbox"
              @click="${(e: Event) => this._toggle('dynamicTheme', e)}"
              ?checked=${this.settings?.dynamicTheme}
            />
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
              >Dark mode between
              ${this._formatDate(this.settings?.start, '21:00:00')} and
              ${this._formatDate(this.settings?.stop, '09:00:00')}</span
            >
          </label>
          <br />
        </p>
        ${
          this.settings?.theme === 'auto'
            ? html`
                <p>
                  <label>
                    Track location for more accurate theme switching
                    <input
                      type="checkbox"
                      @click="${(e: Event) => this._toggle('gps', e)}"
                      ?checked=${this.settings?.gps}
                    />
                  </label>
                </p>
              `
            : nothing
        }
        <p class="md-up-flex">
          <label>
            Show visualisation on now-playing screen
            <input
              type="checkbox"
              @click="${(e: Event) => this._toggle('visual', e)}"
              ?checked=${this.settings?.visual}
            />
          </label>
        </p>
        ${
          this.settings?.visual
            ? html`
                <p class="md-up-flex">
                  <label>
                    Show smaller album-art on now-playing screen
                    <input
                      type="checkbox"
                      @click="${(e: Event) => this._toggle('smallArt', e)}"
                      ?checked=${this.settings?.smallArt}
                    />
                  </label>
                </p>
              `
            : nothing
        }
      </div>

      <div class="container">
        <h2 class="header">Information</h2>
        <p>Artists: ${this.stats?.artists}</p>
        <p>Albums: ${this.stats?.albums}</p>
        <p>Tracks: ${this.stats?.tracks}</p>
        <p>Playing time: ${this.stats?.time}</p>
        <p>Parsing time: ${this.stats?.parsingTime}ms</p>
        <p>Last updated: ${this.stats?.parsed}</p>
        ${this.showVersion ? html`<p>Build: [VI]{version}[/VI]</p>` : nothing}
        ${
          this.stats?.mp3stream
            ? html` <p>Node-mp3stream: ${this.stats?.mp3stream}</p> `
            : nothing
        }
      </div>
    `;
  }
}
