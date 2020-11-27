import { LitElement, customElement, html, css, property } from 'lit-element';
import { nothing } from 'lit-html';
import { navigator } from 'lit-element-router';

import './../app-link/app-link';
import musicdb from '../musicdb';
import container from '../../styles/container';
import headers from '../../styles/headers';
import smallMuted from '../../styles/small-muted';
import warn from '../../styles/warn';
import timeSpan from '../../utils/timespan';

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
    return [
      container,
      headers,
      smallMuted,
      warn,
      css`
        .container {
          display: block;
        }
        ol {
          list-style: none;
          margin: 0 0 20px;
          padding: 0;
          width: 100%;
        }
        ol li {
          display: block;
          height: 70px;
          border-top: 1px solid var(--background3);
          box-sizing: border-box;
          width: 100%;
        }
        .header {
          border-top-color: transparent;
        }
        ol app-link {
          display: flex;
          padding: 10px 1rem;
          transition: background 0.2s ease-in-out;
        }
        ol app-link:hover {
          background: rgba(0, 0, 0, 0.1);
        }
        album-art {
          width: 50px;
          height: 50px;
          margin-right: 10px;
          flex-grow: 0;
          border: 1px solid var(--background3, #f3f4f5);
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0px 0px 1px var(--primary, #006ecd);
        }
        .details {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          max-width: calc(100vw - 80px);
        }
        .details .artist,
        .details .album {
          display: block;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .track {
          display: flex;
          flex-direction: row;
          box-sizing: border-box;
          border-top: 1px solid var(--background3);
          padding: 0.5rem 1rem;
          transition: background 0.2s ease-in-out;
          min-height: 60px;
          width: 100%;
          cursor: pointer;
        }
        .track:hover {
          background: rgba(0, 0, 0, 0.1);
        }
        .track .title {
          flex-grow: 1;
        }
        .track .time {
          flex-grow: 0;
          text-align: end;
          width: 65px;
          min-width: 65px;
        }
      `,
    ];
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
