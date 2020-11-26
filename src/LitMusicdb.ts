import { LitElement, customElement, html, css } from 'lit-element';
import { nothing } from 'lit-html';
import { router } from 'lit-element-router';

import routes from './routes';
import {
  START_CURRENT_PLAYLIST,
  STOP_PLAYER,
  PLAY_PLAYER,
  PAUSE_PLAYER,
  UPDATE_PLAYER,
  LOAD_PLAYLIST,
  LOADED_PLAYLIST,
  TOGGLE_PLAY_PAUSE_PLAYER,
  TOGGLE_LOVED,
  TOGGLE_LOVED_UPDATED,
  PREVIOUS_TRACK,
  NEXT_TRACK,
  SET_POSITION,
  TOGGLE_SHUFFLE_UPDATED,
  TOGGLE_SHUFFLE,
  PLAY_PLAYER_START,
} from './utils/player';
import { getSettingByName, TOGGLE_SETTING } from './utils/settings';
import musicdb, { refresh } from './components/musicdb';

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

import { light, dark } from './styles/themes';
import timeSpan from './utils/timespan';
import { ACCENT_COLOR, getCurrentTheme, updateSunriseData } from './utils/colour';
import { getSK } from './utils/lastfm';
import { DONE_RELOADING, getJwt, IS_RELOADING } from './utils/node-mp3stream';
import { animationCSS, animateCSS } from './utils/animations';

@customElement('lit-musicdb')
@router
export class LitMusicdb extends LitElement {
  route: string;
  params: any;
  query: any;
  letters: Array<any>;
  showPlayer: boolean;
  themeSwitchCycle: any;
  loading:boolean;
  hasSK: boolean;
  hasToken: boolean;
  static get styles() {
    return css`
      ${animationCSS}
      main-header {
        height: 50px;
        margin: 0;
        padding: 0;
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        background: var(--background, #f8f9fa);
        z-index: 2;
      }
      letter-nav {
        position: fixed;
        left: 0;
        right: 0;
        top: 50px;
        z-index: 2;
        display: none;
      }
      side-nav {
        display: none;
      }
      side-nav[full] {
        display: block;
      }
      app-main {
        margin-top: 50px;
        display: block;
      }
      app-main.player {
        padding-bottom: 90px;
      }
      lit-player {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 81px;
        box-sizing: border-box;
        z-index: 1;
      }
      .loading-wrapper {
        background: var(--background);
        color: var(--text-color);
        z-index: 101;
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      @media (min-width: 768px) {
        side-nav {
          display: block;
        }
        app-main {
          margin-top: 100px;
          margin-left: 75px;
        }
        letter-nav {
          display: block;
        }
      }
    `;
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
    this.hasSK = true;
    this.hasToken = true;
    this.addEventListener(
      START_CURRENT_PLAYLIST,
      () => {
        this._startCurrentPlaylist();
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      STOP_PLAYER,
      () => {
        this._stopPlayer();
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      PLAY_PLAYER,
      (e: any) => {
        this._update(e.detail);
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      PLAY_PLAYER_START,
      (e: any) => {
        this._update(e.detail, PLAY_PLAYER_START);
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      PAUSE_PLAYER,
      (e: any) => {
        this._update(e.detail, PAUSE_PLAYER);
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      LOAD_PLAYLIST,
      () => {
        this._updatePlaylist(0);
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      LOADED_PLAYLIST,
      () => {
        this._updatePlaylist(1);
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      TOGGLE_PLAY_PAUSE_PLAYER,
      () => {
        this._togglePlayPause();
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      TOGGLE_LOVED,
      () => {
        this._toggleLoved();
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      TOGGLE_LOVED_UPDATED,
      (e: any) => {
        this._toggleLovedUpdated(e.detail);
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      PREVIOUS_TRACK,
      () => {
        this._previousTrack();
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      NEXT_TRACK,
      () => {
        this._nextTrack();
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      SET_POSITION,
      (e: any) => {
        this._setPosition(e.detail);
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      TOGGLE_SHUFFLE,
      () => {
        this._toggleShuffle();
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      TOGGLE_SHUFFLE_UPDATED,
      (e: any) => {
        this._toggleShuffleUpdated(e.detail);
      },
      {
        passive: true,
      }
    );
    this.addEventListener(
      TOGGLE_SETTING,
      (e: any) => {
        this._toggleSetting(e.detail);
      },
      {
        passive: true,
      }
    );
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
    this.addEventListener(
      ACCENT_COLOR,
      (e: any) => {
        const nowPlaying = this.shadowRoot?.querySelector('now-playing');
        nowPlaying?.dispatchEvent(
          new CustomEvent(ACCENT_COLOR, { detail: e.detail })
        );
      },
      {
        passive: true,
      }
    );
    this.addEventListener(IS_RELOADING, () => {
      const settings = this.shadowRoot?.querySelector('settings-nav');
      settings?.dispatchEvent(new CustomEvent(IS_RELOADING));
    }, {
      passive: true
    });
    this.addEventListener(DONE_RELOADING, () => {
      const settings = this.shadowRoot?.querySelector('settings-nav');
      settings?.dispatchEvent(new CustomEvent(DONE_RELOADING));
      refresh().then(() => {
        this.requestUpdate();
      });
    }, {
      passive: true
    });
    musicdb
      .then(() => {
        getSettingByName('playliststate').then((start: any) => {
          if (start) {
            this._startCurrentPlaylist();
          }
        });
        animateCSS(this.shadowRoot?.querySelector('.loading-wrapper'), 'fadeOut').then(() => {
          this.loading = false;
          this.requestUpdate();
        });
      })
      .catch((error: any) => {
        console.log(error);
      });
    this._getTheme();
    getSK().then((sk: unknown) => {
      this.hasSK = !!sk;
      if (!this.hasSK) {
        animateCSS(this.shadowRoot?.querySelector('.loading-wrapper'), 'fadeOut').then(() => {
          this.loading = false;
          this.requestUpdate();
        });
      }
      this.requestUpdate();
    }).catch(() => {
      this.hasSK = false;
    })
    getJwt().then((jwt: any) => {
      this.hasToken = !!jwt;
      if (!this.hasToken) {
        animateCSS(this.shadowRoot?.querySelector('.loading-wrapper'), 'fadeOut').then(() => {
          this.loading = false;
          this.requestUpdate();
        });
      }
      this.requestUpdate();
    }).catch(() => {
      this.hasToken = false;
    })
    getSettingByName('gps').then((useGPS: any) => {
      updateSunriseData(useGPS || false).then(() => {
        this._getTheme();
      });
    });
    /*
    navigator.serviceWorker.addEventListener('message', event => {
      const type = event?.data?.type;
      const data = event?.data?.data;
      if (type === 'refresh') {
        console.log('collection refreshed as notified by SW')
        refresh(data).then(() => {
          this.requestUpdate();
        });
      }
    });
    */
  }
  _relay = (type: string, method = '') => {
    this.dispatchEvent(new CustomEvent(type, { detail: method }));
  };
  _startCurrentPlaylist = () => {
    this.showPlayer = true;
    this.requestUpdate();
    const player = this.shadowRoot?.querySelector('lit-player');
    player?.dispatchEvent(new CustomEvent(START_CURRENT_PLAYLIST));
  };
  _stopPlayer() {
    this.showPlayer = false;
    this.requestUpdate();
  }
  _update(track: any, type = '') {
    const album = this.shadowRoot?.querySelector('tracks-in-album');
    album?.dispatchEvent(new CustomEvent(UPDATE_PLAYER, { detail: track }));
    const playlists = this.shadowRoot?.querySelector('playlists-nav');
    playlists?.dispatchEvent(new CustomEvent(UPDATE_PLAYER, { detail: track }));
    const nowPlaying = this.shadowRoot?.querySelector('now-playing');
    nowPlaying?.dispatchEvent(
      new CustomEvent(UPDATE_PLAYER, { detail: { track, type }})
    );
  }
  _updatePlaylist(state: number) {
    const playlists = this.shadowRoot?.querySelector('playlists-nav');
    playlists?.dispatchEvent(
      new CustomEvent(state === 0 ? LOAD_PLAYLIST : LOADED_PLAYLIST)
    );
    const nowPlaying = this.shadowRoot?.querySelector('now-playing');
    nowPlaying?.dispatchEvent(
      new CustomEvent(LOADED_PLAYLIST)
    );
  }
  _togglePlayPause() {
    const player = this.shadowRoot?.querySelector('lit-player');
    player?.dispatchEvent(new CustomEvent(TOGGLE_PLAY_PAUSE_PLAYER));
  }
  _toggleLoved() {
    const player = this.shadowRoot?.querySelector('lit-player');
    player?.dispatchEvent(new CustomEvent(TOGGLE_LOVED));
  }
  _toggleLovedUpdated(newValue: any) {
    const nowPlaying = this.shadowRoot?.querySelector('now-playing');
    nowPlaying?.dispatchEvent(
      new CustomEvent(TOGGLE_LOVED_UPDATED, { detail: newValue })
    );
  }
  _previousTrack() {
    const player = this.shadowRoot?.querySelector('lit-player');
    player?.dispatchEvent(new CustomEvent(PREVIOUS_TRACK));
  }
  _nextTrack() {
    const player = this.shadowRoot?.querySelector('lit-player');
    player?.dispatchEvent(new CustomEvent(NEXT_TRACK));
  }
  _setPosition(pos: any) {
    const player = this.shadowRoot?.querySelector('lit-player');
    player?.dispatchEvent(new CustomEvent(SET_POSITION, { detail: pos }));
  }
  _toggleShuffle() {
    const player = this.shadowRoot?.querySelector('lit-player');
    player?.dispatchEvent(new CustomEvent(TOGGLE_SHUFFLE));
  }
  _toggleShuffleUpdated(newValue: any) {
    const nowPlaying = this.shadowRoot?.querySelector('now-playing');
    nowPlaying?.dispatchEvent(
      new CustomEvent(TOGGLE_SHUFFLE_UPDATED, { detail: newValue })
    );
  }
  async _getTheme() {
    const theme = await getSettingByName('theme');
    const cssMap:any = {
      light,
      dark
    }
    let css = null;
    switch (theme) {
      case 'dark':
        css = cssMap.dark;
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
    const player = this.shadowRoot?.querySelector('lit-player');
    player?.dispatchEvent(
      new CustomEvent(TOGGLE_SETTING, {
        detail: {
          setting: 'theme',
          value: css,
        },
      })
    );
    // @ts-ignore
    document.getElementById('themed')?.innerHTML = css.cssText;
  }
  async _autoSwitchTheme() {
    const { nextCycle, theme }: { nextCycle:number, theme:string} = await getCurrentTheme();
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
    this._relay('toggle-menu', 'close');
    if (route === 'now-playing') {
      document.querySelector('html')?.classList.add('noscroll');
      return;
    }
    document.querySelector('html')?.classList.remove('noscroll');
    await animateCSS(this.shadowRoot?.querySelector('app-main'), 'slideInUp')
    // console.log(route, params, query);
  }
  render() {
    return html`
      <main>
        ${this.hasToken ? html`
          <main-header
            artist="${this.params.artist}"
            album="${this.params.album}"
            @toggle-menu="${() => {
              this._relay('toggle-menu');
            }}"
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
              <letters-nav></letters-nav>
            </div>
            <div route="letter">
              <artists-in-letter
                letter="${this.params.letter}"
              ></artists-in-letter>
            </div>
            <div route="artists">
              <artists-nav activeroute="${this.route}"></artists-nav>
            </div>
            <div route="albums">
              <albums-nav activeroute="${this.route}"></albums-nav>
            </div>
            <div route="years">
              <years-nav activeroute="${this.route}"></years-nav>
            </div>
            <div route="playlists">
              <playlists-nav activeroute="${this.route}"></playlists-nav>
            </div>
            <div route="now-playing">
              <now-playing activeroute="${this.route}"></now-playing>
            </div>
            <div route="artist">
              <albums-in-artist artist="${this.params.artist}"></albums-in-artist>
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
              <search-nav activeroute="${this.route}" query="${this.query?.q}"></search-nav>
            </div>
          </app-main>
          ${this.showPlayer ? html` <lit-player></lit-player> ` : nothing}
          <side-nav route="${this.route}" ?full=${true}></side-nav>
        ` : nothing}
        ${!this.hasSK ? html`<lastfm-login ></lastfm-login>` : nothing}
        ${!this.hasToken ? html`<mp3stream-login></mp3stream-login>` : nothing}
        ${this.loading
          ? html`<div class="loading-wrapper">
              Loading ... <br />
              <loading-indicator>loading ...</loading-indicator>
            </div>`
          : nothing}
      </main>
    `;
  }
}
