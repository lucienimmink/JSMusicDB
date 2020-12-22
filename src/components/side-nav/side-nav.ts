import { LitElement, customElement, html, property } from 'lit-element';
import { navigator } from 'lit-element-router';
import './../app-link/app-link';

import { homeIcon } from '../icons/home.js';
import { timesIcon } from '../icons/times.js';
import { lettersIcon } from '../icons/letters.js';
import { artistsIcon } from '../icons/artists.js';
import { albumsIcon } from '../icons/albums.js';
import { yearsIcon } from '../icons/years.js';
import { playlistsIcon } from '../icons/playlists.js';
import { nowPlayingIcon } from '../icons/now-playing.js';
import { scrobbleCacheIcon } from '../icons/scrobble-cache.js';
import { settingsIcon } from '../icons/settings.js';
import { getScrobbleCache } from '../../utils/settings';

import responsive from '../../styles/responsive';
import { nothing } from 'lit-html';
import sideNav from '../../styles/side-nav';
import { global as EventBus } from '../../utils/EventBus';

@customElement('side-nav')
@navigator
export class SideNav extends LitElement {
  @property()
  route: string;
  @property({ type: Boolean })
  full: boolean;
  @property({ type: Boolean })
  hasVisiblePlayer: boolean;
  open: boolean;
  hasFocus: boolean;
  hasScrobbleCache: boolean;
  query: string;
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
    this._listen();
  }
  _listen() {
    EventBus.on(
      'toggle-menu',
      (target: any, state: string) => {
        this._handleEvent(state);
      },
      this
    );
  }
  _getScrobbleCache = () => {
    getScrobbleCache().then((cachedTracks: any) => {
      this.hasScrobbleCache = cachedTracks?.length > 0 || false;
      this.requestUpdate();
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
        this.addEventListener('click', this._handleDocumentClick);
      } else {
        this.removeEventListener('click', this._handleDocumentClick);
      }
      this.requestUpdate();
    }
  };
  _handleDocumentClick = (e: any) => {
    const target = e.target as HTMLElement;
    if (target && !this.hasFocus) {
      this.open = false;
      this.requestUpdate();
    }
  };
  _handleClick = (e: any) => {
    e.preventDefault();
    this.open = false;
  };
  _search = (e: any) => {
    e.preventDefault();
    this.query = this.shadowRoot?.querySelector('input')?.value || '';
    this.navigate(`/search?q=${this.query}`);
  };
  navigate(href: any) {
    throw new Error(`Method not implemented. ${href}`);
  }
  render() {
    return html`
      <div
        class="${this.full ? 'full' : ''} ${this.open ? 'open' : ''} ${this
          .hasVisiblePlayer
          ? 'player'
          : ''}"
      >
        <ul>
          ${this.full
            ? html`
                <li>
                  <h1>
                    <a
                      href="#"
                      title="close menu"
                      @click=${(e: Event) => {
                        this._handleClick(e);
                      }}
                      >${timesIcon}</a
                    >
                    JSMusicDB
                  </h1>
                </li>
                <li>
                  <form
                    @submit=${(e: Event) => {
                      this._search(e);
                    }}
                  >
                    <label for="search" class="sr-only">Search for:</label>
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
          <li class="${this.route === 'home' ? 'active' : ''}">
            <app-link href="/" title="Home" menu flex
              >${homeIcon} <span>Home</span></app-link
            >
          </li>
          ${this.full
            ? html`
                <li class="sm-only ${this.route === 'letters' ? 'active' : ''}">
                  <app-link href="/letters" title="Letters" menu flex
                    >${lettersIcon} <span>Letters</span></app-link
                  >
                </li>
              `
            : nothing}
          <li class="${this.route === 'artists' ? 'active' : ''}">
            <app-link href="/artists" title="Artists" menu flex
              >${artistsIcon} <span>Artists</span></app-link
            >
          </li>
          <li class="${this.route === 'albums' ? 'active' : ''}">
            <app-link href="/albums" title="Albums" menu flex
              >${albumsIcon} <span>Albums</span></app-link
            >
          </li>
          <li class="${this.route === 'years' ? 'active' : ''}">
            <app-link href="/years" title="Years" menu flex
              >${yearsIcon} <span>Years</span></app-link
            >
          </li>
          <li class="${this.route === 'playlists' ? 'active' : ''}">
            <app-link href="/playlists" title="Playlists" menu flex
              >${playlistsIcon} <span>Playlists</span></app-link
            >
          </li>
          <li class="${this.route === 'now-playing' ? 'active' : ''}">
            <app-link href="/now-playing" title="Now playing" menu flex
              >${nowPlayingIcon} <span>Now playing</span></app-link
            >
          </li>
          ${this.hasScrobbleCache
            ? html`
                <li class="${this.route === 'scrobble-cache' ? 'active' : ''}">
                  <app-link
                    href="/scrobble-cache"
                    title="Scrobble cache"
                    menu
                    flex
                    >${scrobbleCacheIcon} <span>Scrobble cache</span></app-link
                  >
                </li>
              `
            : nothing}
          <li class="${this.route === 'settings' ? 'active' : ''}">
            <app-link href="/settings" title="Settings" menu flex
              >${settingsIcon} <span>Settings</span></app-link
            >
          </li>
        </ul>
      </div>
    `;
  }
}
