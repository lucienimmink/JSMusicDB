import { LitElement, customElement, html, property } from 'lit-element';
import { nothing } from 'lit-html';
import { navigator } from 'lit-element-router';

import './../app-link/app-link';
import musicdb from '../musicdb';
import container from '../../styles/container';
import headers from '../../styles/headers';
import smallMuted from '../../styles/small-muted';
import warn from '../../styles/warn';
import timeSpan from '../../utils/timespan';
import search from '../../styles/search';

const MAX = 100;

@customElement('search-nav')
@navigator
export class SearchNav extends LitElement {
  @property()
  activeroute: string;
  @property()
  query: string;
  artists: any;
  albums: any;
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
  attributeChangedCallback(name: any, oldval: any, newval: any) {
    if (name === 'query') {
      this._doSearch();
    }
    if (name === 'activeroute' && newval !== 'search') {
      this.artists = null;
      this.albums = null;
      this.tracks = null;
    }
    this.requestUpdate();
    super.attributeChangedCallback(name, oldval, newval);
  }
  _doSearch() {
    musicdb
      .then((mdb: any) => {
        if (this.query) {
          this.artists = this._spliceList(mdb.searchArtist(this.query), MAX);
          this.albums = this._spliceList(mdb.searchAlbum(this.query), MAX);
          this.tracks = this._spliceList(mdb.searchTrack(this.query), MAX);
        }
        this.requestUpdate();
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
    this.navigate(
      `/letter/${track.album.artist.letter.escapedLetter}/artist/${track.album.artist.escapedName}/album/${track.album.escapedName}`
    );
  }
  navigate(href: any) {
    throw new Error(`Method not implemented. ${href}`);
  }
  render() {
    return html`
      ${this.artists?.list.length > 0
        ? html`
            <div class="container">
              ${this.artists?.overflow
                ? html`
                    <div class="warn">
                      Your search yielded over <strong>${MAX}</strong> results
                      Only the first ${MAX} are shown. Please try to refine your
                      search query
                    </div>
                  `
                : nothing}
              <ol>
                <li class="header">
                  Artists
                  <span class="small muted"
                    >(${this.artists?.list.length})</span
                  >
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
                            >Albums: ${artist.albums.length}</span
                          >
                        </div>
                      </app-link>
                    </li>
                  `
                )}
              </ol>
            </div>
          `
        : nothing}
      ${this.albums?.list.length > 0
        ? html`
            <div class="container">
              ${this.albums?.overflow
                ? html`
                    <div class="warn">
                      Your search yielded over <strong>${MAX}</strong> results
                      Only the first ${MAX} are shown. Please try to refine your
                      search query
                    </div>
                  `
                : nothing}
              <ol>
                <li class="header">
                  Albums
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
                          artist="${album.artist.albumArtist ||
                          album.artist.name}"
                          album="${album.name}"
                        ></album-art>
                        <div class="details">
                          <span class="album">${album.name}</span>
                          ${album.year
                            ? html`
                                <span class="small muted"
                                  >Year: ${album.year}</span
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
          `
        : nothing}
      ${this.tracks?.list.length > 0
        ? html`
            <div class="container">
              ${this.tracks?.overflow
                ? html`
                    <div class="warn">
                      Your search yielded over <strong>${MAX}</strong> results
                      Only the first ${MAX} are shown. Please try to refine your
                      search query
                    </div>
                  `
                : nothing}
              <ol>
                <li class="header">
                  Tracks
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
                        ${track.position > 0 &&
                        (track.isPlaying || track.isPaused)
                          ? html`
                              <span class="small muted"
                                >${timeSpan(track.position)}</span
                              >
                            `
                          : html`
                              <span class="small muted">${track.type}</span>
                            `}
                      </span>
                    </li>
                  `
                )}
              </ol>
            </div>
          `
        : nothing}
    `;
  }
}
