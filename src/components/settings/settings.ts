import { LitElement, customElement, html, css } from 'lit-element';
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
} from '../../utils/node-mp3stream';
import headers from '../../styles/headers';
import container from '../../styles/container';
import smallMuted from '../../styles/small-muted';
import responsive from '../../styles/responsive';
import buttons from '../../styles/buttons';
import { nothing } from 'lit-html';
import { updateSunriseData } from '../../utils/colour';

@customElement('settings-nav')
export class LetterNav extends LitElement {
  settings: any;
  stats: any;
  lastFMUsername: any;
  mp3stream: any;
  isReloading: boolean;
  showVersion: boolean;
  static get styles() {
    return [
      buttons,
      container,
      headers,
      smallMuted,
      responsive,
      css`
        .btn-small {
          margin-left: 1rem;
        }
        .container {
          display: block;
        }
        p {
          margin: 0.5rem 1rem 0.7rem;
          display: flex;
          align-items: center;
        }
        .radio-group {
          display: block;
          position: relative;
        }
        .switch {
          position: relative;
          width: 44px;
          min-width: 44px;
          max-width: 44px;
          height: 20px;
          border-radius: 10px;
          padding: 0;
          background-color: transparent;
          border: 2px solid var(--text-color);
          margin-left: 0.5rem;
          transition: color 0.2s ease-in-out;
        }
        .switch:before {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          top: 3px;
          left: 3px;
          border-radius: 5px;
          transition: left 0.1s;
          background-color: var(--text-color);
        }
        .switch.on {
          background-color: var(--primary, #006ecd);
        }
        .switch.on:before {
          left: 27px;
          background-color: white;
        }
        .radio-group label {
          padding-left: 0;
          margin-left: 28px;
          min-height: 0;
          line-height: 20px;
          cursor: pointer;
        }
        .radio {
          width: 20px;
          height: 20px;
          margin-left: -28px;
          margin-top: 0;
          opacity: 0;
        }
        .radio + span:before {
          border-width: 1px;
          border-style: solid;
          box-sizing: border-box;
          content: '';
          height: 20px;
          width: 20px;
          position: absolute;
          margin-top: 4px;
          left: 0;
          cursor: pointer;
          border-radius: 100%;
        }
        .radio.on + span:before {
          content: '•';
          text-indent: 0;
          line-height: 6px;
          padding-top: 2px;
          font-size: 45px;
        }
      `,
    ];
  }
  constructor() {
    super();
    this.settings = {};
    this.stats = {};
    this.lastFMUsername = '';
    this.mp3stream = '';
    this.isReloading = false;
    this.showVersion = true;

    musicdb
      .then((mdb: any) => {
        this.stats.albums = mdb.totals.albums;
        this.stats.artists = mdb.totals.artists;
        this.stats.tracks = mdb.totals.tracks;
        this.stats.time = timeSpan(mdb.totals.playingTime);
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
    this.addEventListener(
      IS_RELOADING,
      () => {
        this.isReloading = true;
        this.requestUpdate();
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      DONE_RELOADING,
      () => {
        this.isReloading = false;
        this.requestUpdate();
      },
      {
        passive: true,
      }
    );
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
    document.querySelector('lit-musicdb')?.dispatchEvent(
      new CustomEvent(TOGGLE_SETTING, {
        detail: {
          setting: prop,
          value,
        },
      })
    );
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
                  Reload now
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
