import timeSpan from '@addasoft/timespan';
import { localized, t } from '@weavedev/lit-i18next';
import { LitElement, PropertyValueMap, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import container from '../../styles/container';
import headers from '../../styles/headers';
import search from '../../styles/search';
import smallMuted from '../../styles/small-muted';
import warn from '../../styles/warn';
import { global as EventBus } from '../../utils/EventBus';
import { REFRESH } from '../../utils/musicdb';
import { CHANGE_URL } from '../../utils/router';
import musicdb from '../musicdb';
import './../app-link/app-link';

const MAX = 100;

@customElement('search-nav')
@localized()
export class SearchNav extends LitElement {
  @property()
  activeroute: string;
  @property()
  query: string;
  @state()
  artists: any;
  @state()
  albums: any;
  @state()
  tracks: any;

  static get styles() {
    return [container, headers, smallMuted, warn, search];
  }
  constructor() {
    super();
    this.activeroute = '';
    this.query = '';
    this._doSearch();
  }
  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has('query')) {
      this._doSearch();
    }
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this._doSearch, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._doSearch, this);
  }
  _doSearch() {
    musicdb
      .then((mdb: any) => {
        if (this.query) {
          this.artists = this._spliceList(mdb.searchArtist(this.query), MAX);
          this.albums = this._spliceList(mdb.searchAlbum(this.query), MAX);
          this.tracks = this._spliceList(mdb.searchTrack(this.query), MAX);
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
  _spliceList(results: any[], count: number) {
    let ret = false;
    let view = results;
    if (results.length > count) {
      view = results.splice(0, count);
      ret = true;
    }
    return {
      list: view,
      overflow: ret,
    };
  }
  _handleTrackClick(e: Event, track: any) {
    e.preventDefault();
    const path = `/letter/${track.album.artist.letter.escapedLetter}/artist/${track.album.artist.escapedName}/album/${track.album.escapedName}`;
    window.history.pushState({ path }, '', path);
    EventBus.emit(CHANGE_URL, this, path);
  }
  private _renderOverflow() {
    return html`
      <div class="warn">
        ${unsafeHTML(t('errors.too-many-results', { count: MAX }))}
      </div>
    `;
  }
  private _renderArtists() {
    return html`
      <div class="container">
        ${this.artists?.overflow ? this._renderOverflow() : nothing}
        <ol>
          <li class="header">
            ${t('headers.artists')}
            <span class="small muted">(${this.artists?.list.length})</span>
          </li>
          ${this.artists?.list.map(
            (artist: any) => html`
              <li>
                <app-link
                  flex
                  text
                  href="/letter/${artist.letter
                    .escapedLetter}/artist/${artist.escapedName}"
                >
                  <album-art
                    artist="${artist.albumArtist || artist.name}"
                  ></album-art>
                  <div class="details">
                    <span class="artist"
                      >${artist.albumArtist || artist.name}</span
                    >
                    <span class="small muted"
                      >${t('labels.albums')}: ${artist.albums.length}</span
                    >
                  </div>
                </app-link>
              </li>
            `
          )}
        </ol>
      </div>
    `;
  }
  private _renderAlbums() {
    return html`
      <div class="container">
        ${this.albums?.overflow ? this._renderOverflow() : nothing}
        <ol>
          <li class="header">
            ${t('headers.albums')}
            <span class="small muted">(${this.albums?.list.length})</span>
          </li>
          ${this.albums?.list.map(
            (album: any) => html`
              <li>
                <app-link
                  flex
                  text
                  href="/letter/${album.artist.letter
                    .escapedLetter}/artist/${album.artist
                    .escapedName}/album/${album.escapedName}"
                >
                  <album-art
                    artist="${album.artist.albumArtist || album.artist.name}"
                    album="${album.name}"
                  ></album-art>
                  <div class="details">
                    <span class="album">${album.name}</span>
                    ${album.year
                      ? html`
                          <span class="small muted"
                            >${t('labels.year')}: ${album.year}</span
                          >
                        `
                      : nothing}
                  </div>
                </app-link>
              </li>
            `
          )}
        </ol>
      </div>
    `;
  }
  private _renderTracks() {
    return html`
      <div class="container">
        ${this.tracks?.overflow ? this._renderOverflow() : nothing}
        <ol>
          <li class="header">
            ${t('headers.tracks')}
            <span class="small muted">(${this.tracks?.list.length})</span>
          </li>
          ${this.tracks?.list.map(
            (track: any) => html`
              <li
                class="track"
                @click=${(e: Event) => this._handleTrackClick(e, track)}
              >
                <span class="title">
                  ${track.title} <br />
                  <span class="small muted"
                    >${track.trackArtist} &bull; ${track.album.name}</span
                  >
                </span>
                <span class="time"
                  >${timeSpan(track.duration)} <br />
                  ${track.position > 0 && (track.isPlaying || track.isPaused)
                    ? html`
                        <span class="small muted"
                          >${timeSpan(track.position)}</span
                        >
                      `
                    : html` <span class="small muted">${track.type}</span> `}
                </span>
              </li>
            `
          )}
        </ol>
      </div>
    `;
  }
  render() {
    return html`
      ${this.artists?.list.length > 0 ? this._renderArtists() : nothing}
      ${this.albums?.list.length > 0 ? this._renderAlbums() : nothing}
      ${this.tracks?.list.length > 0 ? this._renderTracks() : nothing}
    `;
  }
}
