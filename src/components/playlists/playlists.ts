import timeSpan from '@addasoft/timespan';
import { localized, t } from '@weavedev/lit-i18next';
import { html, LitElement, nothing, PropertyValueMap } from 'lit';
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
  getCurrentPlaylist,
  getNewPlaylistForLovedTracks,
  getNewPlaylistForRadio,
  getNewPlaylistForRadioPref,
  getNewPlaylistForRandom,
  getNewPlaylistForRandomPref,
  getTopTracksForUser,
  LOADED_PLAYLIST,
  LOAD_PLAYLIST,
  setCurrentPlaylist,
  startPlaylist,
  UPDATE_PLAYER,
} from '../../utils/player';
import { CHANGE_URL } from '../../utils/router';
import { pauseIcon } from '../icons/pause';
import { playIcon } from '../icons/play';
import { redoIcon } from '../icons/redo';
import '../loading-indicator/loading-indicator';
import musicdb from '../musicdb';

@customElement('playlists-nav')
@localized()
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
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
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
    switch (switchTo) {
      case 'current':
        this.showStartArtistSelection = false;
        this._setActivePlaylist('current');
        break;
      case 'loved':
        this.showStartArtistSelection = false;
        this._getLovedTracks();
        break;
      case 'random':
        this.showStartArtistSelection = false;
        this._generateRandom();
        break;
      case 'random-pref':
        this.showStartArtistSelection = false;
        this._generateRandomByPreference();
        break;
      case 'pref-radio':
        this.showStartArtistSelection = false;
        this._generateRadioByPreference();
        break;
      case 'top':
        this.showStartArtistSelection = false;
        this._getTopTracks();
        break;
      case 'radio':
        this._startArtistRadio();
        break;
      default:
        this._setActivePlaylist('current');
    }
  }
  _loadPlaylist() {
    this.loading = true;
    this.playlist = null;
  }
  async _loadedPlaylist() {
    this.loading = false;
    const target = this.shadowRoot?.querySelector(
      '#playlist-selector'
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
        <li class="header">${t('headers.playlists')}</li>
        ${this.current?.tracks?.length > 0
          ? html`
              <li>
                <app-link href="/playlists/current" flex
                  >${t('links.current-playlist')}</app-link
                >
              </li>
            `
          : nothing}
        ${this.lastFMUserName
          ? html`
              <li>
                <app-link href="/playlists/loved" flex
                  >${t('links.loved-playlist')}
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
              <li>
                <app-link href="/playlists/top" flex
                  >${t('links.most-played-playlist')} ${this.lastFMUserName}
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
        <li>
          <app-link href="/playlists/random" flex
            >${this.max} ${t('links.random-playlist')}
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
              <li>
                <app-link href="/playlists/random-pref" flex
                  >${this.max} ${t('links.preference-playlist')}
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
              <li>
                <app-link href="/playlists/pref-radio" flex
                  >${t('links.preference-radio')}
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
        <li>
          <app-link href="/playlists/radio" flex
            >${t('links.artist-radio')}</app-link
          >
        </li>
      </ul>
      <select
        class="sm-only"
        @change=${(e: Event) => this._switchPlaylist(e)}
        id="playlist-selector"
      >
        <option disabled selected>${t('links.choose-playlist')}</option>
        ${this.current?.tracks?.length > 0
          ? html`
              <option value="current">${t('links.current-playlist')}</option>
            `
          : nothing}
        ${this.lastFMUserName
          ? html` <option value="loved">${t('links.loved-playlist')}</option> `
          : nothing}
        ${this.lastFMUserName
          ? html`
              <option value="top">
                ${t('links.most-played-playlist')} ${this.lastFMUserName}
              </option>
            `
          : nothing}
        <option value="random">
          ${this.max} ${t('links.random-playlist')}
        </option>
        ${this.lastFMUserName
          ? html`
              <option value="random-pref">
                ${this.max} ${t('links.preference-playlist')}
              </option>
            `
          : nothing}
        ${this.lastFMUserName
          ? html`
              <option value="pref-radio">${t('links.preference-radio')}</option>
            `
          : nothing}
        <option value="radio">${t('links.artist-radio')}</option>
      </select>
    </div>`;
  }
  private _renderTrack(track: any) {
    return html`
      ${track
        ? html`
            <li
              @click="${() => {
                this.setPlaylist(track);
              }}"
              class="${track.isPlaying || track.isPaused ? 'active' : ''}"
            >
              <span class="title">
                ${track.isPlaying || track.isPaused
                  ? html`
                      ${track.isPlaying
                        ? html`${playIcon}`
                        : html`${pauseIcon}`}
                    `
                  : nothing}
                ${track.title} <br /><span class="small muted"
                  >${track.trackArtist} &bull; ${track.album.name}</span
                ></span
              >
              <span class="time"
                >${timeSpan(track.duration)} <br />
                ${track.position > 0 && (track.isPlaying || track.isPaused)
                  ? html`
                      <span class="small muted"
                        >${timeSpan(track.position)}</span
                      >
                    `
                  : html`
                      <span class="small muted">${track.type}</span>
                    `}</span
              >
            </li>
          `
        : nothing}
    `;
  }
  private _renderArtistSelector() {
    return html`
      <div class="playlist">
        <ul>
          <li class="header">${t('headers.create-radio')}</li>
          <li class="no-hover artist-selector">
            <span class="md-up">${t('labels.start-artist')}: </span>
            <select @change="${(e: Event) => this._generateArtistRadio(e)}">
              <option disabled selected>${t('labels.select-artist')}</option>
              ${this.artists.map(
                (artist: any) => html` <option value="${artist.escapedName}">
                  ${artist.name}
                </option>`
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
                  ${this.playlist.i18name
                    ? t(this.playlist.i18name, {
                        username: this.lastFMUserName,
                        count: this.playlist.tracks.length,
                      })
                    : this.playlist.name}
                  <span class="small muted"
                    >(${this.playlist.tracks.length})</span
                  >
                </li>
                ${this.playlist.tracks.map((track: any) =>
                  this._renderTrack(track)
                )}
              </ul>
            </div>
          `
        : nothing}
      ${this.showStartArtistSelection ? this._renderArtistSelector() : nothing}
      ${this.loading
        ? html` <loading-indicator>${t('labels.loading')}</loading-indicator> `
        : nothing}
    </div>`;
  }
}
