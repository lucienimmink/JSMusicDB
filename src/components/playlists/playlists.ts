import '@lit-labs/virtualizer';
import { LitElement, PropertyValueMap, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import buttons from '../../styles/buttons';
import container from '../../styles/container';
import headers from '../../styles/headers';
import playlists from '../../styles/playlists';
import responsive from '../../styles/responsive';
import smallMuted from '../../styles/small-muted';
import { global as EventBus } from '../../utils/EventBus';
import { getLastFMUserName } from '../../utils/lastfm';
import {
  LOADED_PLAYLIST,
  LOAD_PLAYLIST,
  UPDATE_PLAYER,
  getCurrentPlaylist,
  getNewPlaylistForLovedTracks,
  getNewPlaylistForRadio,
  getNewPlaylistForRadioPref,
  getNewPlaylistForRandom,
  getNewPlaylistForRandomPref,
  getTopTracksForUser,
  setCurrentPlaylist,
  startPlaylist,
} from '../../utils/player';
import { CHANGE_URL } from '../../utils/router';
import { nowPlayingIcon } from '../icons/now-playing';
import { redoIcon } from '../icons/redo';
import musicdb from '../musicdb';
import '../loading-indicator/loading-indicator';
import './../track/track.js';

@customElement('playlists-nav')
export class LetterNav extends LitElement {
  @property()
  activeroute: string;
  max: number;
  @property()
  current: any;
  @property()
  lastFMUserName: string;
  @property()
  playlistId: string;
  showStartArtistSelection: boolean;
  @state()
  playlist: any;
  @state()
  artists: Array<any>;
  @state()
  loading: boolean;
  currentPlaylistId: string;

  static get styles() {
    return [headers, container, smallMuted, responsive, playlists, buttons];
  }
  protected async willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): Promise<void> {
    if (_changedProperties.has('playlistId')) {
      await this._getPlaylists();
      if (this.playlistId === 'radio') {
        this.artists = [];
        this._populateArtists();
      }
      this._doSwitchPlaylist(decodeURIComponent(this.playlistId));
    }
  }
  _getPlaylists = async () => {
    await musicdb;
    const playlist = await getCurrentPlaylist();
    if (playlist) {
      this.current = playlist;
    }
    const username = await getLastFMUserName();
    if (username !== 'mdb-skipped') {
      this.lastFMUserName = username;
    }
  };
  setPlaylist = async (track: any) => {
    let startIndex = 0;
    this.playlist.tracks.map((t: any, index: number) => {
      if (t.id === track.id) {
        startIndex = index;
      }
    });
    this.playlist.index = startIndex;
    await setCurrentPlaylist(this.playlist).then(() => {
      this.current = this.playlist;
    });
    startPlaylist(this);
  };
  _setActivePlaylist = (name = 'current') => {
    this.showStartArtistSelection = false;

    if (name === 'current') {
      this.playlist = this.current;
    }
  };
  _getLovedTracks = () => {
    this.loading = true;
    this.playlist = null;
    this.showStartArtistSelection = false;
    getNewPlaylistForLovedTracks({
      username: this.lastFMUserName,
    })
      .then((playlist: any) => this._updatePlaylist(playlist))
      .catch(() => {
        this.loading = false;
      });
  };
  _generateRandom = () => {
    this.loading = true;
    this.playlist = null;
    this.showStartArtistSelection = false;
    getNewPlaylistForRandom({
      max: this.max,
    })
      .then((playlist: any) => this._updatePlaylist(playlist))
      .catch(() => {
        this.loading = false;
      });
  };
  _generateRandomByPreference = () => {
    this.loading = true;
    this.showStartArtistSelection = false;
    this.playlist = null;
    getNewPlaylistForRandomPref({
      max: this.max,
      username: this.lastFMUserName,
    })
      .then((playlist: any) => this._updatePlaylist(playlist))
      .catch(() => {
        this.loading = false;
      });
  };
  _generateRadioByPreference = () => {
    this.loading = true;
    this.showStartArtistSelection = false;
    this.playlist = null;
    getNewPlaylistForRadioPref({
      max: this.max,
      username: this.lastFMUserName,
    })
      .then((playlist: any) => this._updatePlaylist(playlist))
      .catch(() => {
        this.loading = false;
      });
  };
  _updatePlaylist = (playlist: any) => {
    this.playlist = playlist;
    this.loading = false;
  };
  _getTopTracks = () => {
    this.loading = true;
    this.playlist = null;
    this.showStartArtistSelection = false;
    getTopTracksForUser({
      username: this.lastFMUserName,
      max: this.max,
    })
      .then((playlist: any) => this._updatePlaylist(playlist))
      .catch(() => {
        this.loading = false;
      });
  };
  _startArtistRadio = () => {
    this.showStartArtistSelection = true;
    this.playlist = null;
  };
  _populateArtists = () => {
    musicdb.then((mdb: any) => {
      const letters = mdb.sortedLetters;
      letters.forEach((letter: any) => {
        letter
          .sortAndReturnArtistsBy('sortName', 'asc')
          .forEach((artist: any) => {
            this.artists.push(artist);
          });
      });
      this.requestUpdate();
    });
  };
  _generateArtistRadio = (e: Event) => {
    this.loading = true;
    this.playlist = null;
    // @ts-ignore
    const startArtistID = e.target.value;
    this.showStartArtistSelection = false;
    getNewPlaylistForRadio({
      max: this.max,
      artist: startArtistID,
    })
      .then((playlist: any) => this._updatePlaylist(playlist))
      .catch(() => {
        this.loading = false;
      });
  };
  _update(target: any, current: any) {
    if (this.playlist) {
      const updatedTracks = this.playlist?.tracks.map((track: any) => {
        if (current?.current.id === track.id) {
          return { ...current.current };
        }
        track.isPlaying = false;
        track.isPaused = false;
        return track;
      });
      this.playlist.tracks = updatedTracks;
      this.requestUpdate();
    }
  }
  _switchPlaylist(e: Event) {
    e.preventDefault();
    // @ts-ignore
    const switchTo = e?.target?.value;
    const path = `/playlists/${switchTo}`;
    window.history.pushState({ path }, '', path);
    EventBus.emit(CHANGE_URL, this, path);
  }
  _reloadPlaylist(id: string) {
    this._doSwitchPlaylist(id);
  }
  _doSwitchPlaylist(switchTo: string) {
    this.currentPlaylistId = switchTo;
    this.showStartArtistSelection = false;
    switch (switchTo) {
      case 'current':
        this._setActivePlaylist('current');
        break;
      case 'loved':
        this._getLovedTracks();
        break;
      case 'random':
        this._generateRandom();
        break;
      case 'random-pref':
        this._generateRandomByPreference();
        break;
      case 'pref-radio':
        this._generateRadioByPreference();
        break;
      case 'top':
        this._getTopTracks();
        break;
      case 'radio':
        this.showStartArtistSelection = true;
        this._startArtistRadio();
        break;
      default:
      // this._setActivePlaylist('current');
    }
  }
  _loadPlaylist() {
    this.loading = true;
    this.playlist = null;
  }
  async _loadedPlaylist() {
    this.loading = false;
    const target = this.shadowRoot?.querySelector(
      '#playlist-selector',
    ) as HTMLSelectElement;
    if (target) {
      target.value = 'current';
    }
    this.playlist = await getCurrentPlaylist();
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(UPDATE_PLAYER, this._update, this);
    EventBus.on(LOAD_PLAYLIST, this._loadPlaylist, this);
    EventBus.on(LOADED_PLAYLIST, this._loadedPlaylist, this);
    this._getPlaylists();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(UPDATE_PLAYER, this._update, this);
    EventBus.off(LOAD_PLAYLIST, this._loadPlaylist, this);
    EventBus.off(LOADED_PLAYLIST, this._loadedPlaylist, this);
  }
  constructor() {
    super();
    this.activeroute = '';
    this.current = null;
    this.lastFMUserName = '';
    this.playlist = null;
    this.showStartArtistSelection = false;
    this.artists = [];
    this.loading = false;
    this.max = 100;
    this.playlistId = '';
    this.currentPlaylistId = '';
  }
  private _renderPlaylistSelector() {
    return html`<div class="playlists">
      <ul class="md-up">
        <li class="header">Playlists</li>
        ${this.current?.tracks?.length > 0
          ? html`
              <li class="${this.playlistId === 'current' ? 'active' : ''}">
                <app-link href="/playlists/current" flex
                  >Current playlist
                  <span class="icon-note">${nowPlayingIcon}</span></app-link
                >
              </li>
            `
          : nothing}
        ${this.lastFMUserName
          ? html`
              <li class="${this.playlistId === 'loved' ? 'active' : ''}">
                <app-link href="/playlists/loved" flex
                  >Loved tracks on last.fm<span class="icon-note"
                    >${nowPlayingIcon}</span
                  >
                  ${this.currentPlaylistId === 'loved'
                    ? html`
                        <button
                          class="btn btn-small btn-primary btn-refresh"
                          @click="${() => this._reloadPlaylist('loved')}"
                        >
                          <span class="icon">${redoIcon}</span>
                        </button>
                      `
                    : nothing}</app-link
                >
              </li>
            `
          : nothing}
        ${this.lastFMUserName
          ? html`
              <li class="${this.playlistId === 'top' ? 'active' : ''}">
                <app-link href="/playlists/top" flex
                  >Most played tracks by ${this.lastFMUserName}<span
                    class="icon-note"
                    >${nowPlayingIcon}</span
                  >
                  ${this.currentPlaylistId === 'top'
                    ? html` <button
                        class="btn btn-small btn-primary btn-refresh"
                        @click="${() => this._reloadPlaylist('top')}"
                      >
                        <span class="icon">${redoIcon}</span>
                      </button>`
                    : nothing}
                </app-link>
              </li>
            `
          : nothing}
        <li class="${this.playlistId === 'random' ? 'active' : ''}">
          <app-link href="/playlists/random" flex
            >${this.max} random tracks
            <span class="icon-note">${nowPlayingIcon}</span>
            ${this.currentPlaylistId === 'random'
              ? html` <button
                  class="btn btn-small btn-primary btn-refresh"
                  @click="${() => this._reloadPlaylist('random')}"
                >
                  <span class="icon">${redoIcon}</span>
                </button>`
              : nothing}
          </app-link>
        </li>
        ${this.lastFMUserName
          ? html`
              <li class="${this.playlistId === 'random-pref' ? 'active' : ''}">
                <app-link href="/playlists/random-pref" flex
                  >${this.max} tracks by preference
                  <span class="icon-note">${nowPlayingIcon}</span>
                  ${this.currentPlaylistId === 'random-pref'
                    ? html` <button
                        class="btn btn-small btn-primary btn-refresh"
                        @click="${() => this._reloadPlaylist('random-pref')}"
                      >
                        <span class="icon">${redoIcon}</span>
                      </button>`
                    : nothing}
                </app-link>
              </li>
            `
          : nothing}
        ${this.lastFMUserName
          ? html`
              <li class="${this.playlistId === 'pref-radio' ? 'active' : ''}">
                <app-link href="/playlists/pref-radio" flex
                  >Radio by preference
                  <span class="icon-note">${nowPlayingIcon}</span>
                  ${this.currentPlaylistId === 'pref-radio'
                    ? html` <button
                        class="btn btn-small btn-primary btn-refresh"
                        @click="${() => this._reloadPlaylist('pref-radio')}"
                      >
                        <span class="icon">${redoIcon}</span>
                      </button>`
                    : nothing}
                </app-link>
              </li>
            `
          : nothing}
        <li class="${this.playlistId === 'radio' ? 'active' : ''}">
          <app-link href="/playlists/radio" flex
            >Artist radio<span class="icon-note"
              >${nowPlayingIcon}</span
            ></app-link
          >
        </li>
      </ul>
      <select
        class="sm-only"
        @change=${(e: Event) => this._switchPlaylist(e)}
        id="playlist-selector"
      >
        <option disabled selected>Choose playlist</option>
        ${this.current?.tracks?.length > 0
          ? html` <option value="current">Current playlist</option> `
          : nothing}
        ${this.lastFMUserName
          ? html` <option value="loved">Loved tracks on last.fm</option> `
          : nothing}
        ${this.lastFMUserName
          ? html`
              <option value="top">
                Most played tracks by ${this.lastFMUserName}
              </option>
            `
          : nothing}
        <option value="random">${this.max} random tracks</option>
        ${this.lastFMUserName
          ? html`
              <option value="random-pref">
                ${this.max} tracks by preference
              </option>
            `
          : nothing}
        ${this.lastFMUserName
          ? html` <option value="pref-radio">Radio by preference</option> `
          : nothing}
        <option value="radio">Artist radio</option>
      </select>
    </div>`;
  }
  private _renderTrack(track: any) {
    return html`<track-in-list
      .track=${track}
      type=${this.playlist.type}
      ?showAlbum=${true}
      @click=${() => {
        this.setPlaylist(track);
      }}
    ></track-in-list>`;
  }
  private _renderArtistSelector() {
    return html`
      <div class="playlist">
        <ul>
          <li class="header">Create artist radio</li>
          <li class="no-hover artist-selector">
            <span class="md-up">Start with this artist: </span>
            <select @change="${(e: Event) => this._generateArtistRadio(e)}">
              <option disabled selected>Select an artist from the list</option>
              ${this.artists.map(
                (artist: any) =>
                  html` <option value="${artist.escapedName}">
                    ${artist.name}
                  </option>`,
              )}
            </select>
          </li>
        </ul>
      </div>
    `;
  }
  render() {
    return html` <div class="container">
      ${this._renderPlaylistSelector()}
      ${this.playlist
        ? html`
            <div class="playlist">
              <ul>
                <li class="header">
                  ${this.playlist.name}
                  <span class="small muted"
                    >(${this.playlist.tracks.length})</span
                  >
                </li>
                <lit-virtualizer
                  .scrollTarget=${window}
                  .items=${this.playlist.tracks}
                  .renderItem=${(track: any) => this._renderTrack(track)}
                >
                </lit-virtualizer>
              </ul>
            </div>
          `
        : nothing}
      ${this.showStartArtistSelection ? this._renderArtistSelector() : nothing}
      ${this.loading
        ? html` <loading-indicator>Loading...</loading-indicator> `
        : nothing}
    </div>`;
  }
}
