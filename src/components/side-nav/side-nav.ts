import { LitElement, customElement, html, css, property } from 'lit-element';
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
    return [
      responsive,
      css`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background-color: var(--progress-background, #f3f4f5);
        }
        ::-webkit-scrollbar-thumb {
          background-color: var(--progress, #006ecd);
        }
        ul {
          list-style: none;
          position: fixed;
          top: 100px;
          left: 0;
          width: 75px;
          color: var(--text-color);
          background: var(--background3, #e9ecef);
          overflow-x: hidden;
          overflow-y: auto;
          margin: 0;
          padding: 0;
          height: calc(100vh - 100px);
        }
        .player ul {
          height: calc(100vh - 100px - 81px);
        }
        app-link {
          display: block;
          color: var(--text-color);
          border-left: 3px solid transparent;
          opacity: 0.5;
        }
        app-link:hover {
          opacity: 1;
        }
        svg {
          width: 20px;
        }
        .active app-link {
          color: black;
          background: rgba(0, 0, 0, 0.03);
          border-left-color: var(--primary);
          transition: border-left-color 0.2s ease-in-out;
          opacity: 1;
        }
        li span {
          display: none;
        }
        .full {
          position: fixed;
          height: 100%;
          z-index: 100;
          width: 100%;
          transform: translateX(-100%);
          transition: transform 0.2s ease-in-out;
          top: 0;
        }
        .full ul {
          top: 0;
          height: 100%;
          width: 90%;
          max-width: 300px;
          background: var(--background3, #e9ecef);
        }
        .full.open {
          transform: translateX(-0);
        }
        .full:before {
          content: '';
          display: block;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          opacity: 0;
          transition: opacity 0.3s cubic-bezier(0, 0, 0.3, 1);
        }
        .full.open:before {
          opacity: 1;
        }
        .full li span {
          display: inline-block;
          margin-left: 10px;
        }
        h1 {
          margin: 0 0 0 10px;
          padding: 0;
          font-weight: lighter;
          height: 50px;
        }
        h1 a {
          text-decoration: none;
          display: inline-block;
          margin-top: 0px;
          vertical-align: sub;
          color: var(--primary);
        }
        h1 svg {
          width: 20px;
        }
        input {
          border: 1px solid var(--primary, #006ecd);
          padding: 8px 10px;
          display: block;
          width: 90%;
          margin: 8px 13px;
        }
        input:focus {
          border-radius: 0;
          border: 1px solid var(--primary, #006ecd);
        }
        @media (min-width: 576px) {
          input {
            width: 88%;
            margin: 8px 25px;
          }
        }
      `,
    ];
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
    const main = document.querySelector('lit-musicdb');
    main?.addEventListener('toggle-menu', this._handleEvent);
  }
  disconnectedCallback() {
    window.removeEventListener('toggle-menu', this._handleEvent);
    super.disconnectedCallback();
  }
  _getScrobbleCache = () => {
    getScrobbleCache().then((cachedTracks: any) => {
      this.hasScrobbleCache = cachedTracks?.length > 0 || false;
      this.requestUpdate();
    });
  };
  _handleEvent = (e: any) => {
    if (this.full) {
      if (e.detail === 'close') {
        this.open = false;
      } else if (e.detail === 'open') {
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
            <app-link href="/" title="Home" menu
              >${homeIcon} <span>Home</span></app-link
            >
          </li>
          ${this.full
            ? html`
                <li class="sm-only ${this.route === 'letters' ? 'active' : ''}">
                  <app-link href="/letters" title="Letters" menu
                    >${lettersIcon} <span>Letters</span></app-link
                  >
                </li>
              `
            : nothing}
          <li class="${this.route === 'artists' ? 'active' : ''}">
            <app-link href="/artists" title="Artists" menu
              >${artistsIcon} <span>Artists</span></app-link
            >
          </li>
          <li class="${this.route === 'albums' ? 'active' : ''}">
            <app-link href="/albums" title="Albums" menu
              >${albumsIcon} <span>Albums</span></app-link
            >
          </li>
          <li class="${this.route === 'years' ? 'active' : ''}">
            <app-link href="/years" title="Years" menu
              >${yearsIcon} <span>Years</span></app-link
            >
          </li>
          <li class="${this.route === 'playlists' ? 'active' : ''}">
            <app-link href="/playlists" title="Playlists" menu
              >${playlistsIcon} <span>Playlists</span></app-link
            >
          </li>
          <li class="${this.route === 'now-playing' ? 'active' : ''}">
            <app-link href="/now-playing" title="Now playing" menu
              >${nowPlayingIcon} <span>Now playing</span></app-link
            >
          </li>
          ${this.hasScrobbleCache
            ? html`
                <li class="${this.route === 'scrobble-cache' ? 'active' : ''}">
                  <app-link href="/scrobble-cache" title="Scrobble cache" menu
                    >${scrobbleCacheIcon} <span>Scrobble cache</span></app-link
                  >
                </li>
              `
            : nothing}
          <li class="${this.route === 'settings' ? 'active' : ''}">
            <app-link href="/settings" title="Settings" menu
              >${settingsIcon} <span>Settings</span></app-link
            >
          </li>
        </ul>
      </div>
    `;
  }
}
