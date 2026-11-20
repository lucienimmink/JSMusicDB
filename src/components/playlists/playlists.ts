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
  NEW_PLAYLIST_LENGTH,
  UPDATE_PLAYER,
  getCurrentPlaylist,
  getNewPlaylistForLovedTracks,
  getNewPlaylistForRadio,
  getNewPlaylistForRadioPref,
  getNewPlaylistForRandom,
  getNewPlaylistForRandomPref,
  getTopTracksForUser,
  getTrackById,
  setCurrentPlaylist,
  startPlaylist,
} from '../../utils/player';
import { CHANGE_URL } from '../../utils/router';
import { nowPlayingIcon } from '../icons/now-playing';
import { redoIcon } from '../icons/redo';
import musicdb from '../musicdb';
import '../loading-indicator/loading-indicator';
import './../track/track.js';
import forms from '../../styles/forms';

type PlaylistOption = {
  id: string;
  label: string;
  refreshable?: boolean;
};

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
  @state()
  showStartArtistSelection: boolean;
  @state()
  showPastePlaylistSelection: boolean;
  @state()
  pasteError: boolean;
  @state()
  playlist: any;
  @state()
  artists: Array<any>;
  @state()
  loading: boolean;
  @state()
  newPlaylistLength: number;
  currentPlaylistId: string;

  static get styles() {
    return [
      headers,
      container,
      smallMuted,
      responsive,
      playlists,
      buttons,
      forms,
    ];
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
    const trackIndex = this.playlist.tracks.findIndex(
      (playlistTrack: any) => playlistTrack.id === track.id,
    );
    this.playlist.index = trackIndex === -1 ? 0 : trackIndex;
    await setCurrentPlaylist(this.playlist).then(() => {
      this.current = this.playlist;
    });
    startPlaylist(this);
  };
  _setActivePlaylist = (name = 'current') => {
    this.showStartArtistSelection = false;
    this.showPastePlaylistSelection = false;

    if (name === 'current') {
      this.playlist = this.current;
    }
  };
  private async _generatePlaylist(createPlaylist: () => Promise<any>) {
    this.loading = true;
    this.playlist = null;
    this.showStartArtistSelection = false;
    this.showPastePlaylistSelection = false;
    try {
      this._updatePlaylist(await createPlaylist());
    } catch (error) {
      console.error('Unable to generate playlist:', error);
      this.loading = false;
    }
  }
  _getLovedTracks = () =>
    this._generatePlaylist(() =>
      getNewPlaylistForLovedTracks({ username: this.lastFMUserName }),
    );
  _generateRandom = () =>
    this._generatePlaylist(() => getNewPlaylistForRandom({ max: this.max }));
  _generateRandomByPreference = () =>
    this._generatePlaylist(() =>
      getNewPlaylistForRandomPref({
        max: this.max,
        username: this.lastFMUserName,
      }),
    );
  _generateRadioByPreference = () =>
    this._generatePlaylist(() =>
      getNewPlaylistForRadioPref({
        max: this.max,
        username: this.lastFMUserName,
      }),
    );
  _getTopTracks = () =>
    this._generatePlaylist(() =>
      getTopTracksForUser({
        username: this.lastFMUserName,
        max: this.max,
      }),
    );
  _updatePlaylist = (playlist: any) => {
    this.playlist = playlist;
    this.loading = false;
  };

  _startArtistRadio = () => {
    this.showStartArtistSelection = true;
    this.showPastePlaylistSelection = false;
    this.playlist = null;
  };

  _startPastePlaylist = () => {
    this.showStartArtistSelection = false;
    this.showPastePlaylistSelection = true;
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
    const artist = (e.currentTarget as HTMLSelectElement).value;
    return this._generatePlaylist(() =>
      getNewPlaylistForRadio({ max: this.max, artist }),
    );
  };
  private async _resolvePastedTracks(pasteString: string) {
    const pastedTracks = JSON.parse(pasteString);
    if (!Array.isArray(pastedTracks) || pastedTracks.length === 0) {
      throw new Error('Expected a non-empty array of tracks.');
    }

    return Promise.all(
      pastedTracks.map(async (track: any) => {
        if (!track?.id) {
          throw new Error('Track ID is missing from pasted playlist.');
        }
        return {
          id: track.id,
          track: await getTrackById(track.id),
        };
      }),
    );
  }
  private _createPastedPlaylist(
    name: string,
    resolvedTracks: { id: string; track: any }[],
    max: number,
  ) {
    const tracks = [];
    for (const result of resolvedTracks) {
      if (!result.track) {
        console.warn('Track not found in database:', result.id);
        continue;
      }
      tracks.push(result.track);
      EventBus.emit(NEW_PLAYLIST_LENGTH, {}, tracks.length);
    }
    return { name, tracks, type: 'pasted', max };
  }
  private _showPastePlaylistError(error: unknown) {
    console.error('Unable to import pasted playlist:', error);
    this.pasteError = true;
    this.loading = false;
    this.showPastePlaylistSelection = true;
  }
  _importPlaylist = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.querySelector('#playlist-name') as HTMLInputElement)
      .value;
    const pasteString = (
      form.querySelector('#playlist-paste') as HTMLTextAreaElement
    ).value;

    if (!name || !pasteString) {
      console.warn('Please provide a name and paste your playlist.');
      this.pasteError = true;
      return;
    }

    this.loading = true;
    this.pasteError = false;
    this.showStartArtistSelection = false;
    this.showPastePlaylistSelection = false;

    try {
      const resolvedTracks = await this._resolvePastedTracks(pasteString);
      const playlist = this._createPastedPlaylist(
        name,
        resolvedTracks,
        resolvedTracks.length,
      );
      this._updatePlaylist(playlist);
    } catch (error) {
      this._showPastePlaylistError(error);
    }
  };
  // @ts-ignore
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
    this.showPastePlaylistSelection = false;
    console.log(`Switching to playlist: ${switchTo}`);
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
      case 'paste':
        this.showPastePlaylistSelection = true;
        this._startPastePlaylist();
        break;
      default:
        console.warn(`Unknown playlist: ${switchTo}`);
        this.showStartArtistSelection = false;
        this.showPastePlaylistSelection = false;
        this.playlist = null;
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
  // @ts-ignore
  _updatePlaylistLength(target: any, length: number) {
    this.newPlaylistLength = length;
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(UPDATE_PLAYER, this._update, this);
    EventBus.on(LOAD_PLAYLIST, this._loadPlaylist, this);
    EventBus.on(LOADED_PLAYLIST, this._loadedPlaylist, this);
    EventBus.on(NEW_PLAYLIST_LENGTH, this._updatePlaylistLength, this);
    this._getPlaylists();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(UPDATE_PLAYER, this._update, this);
    EventBus.off(LOAD_PLAYLIST, this._loadPlaylist, this);
    EventBus.off(LOADED_PLAYLIST, this._loadedPlaylist, this);
    EventBus.off(NEW_PLAYLIST_LENGTH, this._updatePlaylistLength, this);
  }
  constructor() {
    super();
    this.activeroute = '';
    this.current = null;
    this.lastFMUserName = '';
    this.playlist = null;
    this.showStartArtistSelection = false;
    this.showPastePlaylistSelection = false;
    this.pasteError = false;
    this.artists = [];
    this.loading = false;
    this.max = 100;
    this.playlistId = '';
    this.currentPlaylistId = '';
    this.newPlaylistLength = 0;
  }
  private _getPlaylistOptions(): PlaylistOption[] {
    const options: PlaylistOption[] = [];
    if (this.current?.tracks?.length) {
      options.push({ id: 'current', label: 'Current playlist' });
    }

    if (this.lastFMUserName) {
      options.push(
        { id: 'loved', label: 'Loved tracks on last.fm', refreshable: true },
        {
          id: 'top',
          label: `Most played tracks by ${this.lastFMUserName}`,
          refreshable: true,
        },
      );
    }

    options.push({
      id: 'random',
      label: `${this.max} random tracks`,
      refreshable: true,
    });

    if (this.lastFMUserName) {
      options.push(
        {
          id: 'random-pref',
          label: `${this.max} tracks by preference`,
          refreshable: true,
        },
        {
          id: 'pref-radio',
          label: 'Radio by preference',
          refreshable: true,
        },
      );
    }

    options.push(
      { id: 'radio', label: 'Artist radio' },
      { id: 'paste', label: 'Paste playlist' },
    );
    return options;
  }

  private _renderPlaylistOption({ id, label, refreshable }: PlaylistOption) {
    return html`
      <li class="${this.playlistId === id ? 'active' : ''}">
        <app-link href="/playlists/${id}" flex>
          ${label}
          <span class="icon-note">${nowPlayingIcon}</span>
          ${
            refreshable && this.currentPlaylistId === id
              ? html`<button
                  class="btn btn-small btn-primary btn-refresh"
                  @click="${() => this._reloadPlaylist(id)}"
                >
                  <span class="icon">${redoIcon}</span>
                </button>`
              : ''
          }
        </app-link>
      </li>
    `;
  }

  private _renderPlaylistDropdown(options: PlaylistOption[]) {
    return html`
      <select
        class="sm-only"
        @change=${(event: Event) => this._switchPlaylist(event)}
        id="playlist-selector"
      >
        <option disabled selected>Choose playlist</option>
        ${options.map(
          ({ id, label }) => html`<option value="${id}">${label}</option>`,
        )}
      </select>
    `;
  }

  private _renderPlaylistSelector() {
    const options = this._getPlaylistOptions();
    return html`
      <div class="playlists">
        <ul class="md-up">
          <li class="header">Playlists</li>
          ${options.map(option => this._renderPlaylistOption(option))}
        </ul>
        ${this._renderPlaylistDropdown(options)}
      </div>
    `;
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
            <label for="selectArtist" class="md-up"
              >Start with this artist:
            </label>
            <select
              id="selectArtist"
              @change="${(e: Event) => this._generateArtistRadio(e)}"
            >
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
  private _renderPastePlaylistError() {
    if (!this.pasteError) return nothing;
    return html`<div
      class="alert"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <p>
        Give your playlist a name and paste the tracks in JSON format. <br />
        The JSON should be an array of objects with track IDs, like this:
      </p>
      <pre>
[
  {
    "id": "track-id-1"
  },
  {
    "id": "track-id-2",
  }
]</pre>
    </div>`;
  }
  private _renderPastePlaylistSelector() {
    return html`
      <div class="playlist">
        <ul>
          <li class="header">Paste playlist</li>
          <li class="no-hover paste-playlist-selector">
            <form @submit="${this._importPlaylist}">
              ${this._renderPastePlaylistError()}
              <div>
                <label for="playlist-name" class="md-up"
                  >Name your playlist:
                </label>
                <input
                  type="text"
                  id="playlist-name"
                  placeholder="playlist name"
                />
              </div>
              <div>
                <label for="playlist-paste" class="md-up"
                  >Paste your playlist:
                </label>
                <textarea
                  id="playlist-paste"
                  rows="10"
                  placeholder="paste your JSON playlist"
                ></textarea>
              </div>
              <div>
                <button class="btn btn-primary">Import playlist</button>
              </div>
            </form>
          </li>
        </ul>
      </div>
    `;
  }
  render() {
    return html` <div class="container">
      ${this._renderPlaylistSelector()}
      ${
        this.playlist
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
          : nothing
      }
      ${this.showStartArtistSelection ? this._renderArtistSelector() : nothing}
      ${
        this.showPastePlaylistSelection
          ? this._renderPastePlaylistSelector()
          : nothing
      }
      ${
        this.loading
          ? html`
              <loading-indicator
                ><div slot="text">
                  Loading...
                  ${
                    this.newPlaylistLength
                      ? html`${(
                          (this.newPlaylistLength / this.max) *
                          100
                        ).toFixed()}%`
                      : nothing
                  }
                </div></loading-indicator
              >
            `
          : nothing
      }
    </div>`;
  }
}
