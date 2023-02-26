import { localized, t } from '@weavedev/lit-i18next';
import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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
@customElement('side-nav')
@localized()
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
        this.addEventListener('click', this._handleDocumentClick);
      } else {
        this.removeEventListener('click', this._handleDocumentClick);
      }
    }
  };
  _handleDocumentClick = (e: any) => {
    const target = e.target as HTMLElement;
    if (target && !this.hasFocus) {
      this.open = false;
    }
  };
  _handleClick = (e: any) => {
    e.preventDefault();
    this.open = false;
  };
  _search = (e: any) => {
    e.preventDefault();
    this.query = this.shadowRoot?.querySelector('input')?.value || '';
    const path = `/search/${this.query}`;
    window.history.pushState({ path }, '', path);
    EventBus.emit(CHANGE_URL, this, path);
  };
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
                      title="${ifDefined(
                        t('labels.close-menu') === null
                          ? undefined
                          : t('labels.close-menu')
                      )}"
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
                    <label for="search" class="sr-only"
                      >${t('labels.search')}:</label
                    >
                    <input
                      type="search"
                      placeholder="${ifDefined(
                        t('labels.search') === null
                          ? undefined
                          : t('labels.search')
                      )}"
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
            <app-link
              href="/"
              title="${ifDefined(
                t('labels.home') === null ? undefined : t('labels.home')
              )}"
              menu
              flex
              >${homeIcon} <span>${t('labels.home')}</span></app-link
            >
          </li>
          ${this.full
            ? html`
                <li
                  class="md-down ${this.route === '/letters' ? 'active' : ''}"
                >
                  <app-link
                    href="/letters"
                    title="${ifDefined(
                      t('labels.letters') === null
                        ? undefined
                        : t('labels.letters')
                    )}"
                    menu
                    flex
                    >${lettersIcon}
                    <span>${t('labels.letters')}</span></app-link
                  >
                </li>
              `
            : nothing}
          <li class="${this.route === '/artists' ? 'active' : ''}">
            <app-link
              href="/artists"
              title="${ifDefined(
                t('labels.artists') === null ? undefined : t('labels.artists')
              )}"
              menu
              flex
              >${artistsIcon} <span>${t('labels.artists')}</span></app-link
            >
          </li>
          <li class="${this.route === '/albums' ? 'active' : ''}">
            <app-link
              href="/albums"
              title="${ifDefined(
                t('labels.albums') === null ? undefined : t('labels.albums')
              )}"
              menu
              flex
              >${albumsIcon} <span>${t('labels.albums')}</span></app-link
            >
          </li>
          <li class="${this.route === '/years' ? 'active' : ''}">
            <app-link
              href="/years"
              title="${ifDefined(
                t('labels.years') === null ? undefined : t('labels.years')
              )}"
              menu
              flex
              >${yearsIcon} <span>${t('labels.years')}</span></app-link
            >
          </li>
          <li class="${this.route.includes('/playlists') ? 'active' : ''}">
            <app-link
              href="/playlists"
              title="${ifDefined(
                t('labels.playlists') === null
                  ? undefined
                  : t('labels.playlists')
              )}"
              menu
              flex
              >${playlistsIcon} <span>${t('labels.playlists')}</span></app-link
            >
          </li>
          <li class="${this.route === '/now-playing' ? 'active' : ''}">
            <app-link
              href="/now-playing"
              title="${ifDefined(
                t('labels.now-playing') === null
                  ? undefined
                  : t('labels.now-playing')
              )}"
              menu
              flex
              >${nowPlayingIcon}
              <span>${t('labels.now-playing')}</span></app-link
            >
          </li>
          ${this.hasScrobbleCache
            ? html`
                <li class="${this.route === '/scrobble-cache' ? 'active' : ''}">
                  <app-link
                    href="/scrobble-cache"
                    title="${ifDefined(
                      t('labels.scrobble-cache') === null
                        ? undefined
                        : t('labels.scrobble-cache')
                    )}"
                    menu
                    flex
                    >${scrobbleCacheIcon}
                    <span>${t('labels.scrobble-cache')}</span></app-link
                  >
                </li>
              `
            : nothing}
          <li class="${this.route === '/settings' ? 'active' : ''}">
            <app-link
              href="/settings"
              title="${ifDefined(
                t('labels.settings') === null ? undefined : t('labels.settings')
              )}"
              menu
              flex
              >${settingsIcon} <span>${t('labels.settings')}</span></app-link
            >
          </li>
        </ul>
      </div>
    `;
  }
}
