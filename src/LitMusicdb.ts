import timeSpan from '@addasoft/timespan';
import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './components/album-art/album-art';
import './components/app-link/app-link';
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
import { global as EventBus } from './utils/EventBus';
import { animateCSS, animationCSS } from './utils/animations';
import { getCurrentTheme, updateSunriseData } from './utils/colour';
import { RESET_LASTFM, getSK } from './utils/lastfm';
import { launchQueue } from './utils/launch-queue';
import { REFRESH } from './utils/musicdb';
import { DONE_RELOADING, RESET_SERVER, getJwt } from './utils/node-mp3stream';
import {
  NAVIGATE_TO_ALBUM,
  START_CURRENT_PLAYLIST,
  STOP_PLAYER,
} from './utils/player';
import { CHANGE_URL } from './utils/router';
import { TOGGLE_SETTING, getSettingByName } from './utils/settings';
import Track from '@addasoft/musicdbcore/dist/models/Track';
import { TOGGLE_OVERFLOW_HIDDEN } from './components/side-nav/side-nav';

@customElement('lit-musicdb')
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

  @state()
  letter: any;
  @state()
  artist: any;
  @state()
  album: any;

  appRouter: any;
  _player: any;

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

    this.letter = '';
    this.artist = '';
    this.album = '';

    this._player = null;

    this.appRouter = router(this);

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
    EventBus.on(NAVIGATE_TO_ALBUM, this._navigateToAlbum, this);
    EventBus.on(TOGGLE_OVERFLOW_HIDDEN, this._toggleOverflowHidden, this);
    this._init();
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
    EventBus.off(NAVIGATE_TO_ALBUM, this._navigateToAlbum, this);
    EventBus.off(TOGGLE_OVERFLOW_HIDDEN, this._toggleOverflowHidden, this);
  }
  private _initServiceWorkerRefresh() {
    if ('serviceWorker' in window.navigator) {
      window.navigator.serviceWorker.addEventListener(
        'message',
        async (e: MessageEvent) => {
          const { type, request } = e.data;
          if (type === 'refresh' && request?.includes('node-music.json')) {
            await update();
            EventBus.emit(REFRESH, this);
          }
        },
      );
    }
  }
  private async initMusicDB() {
    try {
      await musicdb;
      this.hasData = true;
    } catch (error) {
      this.hasData = true;
      this.loading = false;
    }
  }
  private async _initSettingsAndThemes() {
    const start = await getSettingByName('playliststate');
    if (start) {
      this._startCurrentPlaylist();
      await this._getTheme();
    }
    const useGPS = await getSettingByName('gps');
    await updateSunriseData(useGPS || false);
    await this._getTheme();
  }
  private async _initLastFM() {
    const sk = await getSK();
    this.hasSK = !!sk;
    if (!this.hasSK) {
      animateCSS(
        this.shadowRoot?.querySelector('.loading-wrapper'),
        'fadeOut',
      ).then(() => {
        this.loading = false;
      });
    }
  }
  private async _initToken() {
    const jwt = await getJwt();
    this.hasToken = !!jwt;
    if (!this.hasToken) {
      animateCSS(
        this.shadowRoot?.querySelector('.loading-wrapper'),
        'fadeOut',
      ).then(() => {
        this.loading = false;
      });
    }
  }
  private async _init() {
    this._initServiceWorkerRefresh();
    await this._initLastFM();
    await this._initToken();
    await this.initMusicDB();
    await this._initSettingsAndThemes();
    launchQueue();
    this._changeUrl(this, window.location.pathname);
    this.loading = false;
    await animateCSS(
      this.shadowRoot?.querySelector('.loading-wrapper'),
      'fadeOut',
    );
  }
  protected _changeUrl(target: any, url = '/') {
    if (this.route === url) return;
    this.route = url;
    this.letter = url.split('/letter/')?.[1]?.split('/')[0];
    this.artist = url.split('/artist/')?.[1]?.split('/')[0];
    this.album = url.split('/album/')?.[1]?.split('/')[0];
    window.scrollTo(0, 0);
    // @ts-ignore
    if (this.shadowRoot.querySelector('#outlet')) {
      // @ts-ignore
      this.shadowRoot.querySelector('#outlet').style.viewTransitionName =
        'outlet';
    }
    this.appRouter.goto(url);
  }
  private _navigateToAlbum(target: any, current: any) {
    const track = current.current as Track;
    const { artist, album } = track;
    history.replaceState(
      {},
      '',
      `/letter/${artist?.letter?.escapedLetter}/artist/${artist?.escapedName}/album/${album?.escapedName}`,
    );
    this._changeUrl(
      this,
      `/letter/${artist?.letter?.escapedLetter}/artist/${artist?.escapedName}/album/${album?.escapedName}`,
    );
  }
  async _doRefresh() {
    await refresh();
    this.requestUpdate();
  }
  _doToggleSetting(target: any, setting: any) {
    if (target.target !== this) this._toggleSetting(setting);
  }
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
  _toggleOverflowHidden(target: any, state = false) {
    if (document.querySelector('html')?.classList.contains('np')) {
      return;
    }
    if (state) {
      document.querySelector('html')?.classList.add('noscroll');
    } else {
      document.querySelector('html')?.classList.remove('noscroll');
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
                artist="${this.artist}"
                album="${this.album}"
                route="${this.route}"
              ></main-header>
              <letter-nav letter="${this.letter}"></letter-nav>
              <side-nav
                route="${this.route}"
                .hasVisiblePlayer=${this.showPlayer}
              ></side-nav>
              <div id="outlet" class="${this.showPlayer ? 'player' : ''}">
                ${this.appRouter.outlet()}
              </div>
              ${this.showPlayer
                ? html` <lit-player route="${this.route}"></lit-player> `
                : nothing}
              <side-nav route="${this.route}" ?full=${true}></side-nav>
            `
          : nothing}
        ${!this.hasSK ? html`<lastfm-login></lastfm-login>` : nothing}
        ${!this.hasToken ? html`<mp3stream-login></mp3stream-login>` : nothing}
        ${this.loading
          ? html`<div class="loading-wrapper">
              Loading...
              <loading-indicator></loading-indicator>
            </div>`
          : nothing}
      </main>
    `;
  }
}
