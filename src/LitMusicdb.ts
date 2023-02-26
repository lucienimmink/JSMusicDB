import timeSpan from '@addasoft/timespan';
import { localized, t } from '@weavedev/lit-i18next';
import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './components/album-art/album-art';
import './components/app-link/app-link';
import './components/app-main/app-main';
import './components/header/header';
import './components/last-fm/login';
import './components/letter-nav/letter-nav';
import './components/loading-indicator/loading-indicator';
import './components/loading-indicator/progress-bar';
import './components/loading-indicator/progress-spinner';
import './components/mp3stream/login';
import musicdb, { refresh, update } from './components/musicdb';
import './components/player/player';
import router from './routes';
import litMusicdb from './styles/lit-musicdb';
import scrollbar from './styles/scrollbar';
import { dark, light, system } from './styles/themes';
import { animateCSS, animationCSS } from './utils/animations';
import { getCurrentTheme, updateSunriseData } from './utils/colour';
import { global as EventBus } from './utils/EventBus';
import { i18nInit } from './utils/i18next';
import { getSK, RESET_LASTFM } from './utils/lastfm';
import { launchQueue } from './utils/launch-queue';
import { REFRESH } from './utils/musicdb';
import { DONE_RELOADING, getJwt, RESET_SERVER } from './utils/node-mp3stream';
import { START_CURRENT_PLAYLIST, STOP_PLAYER } from './utils/player';
import { CHANGE_URL } from './utils/router';
import { getSettingByName, TOGGLE_SETTING } from './utils/settings';

@customElement('lit-musicdb')
@localized()
export class LitMusicdb extends LitElement {
  letters: Array<any>;
  @state()
  showPlayer: boolean;
  themeSwitchCycle: any;
  @state()
  loading: boolean;
  @state()
  hasData: boolean;
  @state()
  hasSK: boolean;
  @state()
  hasToken: boolean;

  @state()
  route: string;
  @state()
  params: any;
  @state()
  query: any;

  appRouter: any;

  static get styles() {
    return [animationCSS, litMusicdb, scrollbar];
  }

  constructor() {
    super();
    this.route = '';
    this.params = {};
    this.query = {};
    this.letters = [];
    this.showPlayer = false;
    this.themeSwitchCycle = null;
    this.loading = true;
    this.hasData = false;
    this.hasSK = true;
    this.hasToken = true;

    this.appRouter = router(this);

    this.addEventListener(
      '_player',
      (e: any) => {
        const nowPlaying = this.shadowRoot?.querySelector('now-playing');
        nowPlaying?.dispatchEvent(
          new CustomEvent('_player', { detail: e.detail })
        );
      },
      {
        passive: true,
      }
    );
    if ('serviceWorker' in window.navigator) {
      window.navigator.serviceWorker.addEventListener(
        'message',
        async (e: MessageEvent) => {
          const { type } = e.data;
          if (type === 'refresh') {
            await update();
            EventBus.emit(REFRESH, this);
          }
        }
      );
    }
    this._getTheme();
    musicdb
      .then(() => {
        getSettingByName('playliststate').then((start: any) => {
          if (start) {
            this._startCurrentPlaylist();
          }
        });
        this.hasData = true;
        this._getTheme();
        animateCSS(
          this.shadowRoot?.querySelector('.loading-wrapper'),
          'fadeOut'
        ).then(() => {
          this.loading = false;
        });
      })
      .catch((error: any) => {
        console.log(error);
        // TODO: initiate data rescan
        this.hasData = true;
        this.loading = false;
      });

    getSK()
      .then((sk: unknown) => {
        this.hasSK = !!sk;
        if (!this.hasSK) {
          animateCSS(
            this.shadowRoot?.querySelector('.loading-wrapper'),
            'fadeOut'
          ).then(() => {
            this.loading = false;
          });
        }
      })
      .catch(() => {
        this.hasSK = false;
      });
    getJwt()
      .then((jwt: any) => {
        this.hasToken = !!jwt;
        if (!this.hasToken) {
          animateCSS(
            this.shadowRoot?.querySelector('.loading-wrapper'),
            'fadeOut'
          ).then(() => {
            this.loading = false;
          });
        }
      })
      .catch(() => {
        this.hasToken = false;
      });
    getSettingByName('gps').then((useGPS: any) => {
      updateSunriseData(useGPS || false).then(() => {
        this._getTheme();
      });
    });
    launchQueue();

    window.onpopstate = (e: any) => {
      this._changeUrl(this, e?.state?.path);
    };
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(START_CURRENT_PLAYLIST, this._startCurrentPlaylist, this);
    EventBus.on(STOP_PLAYER, this._stopPlayer, this);
    EventBus.on(DONE_RELOADING, this._doRefresh, this);
    EventBus.on(TOGGLE_SETTING, this._doToggleSetting, this);
    EventBus.on(RESET_SERVER, this._resetServer, this);
    EventBus.on(RESET_LASTFM, this._resetLastFM, this);
    EventBus.on(CHANGE_URL, this._changeUrl, this);
    i18nInit();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(START_CURRENT_PLAYLIST, this._startCurrentPlaylist, this);
    EventBus.off(STOP_PLAYER, this._stopPlayer, this);
    EventBus.off(DONE_RELOADING, this._doRefresh, this);
    EventBus.off(TOGGLE_SETTING, this._doToggleSetting, this);
    EventBus.off(RESET_SERVER, this._resetServer, this);
    EventBus.off(RESET_LASTFM, this._resetLastFM, this);
    EventBus.off(CHANGE_URL, this._changeUrl, this);
  }
  firstUpdated() {
    this.appRouter.goto(window.location.pathname);
  }
  protected async _changeUrl(target: any, url = '/') {
    this.appRouter.goto(url);
  }
  _doRefresh() {
    refresh().then(() => {
      this.requestUpdate();
    });
  }
  _doToggleSetting(target: any, setting: any) {
    if (target.target !== this) this._toggleSetting(setting);
  }
  _relay = (type: string, method = '') => {
    this.dispatchEvent(new CustomEvent(type, { detail: method }));
  };
  _startCurrentPlaylist = () => {
    this.showPlayer = true;
  };
  _stopPlayer() {
    this.showPlayer = false;
  }
  async _getTheme() {
    const theme = await getSettingByName('theme');
    const cssMap: any = {
      light,
      dark,
      system,
    };
    let css = null;
    switch (theme) {
      case 'dark':
        css = cssMap.dark;
        clearTimeout(this.themeSwitchCycle);
        break;
      case 'system':
        css = cssMap.system;
        clearTimeout(this.themeSwitchCycle);
        break;
      case 'auto': {
        css = cssMap[await this._autoSwitchTheme()];
        break;
      }
      default:
        clearTimeout(this.themeSwitchCycle);
        css = cssMap.light;
    }
    EventBus.emit(TOGGLE_SETTING, this, {
      setting: 'theme',
      value: css,
    });
    const themeElement = document.getElementById('themed');
    if (themeElement) themeElement.innerHTML = css.cssText;
  }
  async _autoSwitchTheme() {
    const { nextCycle, theme }: { nextCycle: number; theme: string } =
      await getCurrentTheme();
    if (nextCycle) {
      console.info(`Switching theme in ${timeSpan(nextCycle)}`);
      clearTimeout(this.themeSwitchCycle);
      this.themeSwitchCycle = setTimeout(() => {
        this._getTheme();
      }, nextCycle);
    }
    return theme;
  }
  _toggleSetting({ setting }: { setting: string }) {
    if (setting === 'theme') {
      this._getTheme();
    }
    if (setting === 'gps') {
      this._getTheme();
    }
  }
  _resetServer() {
    this.hasToken = false;
  }
  _resetLastFM() {
    this.hasSK = false;
  }
  render() {
    return html`
      <main>
        ${this.hasToken && this.hasData
          ? html`
              <main-header
                artist="${this.params.artist}"
                album="${this.params.album}"
              ></main-header>
              <letter-nav route="${this.params.letter}"></letter-nav>
              <side-nav
                route="${this.route}"
                .hasVisiblePlayer=${this.showPlayer}
              ></side-nav>
              <app-main class="${this.showPlayer ? 'player' : ''}">
                ${this.appRouter.outlet()}
              </app-main>
              ${this.showPlayer ? html` <lit-player></lit-player> ` : nothing}
              <side-nav route="${this.route}" ?full=${true}></side-nav>
            `
          : nothing}
        ${!this.hasSK ? html`<lastfm-login></lastfm-login>` : nothing}
        ${!this.hasToken ? html`<mp3stream-login></mp3stream-login>` : nothing}
        ${this.loading
          ? html`<div class="loading-wrapper">
              ${t('labels.loading')}
              <loading-indicator></loading-indicator>
            </div>`
          : nothing}
      </main>
    `;
  }
}
