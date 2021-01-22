import { LitElement, customElement, html } from 'lit-element';
import musicdb from '../musicdb';
import timeSpan from '../../utils/timespan';
import {
  getLastParsed,
  setSetting,
  getSettings,
  TOGGLE_SETTING,
} from '../../utils/settings';
import { getLastFMUserName } from '../../utils/lastfm';
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
    e.preventDefault();
    const current = this.settings ? this.settings[prop] : false;
    if (!value) {
      value = !current;
    }
    if (prop === 'gps') {
      await updateSunriseData(value);
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
  async _resetmp3Stream() {
    await resetServer();
    this.mp3stream = null;
    EventBus.emit(RESET_SERVER, this);
    this.requestUpdate();
  }
  render() {
    return html`
      <div class="container">
        <h2 class="header">User information</h2>
        <p>
          Connected to last.fm:
          ${this.lastFMUsername
            ? this.lastFMUsername !== 'mdb-skipped'
              ? this.lastFMUsername
              : 'false'
            : 'false'}
        </p>
        <p>
          Connected to Node-mp3stream:
          ${this.mp3stream ? this.mp3stream : 'false'}
          ${this.mp3stream
            ? html`<button
                class="btn btn-secondary btn-small"
                @click=${this._resetmp3Stream}
              >
                <span class="icon">${trashIcon}</span> disconnect
              </button>`
            : nothing}
        </p>
        ${!this.isReloading
          ? html`
              <p>
                Reload collection:
                <button
                  class="btn btn-primary btn-small"
                  @click=${() => {
                    this._reloadCollection();
                  }}
                >
                  <span class="icon">${syncIcon}</span> Reload now
                </button>
              </p>
            `
          : nothing}
      </div>

      <div class="container">
        <h2 class="header">Player settings</h2>
        <p>
          Save playliststate:
          <button
            @click="${(e: Event) => this._toggle('playliststate', e)}"
            class="switch ${this.settings?.playliststate ? 'on' : 'off'}"
          ></button>
        </p>
        <p>
          Manual scrobbling:
          <button
            @click="${(e: Event) => this._toggle('manualScrobble', e)}"
            class="switch ${this.settings?.manualScrobble ? 'on' : 'off'}"
          ></button>
        </p>
        <p>
          Continues play:
          <button
            @click="${(e: Event) => this._toggle('continues', e)}"
            class="switch ${this.settings?.continues ? 'on' : 'off'}"
          ></button>
        </p>
      </div>

      <div class="container">
        <h2 class="header">Interface settings</h2>
        <p>
          Dynamic accent colour:
          <button
            @click="${(e: Event) => this._toggle('dynamicTheme', e)}"
            class="switch ${this.settings?.dynamicTheme ? 'on' : 'off'}"
          ></button>
        </p>
        <p class="radio-group">
          <label
            ><button
              @click="${(e: Event) => this._toggle('theme', e, 'light')}"
              class="radio ${this.settings?.theme === 'light' ? 'on' : 'off'}"
            ></button>
            <span>Light theme</span>
          </label>
          <br />
          <label
            ><button
              @click="${(e: Event) => this._toggle('theme', e, 'dark')}"
              class="radio ${this.settings?.theme === 'dark' ? 'on' : 'off'}"
            ></button>
            <span>Dark theme</span>
          </label>
          <br />
          <label
            ><button
              @click="${(e: Event) => this._toggle('theme', e, 'auto')}"
              class="radio ${this.settings?.theme === 'auto' ? 'on' : 'off'}"
            ></button>
            <span>Dynamic theme</span>
          </label>
          <span class="small muted"
            >Dark mode between
            ${this._formatDate(this.settings?.start, '21:00:00')} and
            ${this._formatDate(this.settings?.stop, '09:00:00')}</span
          >
        </p>
        ${this.settings?.theme === 'auto'
          ? html`
              <p>
                Track location for more accurate theme switching:
                <button
                  @click="${(e: Event) => this._toggle('gps', e)}"
                  class="switch ${this.settings?.gps ? 'on' : 'off'}"
                ></button>
              </p>
            `
          : nothing}
        <p class="md-up">
          Show visualisation on now-playing screen:
          <button
            @click="${(e: Event) => this._toggle('visual', e)}"
            class="switch ${this.settings?.visual ? 'on' : 'off'}"
          ></button>
        </p>
        ${this.settings?.visual
          ? html`
              <p class="md-up">
                Show smaller album-art on now-playing screen:
                <button
                  @click="${(e: Event) => this._toggle('smallArt', e)}"
                  class="switch ${this.settings?.smallArt ? 'on' : 'off'}"
                ></button>
              </p>
            `
          : nothing}
      </div>

      <div class="container">
        <h2 class="header">Information</h2>
        <p>Artists: ${this.stats?.artists}</p>
        <p>Albums: ${this.stats?.albums}</p>
        <p>Tracks: ${this.stats?.tracks}</p>
        <p>Playing time: ${this.stats?.time}</p>
        <p>Last parsed: ${this.stats?.parsed}</p>
        ${this.showVersion ? html`<p>Build: [VI]{version}[/VI]</p>` : nothing}
        ${this.stats?.mp3stream
          ? html` <p>Node-mp3stream: ${this.stats?.mp3stream}</p> `
          : nothing}
      </div>
    `;
  }
}
