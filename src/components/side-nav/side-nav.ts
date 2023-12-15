import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import responsive from '../../styles/responsive';
import sideNav from '../../styles/side-nav';
import { global as EventBus } from '../../utils/EventBus';
import { CHANGE_URL } from '../../utils/router';
import { getScrobbleCache } from '../../utils/settings';
import { albumsIcon } from '../icons/albums.js';
import { artistsIcon } from '../icons/artists.js';
import { homeIcon } from '../icons/home.js';
import { lettersIcon } from '../icons/letters.js';
import { nowPlayingIcon } from '../icons/now-playing.js';
import { playlistsIcon } from '../icons/playlists.js';
import { scrobbleCacheIcon } from '../icons/scrobble-cache.js';
import { settingsIcon } from '../icons/settings.js';
import { timesIcon } from '../icons/times.js';
import { yearsIcon } from '../icons/years.js';
import './../app-link/app-link';

export const TOGGLE_MENU = 'toggle-menu';
export const TOGGLE_OVERFLOW_HIDDEN = 'toggle-overflow-hidden';

@customElement('side-nav')
export class SideNav extends LitElement {
  @property()
  route: string;
  @property({ type: Boolean })
  full: boolean;
  @property({ type: Boolean })
  hasVisiblePlayer: boolean;
  @state()
  open: boolean;
  hasFocus: boolean;
  @state()
  hasScrobbleCache: boolean;
  query: string;
  touchstartX: number = 0;

  static get styles() {
    return [responsive, sideNav];
  }
  constructor() {
    super();
    this.route = '';
    this.full = false;
    this.open = false;
    this.hasFocus = false;
    this.hasScrobbleCache = false;
    this.hasVisiblePlayer = false;
    this.query = '';
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(TOGGLE_MENU, this._doToggleMenu, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(TOGGLE_MENU, this._doToggleMenu, this);
  }
  _doToggleMenu(target: any, state: string) {
    this._handleEvent(state);
  }
  _getScrobbleCache = () => {
    getScrobbleCache().then((cachedTracks: any) => {
      this.hasScrobbleCache = cachedTracks?.length > 0 || false;
    });
  };
  _handleEvent = (state: string) => {
    if (this.full) {
      if (state === 'close') {
        this.open = false;
      } else if (state === 'open') {
        this.open = true;
      } else {
        this.open = !this.open;
      }
      if (this.open) {
        EventBus.emit(TOGGLE_OVERFLOW_HIDDEN, this, true);
        this.addEventListener('click', this._handleDocumentClick);
      } else {
        this.removeEventListener('click', this._handleDocumentClick);
      }
    }
  };
  _handleDocumentClick = (e: any) => {
    const target = e.target as HTMLElement;
    if (target && !this.hasFocus) {
      EventBus.emit(TOGGLE_OVERFLOW_HIDDEN, this, false);
      this.open = false;
    }
  };
  _handleClick = (e: any) => {
    e.preventDefault();
    EventBus.emit(TOGGLE_OVERFLOW_HIDDEN, this, false);
    this.open = false;
  };
  _search = (e: any) => {
    e.preventDefault();
    this.query = this.shadowRoot?.querySelector('input')?.value || '';
    const path = `/search/${this.query}`;
    // should use router here
    window.history.pushState({ path }, '', path);
    EventBus.emit(TOGGLE_OVERFLOW_HIDDEN, this, false);
    EventBus.emit(CHANGE_URL, this, path);
  };
  _handleTouchStart = (e: any) => {
    this.touchstartX = e.changedTouches[0].screenX;
  };
  _handleTouchEnd = (e: any) => {
    const x = e.changedTouches[0].screenX;

    if (x < this.touchstartX) {
      EventBus.emit(TOGGLE_OVERFLOW_HIDDEN, this, false);
      this.open = false;
    }
  };
  render() {
    return html`
      <div class="${this.full ? 'full' : ''} ${this.open ? 'open' : ''}"></div>
      <div
        class="${this.full ? 'slide-menu' : ''} ${this.open
          ? 'open'
          : ''} ${this.hasVisiblePlayer ? 'player' : ''}"
        @touchstart=${this._handleTouchStart}
        @touchend=${this._handleTouchEnd}
      >
        <ul>
          ${this.full
            ? html`
                <li class="title">
                  <h1>
                    <button
                      title="Close menu"
                      @click=${(e: Event) => {
                        this._handleClick(e);
                      }}
                    >
                      ${timesIcon}
                    </button>
                    <div>JSMusicDB</div>
                  </h1>
                </li>
                <li>
                  <form
                    @submit=${(e: Event) => {
                      this._search(e);
                    }}
                  >
                    <label for="search" class="sr-only">Search:</label>
                    <input
                      type="search"
                      placeholder="Search for"
                      id="search"
                      @focus="${() => {
                        this.hasFocus = true;
                      }}"
                      @blur="${() => {
                        this.hasFocus = false;
                      }}"
                      .value=${this.query}
                    />
                  </form>
                </li>
              `
            : nothing}
          <li class="${this.route === '/' ? 'active' : ''}">
            <app-link href="/" title="Home" menu flex
              >${homeIcon} <span>Home</span></app-link
            >
          </li>
          ${this.full
            ? html`
                <li
                  class="md-down ${this.route === '/letters' ? 'active' : ''}"
                >
                  <app-link href="/letters" title="Letters" menu flex
                    >${lettersIcon} <span>Letters</span></app-link
                  >
                </li>
              `
            : nothing}
          <li class="${this.route === '/artists' ? 'active' : ''}">
            <app-link href="/artists" title="Artists" menu flex
              >${artistsIcon} <span>Artists</span></app-link
            >
          </li>
          <li class="${this.route === '/albums' ? 'active' : ''}">
            <app-link href="/albums" title="Albums" menu flex
              >${albumsIcon} <span>Albums</span></app-link
            >
          </li>
          <li class="${this.route === '/years' ? 'active' : ''}">
            <app-link href="/years" title="Years" menu flex
              >${yearsIcon} <span>Years</span></app-link
            >
          </li>
          <li class="${this.route.includes('/playlists') ? 'active' : ''}">
            <app-link href="/playlists/current" title="Playlists" menu flex
              >${playlistsIcon} <span>Playlists</span></app-link
            >
          </li>
          <li class="${this.route === '/playing' ? 'active' : ''}">
            <app-link href="/playing" title="Now playing" menu flex
              >${nowPlayingIcon} <span>Now playing</span></app-link
            >
          </li>
          ${this.hasScrobbleCache
            ? html`
                <li class="${this.route === '/scrobble-cache' ? 'active' : ''}">
                  <app-link
                    href="/scrobble-cache"
                    title="Local scrobble cache"
                    menu
                    flex
                    >${scrobbleCacheIcon}
                    <span>Local scrobble cache</span></app-link
                  >
                </li>
              `
            : nothing}
          <li class="${this.route === '/settings' ? 'active' : ''}">
            <app-link href="/settings" title="Settings" menu flex
              >${settingsIcon} <span>Settings</span></app-link
            >
          </li>
        </ul>
      </div>
    `;
  }
}
