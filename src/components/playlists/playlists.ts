import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import 'lit-virtualizer';
import timeSpan from '../../utils/timespan';
import {
  getCurrentPlaylist,
  setCurrentPlaylist,
  startPlaylist,
  getNewPlaylistForRandom,
  getNewPlaylistForRandomPref,
  getNewPlaylistForRadio,
  getNewPlaylistForLovedTracks,
  UPDATE_PLAYER,
  LOAD_PLAYLIST,
  LOADED_PLAYLIST,
} from '../../utils/player';
import { getLastFMUserName } from '../../utils/lastfm';
import { playIcon } from '../icons/play';
import { pauseIcon } from '../icons/pause';
import musicdb from '../musicdb';
import '../loading-indicator/loading-indicator';
import headers from '../../styles/headers';
import container from '../../styles/container';
import smallMuted from '../../styles/small-muted';
import responsive from '../../styles/responsive';
import playlists from '../../styles/playlists';
import { global as EventBus } from '../../utils/EventBus';

@customElement('playlists-nav')
export class LetterNav extends LitElement {
  @property()
  activeroute: string;
  max: number;
  @property()
  current: any;
  @property()
  lastFMUserName: string;
  showStartArtistSelection: boolean;
  playlist: any;
  artists: Array<any>;
  loading: boolean;
  static get styles() {
    return [headers, container, smallMuted, responsive, playlists];
  }
  attributeChangedCallback(name: any, oldval: any, newval: any) {
    if (name === 'activeroute' && newval === 'playlists') {
      this._getPlaylists();
      this._populateArtists();
    } else {
      // cleanup
      this.playlist = null;
    }
  }
  _getPlaylists = () => {
    musicdb.then(() => {
      getCurrentPlaylist().then((playlist: any) => {
        if (playlist) {
          this.current = playlist;
          this.requestUpdate();
        }
      });
      getLastFMUserName().then((username: any) => {
        if (username !== 'mdb-skipped') {
          this.lastFMUserName = username;
          this.requestUpdate();
        }
      });
      this.requestUpdate();
    });
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
      this.requestUpdate();
    });
    startPlaylist(this);
  };
  _setActivePlaylist = (name = 'current', e: Event) => {
    e.preventDefault();
    this.showStartArtistSelection = false;
    switch (name) {
      case 'current':
        this.playlist = this.current;
        break;
    }
    this.requestUpdate();
  };
  _getLovedTracks = (e: Event) => {
    e.preventDefault();
    this.loading = true;
    this.playlist = null;
    this.showStartArtistSelection = false;
    this.requestUpdate();
    getNewPlaylistForLovedTracks({
      username: this.lastFMUserName,
    }).then((playlist: any) => {
      this.playlist = playlist;
      this.loading = false;
      this.requestUpdate();
    });
  };
  _generateRandom = (e: Event) => {
    e.preventDefault();
    this.loading = true;
    this.playlist = null;
    this.showStartArtistSelection = false;
    this.requestUpdate();
    getNewPlaylistForRandom({
      max: this.max,
    }).then((playlist: any) => {
      this.playlist = playlist;
      this.loading = false;
      this.requestUpdate();
    });
  };
  _generateRandomByPreference = (e: Event) => {
    e.preventDefault();
    this.loading = true;
    this.showStartArtistSelection = false;
    this.playlist = null;
    this.requestUpdate();
    // getTopArtists
    getNewPlaylistForRandomPref({
      max: this.max,
      username: this.lastFMUserName,
    }).then((playlist: any) => {
      this.playlist = playlist;
      this.loading = false;
      this.requestUpdate();
    });
  };
  _startArtistRadio = (e: Event) => {
    e.preventDefault();
    this.showStartArtistSelection = true;
    this.playlist = null;
    this.requestUpdate();
  };
  _populateArtists = () => {
    musicdb.then((mdb: any) => {
      const letters = mdb.sortedLetters;
      letters.map((letter: any) => {
        letter.sortAndReturnArtistsBy('sortName', 'asc').map((artist: any) => {
          this.artists.push(artist);
        });
      });
    });
  };
  _generateArtistRadio = (e: Event) => {
    this.loading = true;
    this.playlist = null;
    this.requestUpdate();
    // @ts-ignore
    const startArtistID = e.target.value;
    this.showStartArtistSelection = false;
    getNewPlaylistForRadio({
      max: this.max,
      artist: startArtistID,
    }).then((playlist: any) => {
      this.playlist = playlist;
      this.loading = false;
      this.requestUpdate();
    });
  };
  _update(current: any) {
    if (this.playlist) {
      const updatedTracks = this.playlist?.tracks.map((track: any) => {
        if (current.id === track.id) {
          track = { ...current };
          return track;
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
    switch (switchTo) {
      case 'current':
        this.showStartArtistSelection = false;
        this._setActivePlaylist('current', e);
        break;
      case 'loved':
        this.showStartArtistSelection = false;
        this._getLovedTracks(e);
        break;
      case 'random':
        this.showStartArtistSelection = false;
        this._generateRandom(e);
        break;
      case 'random-pref':
        this.showStartArtistSelection = false;
        this._generateRandomByPreference(e);
        break;
      case 'radio':
        this._startArtistRadio(e);
        break;
      default:
        this._setActivePlaylist('current', e);
    }
  }
  _listen() {
    EventBus.on(
      UPDATE_PLAYER,
      (target: any, { current }: { current: any }) => {
        this._update(current);
      },
      this
    );
    EventBus.on(
      LOAD_PLAYLIST,
      () => {
        this.loading = true;
        this.playlist = null;
        this.requestUpdate();
      },
      this
    );
    EventBus.on(
      LOADED_PLAYLIST,
      async () => {
        this.loading = false;
        this.playlist = await getCurrentPlaylist();
        // @ts-ignore
        this.shadowRoot.querySelector('#playlist-selector').value = 'current';
        this.requestUpdate();
      },
      this
    );
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
    this._listen();
  }
  render() {
    return html`
      <div class="container">
        <div class="playlists">
          <ul class="md-up">
            <li class="header">Playlists</li>
            ${this.current?.tracks?.length > 0
              ? html`
                  <li>
                    <a
                      href="#"
                      title=""
                      @click="${(e: Event) =>
                        this._setActivePlaylist('current', e)}"
                      >Current playlist</a
                    >
                  </li>
                `
              : nothing}
            ${this.lastFMUserName
              ? html`
                  <li>
                    <a
                      href="#"
                      title=""
                      @click="${(e: Event) => this._getLovedTracks(e)}"
                      >Loved tracks on last.fm</a
                    >
                  </li>
                `
              : nothing}
            <li>
              <a
                href="#"
                title=""
                @click="${(e: Event) => this._generateRandom(e)}"
                >${this.max} random tracks</a
              >
            </li>
            ${this.lastFMUserName
              ? html`
                  <li>
                    <a
                      href="#"
                      title=""
                      @click="${(e: Event) =>
                        this._generateRandomByPreference(e)}"
                      >${this.max} tracks by preference</a
                    >
                  </li>
                `
              : nothing}
            <li>
              <a
                href="#"
                title=""
                @click="${(e: Event) => this._startArtistRadio(e)}"
                >Artist radio</a
              >
            </li>
          </ul>
          <select
            class="sm-only"
            @change=${(e: Event) => this._switchPlaylist(e)}
            id="playlist-selector"
          >
            <option disabled selected>Choose a playlist</option>
            ${this.current?.tracks?.length > 0
              ? html` <option value="current">Current playlist</option> `
              : nothing}
            ${this.lastFMUserName
              ? html` <option value="loved">Loved tracks on last.fm</option> `
              : nothing}
            <option value="random">${this.max} Random tracks</option>
            ${this.lastFMUserName
              ? html`
                  <option value="random-pref">
                    ${this.max} Random tracks by preference
                  </option>
                `
              : nothing}
            <option value="radio">Artist radio</option>
          </select>
        </div>
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
                    .renderItem=${(track: any) => html`
                      <li
                        @click="${() => {
                          this.setPlaylist(track);
                        }}"
                        class="${track.isPlaying || track.isPaused
                          ? 'active'
                          : ''}"
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
                            >${track.trackArtist} &bull;
                            ${track.album.name}</span
                          ></span
                        >
                        <span class="time"
                          >${timeSpan(track.duration)} <br />
                          ${track.position > 0 &&
                          (track.isPlaying || track.isPaused)
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
                    `}
                  >
                  </lit-virtualizer>
                </ul>
              </div>
            `
          : nothing}
        ${this.showStartArtistSelection
          ? html`
              <div class="playlist">
                <ul>
                  <li class="header">Create artist radio</li>
                  <li class="no-hover artist-selector">
                    <span class="md-up">Start with this artist: </span>
                    <select
                      @change="${(e: Event) => this._generateArtistRadio(e)}"
                    >
                      <option disabled selected>
                        Select an artist from the list
                      </option>
                      ${this.artists.map(
                        (artist: any) => html` <option
                          value="${artist.escapedName}"
                        >
                          ${artist.name}
                        </option>`
                      )}
                    </select>
                  </li>
                </ul>
              </div>
            `
          : nothing}
        ${this.loading
          ? html` <loading-indicator>loading ...</loading-indicator> `
          : nothing}
      </div>
    `;
  }
}
