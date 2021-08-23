import { LitElement, customElement, html } from 'lit-element';
import { nothing } from 'lit-html';
import { router } from '@addasoft/lit-element-router';

import routes from './routes';
import { global as EventBus } from './utils/EventBus';
import { START_CURRENT_PLAYLIST, STOP_PLAYER } from './utils/player';
import { getSettingByName, TOGGLE_SETTING } from './utils/settings';
import musicdb, { refresh, update } from './components/musicdb';

import './components/app-link/app-link';
import './components/app-main/app-main';
import './components/letter-nav/letter-nav';
import './components/side-nav/side-nav';
import './components/header/header';
import './components/home/home';
import './components/letters/letters';
import './components/artists/artists';
import './components/albums/albums';
import './components/years/years';
import './components/letter/letter';
import './components/artist/artist';
import './components/playlists/playlists';
import './components/album/album';
import './components/album-art/album-art';
import './components/settings/settings';
import './components/last-fm/login';
import './components/mp3stream/login';
import './components/player/player';
import './components/now-playing/now-paying';
import './components/search/search';
import './components/loading-indicator/loading-indicator';
import './components/loading-indicator/progress-spinner';

import { light, dark, system } from './styles/themes';
import timeSpan from './utils/timespan';
import { getCurrentTheme, updateSunriseData } from './utils/colour';
import { getSK, RESET_LASTFM } from './utils/lastfm';
import { DONE_RELOADING, getJwt, RESET_SERVER } from './utils/node-mp3stream';
import { animationCSS, animateCSS } from './utils/animations';
import litMusicdb from './styles/lit-musicdb';
import { REFRESH } from './utils/musicdb';
import scrollbar from './styles/scrollbar';

@customElement('lit-musicdb')
@router
export class LitMusicdb extends LitElement {
  route: string;
  params: any;
  query: any;
  letters: Array<any>;
  showPlayer: boolean;
  themeSwitchCycle: any;
  loading: boolean;
  hasData: boolean;
  hasSK: boolean;
  hasToken: boolean;
  static get styles() {
    return [animationCSS, litMusicdb, scrollbar];
  }
  static get properties() {
    return {
      route: { type: String },
      params: { type: Object },
      query: { type: Object },
    };
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

    this._listen();

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
    musicdb
      .then(() => {
        getSettingByName('playliststate').then((start: any) => {
          if (start) {
            this._startCurrentPlaylist();
          }
        });
        this.hasData = true;
        this.requestUpdate();
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
    this._getTheme();
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
  }
  _listen() {
    EventBus.on(START_CURRENT_PLAYLIST, this._startCurrentPlaylist, this);
    EventBus.on(STOP_PLAYER, this._stopPlayer, this);
    EventBus.on(
      DONE_RELOADING,
      () => {
        refresh().then(() => {
          this.requestUpdate();
        });
      },
      this
    );
    EventBus.on(
      TOGGLE_SETTING,
      (target: any, setting: any) => {
        if (target.target !== this) this._toggleSetting(setting);
      },
      this
    );
    EventBus.on(RESET_SERVER, this._resetServer, this);
    EventBus.on(RESET_LASTFM, this._resetLastFM, this);
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
    // @ts-ignore
    document.getElementById('themed')?.innerHTML = css.cssText;
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
    EventBus.emit('toggle-menu', this, 'close');
    if (route === 'now-playing') {
      document.querySelector('html')?.classList.add('noscroll');
      return;
    }
    document.querySelector('html')?.classList.remove('noscroll');
    if (this.route !== 'playlist')
      await animateCSS(this.shadowRoot?.querySelector('app-main'), 'slideInUp');
    // console.log(route, params, query);
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
                    letter="${this.params.letter}"
                  ></artists-in-letter>
                </div>
                <div route="artists">
                  <artists-nav
                    activeroute="${this.route}"
                    .hasVisiblePlayer=${this.showPlayer}
                  ></artists-nav>
                </div>
                <div route="albums">
                  <albums-nav
                    activeroute="${this.route}"
                    .hasVisiblePlayer=${this.showPlayer}
                  ></albums-nav>
                </div>
                <div route="years">
                  <years-nav
                    activeroute="${this.route}"
                    .hasVisiblePlayer=${this.showPlayer}
                  ></years-nav>
                </div>
                <div route="playlists">
                  <playlists-nav activeroute="${this.route}"></playlists-nav>
                </div>
                <div route="playlist">
                  <playlists-nav
                    activeroute="${this.route}"
                    playlist-id="${this.params.playlist}"
                  ></playlists-nav>
                </div>
                <div route="now-playing">
                  <now-playing activeroute="${this.route}"></now-playing>
                </div>
                <div route="artist">
                  <albums-in-artist
                    artist="${this.params.artist}"
                  ></albums-in-artist>
                </div>
                <div route="album">
                  <tracks-in-album
                    artist="${this.params.artist}"
                    album="${this.params.album}"
                  ></tracks-in-album>
                </div>
                <div route="settings">
                  <settings-nav activeroute="${this.route}"></settings-nav>
                </div>
                <div route="search">
                  <search-nav
                    activeroute="${this.route}"
                    query="${this.query?.q}"
                  ></search-nav>
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
