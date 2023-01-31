import { navigator, router } from '@addasoft/lit-element-router';
import timeSpan from '@addasoft/timespan';
import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './components/album-art/album-art';
import './components/album/album';
import './components/albums/albums';
import './components/alerts/release-alert';
import './components/app-link/app-link';
import './components/app-main/app-main';
import './components/artist/artist';
import './components/artists/artists';
import './components/header/header';
import './components/home/home';
import './components/last-fm/login';
import './components/letter-nav/letter-nav';
import './components/letter/letter';
import './components/letters/letters';
import './components/loading-indicator/loading-indicator';
import './components/loading-indicator/progress-bar';
import './components/loading-indicator/progress-spinner';
import './components/mp3stream/login';
import musicdb, { refresh, update } from './components/musicdb';
import './components/now-playing/now-paying';
import './components/player/player';
import './components/playlists/playlists';
import './components/search/search';
import './components/settings/settings';
import * as sideNav from './components/side-nav/side-nav';
import './components/years/years';
import routes from './routes';
import litMusicdb from './styles/lit-musicdb';
import scrollbar from './styles/scrollbar';
import { dark, light, system } from './styles/themes';
import { animateCSS, animationCSS } from './utils/animations';
import { getCurrentTheme, updateSunriseData } from './utils/colour';
import { global as EventBus } from './utils/EventBus';
import { getSK, RESET_LASTFM } from './utils/lastfm';
import { launchQueue } from './utils/launch-queue';
import { REFRESH } from './utils/musicdb';
import { DONE_RELOADING, getJwt, RESET_SERVER } from './utils/node-mp3stream';
import { START_CURRENT_PLAYLIST, STOP_PLAYER } from './utils/player';
import { SWITCH_ROUTE } from './utils/router';
import { getSettingByName, TOGGLE_SETTING } from './utils/settings';

@customElement('lit-musicdb')
@router
export class LitMusicdb extends LitElement {
  letters: Array<any>;
  showPlayer: boolean;
  themeSwitchCycle: any;
  loading: boolean;
  hasData: boolean;
  hasSK: boolean;
  hasToken: boolean;

  @state()
  route: string;
  @state()
  params: any;
  @state()
  query: any;

  static get styles() {
    return [animationCSS, litMusicdb, scrollbar];
  }

  static get routes() {
    return routes;
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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener(
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
        this.requestUpdate();
        this._getTheme();
        animateCSS(
          this.shadowRoot?.querySelector('.loading-wrapper'),
          'fadeOut'
        ).then(() => {
          this.loading = false;
          this.requestUpdate();
        });
      })
      .catch((error: any) => {
        console.log(error);
        // TODO: initiate data rescan
        this.hasData = true;
        this.loading = false;
        this.requestUpdate();
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
            this.requestUpdate();
          });
        }
        this.requestUpdate();
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
            this.requestUpdate();
          });
        }
        this.requestUpdate();
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
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(START_CURRENT_PLAYLIST, this._startCurrentPlaylist, this);
    EventBus.on(STOP_PLAYER, this._stopPlayer, this);
    EventBus.on(DONE_RELOADING, this._doRefresh, this);
    EventBus.on(TOGGLE_SETTING, this._doToggleSetting, this);
    EventBus.on(RESET_SERVER, this._resetServer, this);
    EventBus.on(RESET_LASTFM, this._resetLastFM, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(START_CURRENT_PLAYLIST, this._startCurrentPlaylist, this);
    EventBus.off(STOP_PLAYER, this._stopPlayer, this);
    EventBus.off(DONE_RELOADING, this._doRefresh, this);
    EventBus.off(TOGGLE_SETTING, this._doToggleSetting, this);
    EventBus.off(RESET_SERVER, this._resetServer, this);
    EventBus.off(RESET_LASTFM, this._resetLastFM, this);
  }
  updated() {
    EventBus.emit(SWITCH_ROUTE, this, this.route);
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
    this.requestUpdate();
  };
  _stopPlayer() {
    this.showPlayer = false;
    this.requestUpdate();
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
  async router(route: string, params: any, query: unknown) {
    this.route = route;
    this.params = params;
    this.query = query;
    window.scrollTo(0, 0);
    EventBus.emit(sideNav.TOGGLE_MENU, this, 'close');
    EventBus.emit(SWITCH_ROUTE, this, route);
    if (route === 'now-playing') {
      document.querySelector('html')?.classList.add('noscroll');
      return;
    }
    document.querySelector('html')?.classList.remove('noscroll');
    if (this.route !== 'playlist')
      await animateCSS(this.shadowRoot?.querySelector('app-main'), 'slideInUp');
  }
  _resetServer() {
    this.hasToken = false;
    this.requestUpdate();
  }
  _resetLastFM() {
    this.hasSK = false;
    this.requestUpdate();
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
              <app-main
                active-route="${this.route}"
                class="${this.showPlayer ? 'player' : ''}"
              >
                <div route="home">
                  <home-nav></home-nav>
                </div>
                <div route="letters">
                  <letters-nav
                    .hasVisiblePlayer=${this.showPlayer}
                  ></letters-nav>
                </div>
                <div route="letter">
                  <artists-in-letter
                    letter="${this.params?.letter}"
                  ></artists-in-letter>
                </div>
                <div route="artists">
                  <artists-nav
                    .hasVisiblePlayer=${this.showPlayer}
                  ></artists-nav>
                </div>
                <div route="albums">
                  <albums-nav .hasVisiblePlayer=${this.showPlayer}></albums-nav>
                </div>
                <div route="years">
                  <years-nav .hasVisiblePlayer=${this.showPlayer}></years-nav>
                </div>
                <div route="playlists">
                  <playlists-nav></playlists-nav>
                </div>
                <div route="playlist">
                  <playlists-nav
                    playlist-id="${this.params?.playlist}"
                  ></playlists-nav>
                </div>
                <div route="now-playing">
                  <now-playing></now-playing>
                </div>
                <div route="artist">
                  <release-alert
                    artist="${this.params?.artist}"
                  ></release-alert>
                  <albums-in-artist
                    artist="${this.params?.artist}"
                  ></albums-in-artist>
                </div>
                <div route="album">
                  <tracks-in-album
                    artist="${this.params?.artist}"
                    album="${this.params?.album}"
                  ></tracks-in-album>
                </div>
                <div route="settings">
                  <settings-nav></settings-nav>
                </div>
                <div route="search">
                  <search-nav query="${this.query?.q}"></search-nav>
                </div>
              </app-main>
              ${this.showPlayer ? html` <lit-player></lit-player> ` : nothing}
              <side-nav route="${this.route}" ?full=${true}></side-nav>
            `
          : nothing}
        ${!this.hasSK ? html`<lastfm-login></lastfm-login>` : nothing}
        ${!this.hasToken ? html`<mp3stream-login></mp3stream-login>` : nothing}
        ${this.loading
          ? html`<div class="loading-wrapper">
              Loading
              <loading-indicator></loading-indicator>
            </div>`
          : nothing}
      </main>
    `;
  }
}
