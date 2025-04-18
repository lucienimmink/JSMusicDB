import { LitElement, PropertyValueMap, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import album from '../../styles/album';
import container from '../../styles/container';
import headers from '../../styles/headers';
import { global as EventBus } from '../../utils/EventBus';
import { REFRESH } from '../../utils/musicdb';
import {
  getCurrentPlaylist,
  setCurrentPlaylist,
  setCurrentTime,
  startPlaylist,
} from '../../utils/player';
import musicdb from '../musicdb';
import '../track/track';
import './album-details';

@customElement('tracks-in-album')
export class Album extends LitElement {
  @property()
  artist: string;
  @property()
  album: string;

  @state()
  albumDetails: any;
  @state()
  sortedDiscs: Array<any>;

  willScrollToTrack: boolean = false;

  static get styles() {
    return [container, headers, album];
  }
  constructor() {
    super();
    this.artist = '';
    this.album = '';
    this.albumDetails = {};
    this.sortedDiscs = [];
  }
  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has('album')) {
      this._getTracks();
    }
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this._getTracks, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._getTracks, this);
  }
  async _getTracks(artist: any = this.artist, album = this.album) {
    this.willScrollToTrack = false;
    if (window.location.search.includes('id')) {
      this.willScrollToTrack = true;
    }
    if (artist instanceof Object) {
      artist = this.artist;
    }
    this.sortedDiscs = [];
    const mdb: any = await musicdb;
    this.albumDetails = mdb.albums[`${artist}|${album}`];
    const namedDiscs = Object.keys(this.albumDetails?.discs || {});
    let discnrs: any[] = [];
    namedDiscs.forEach(name => {
      const discnr = name.substring(5);
      discnrs.push({
        discnr,
        name,
      });
    });
    discnrs = discnrs.sort((a, b) => {
      if (a.discnr < b.discnr) {
        return -1;
      }
      return 1;
    });
    discnrs.forEach(disc => {
      this.sortedDiscs.push(this.albumDetails.discs[disc.name]);
    });
  }
  async _setPlaylist(e: Event, track = { id: undefined }) {
    let startIndex = 0;
    if (track?.id) {
      this.albumDetails.tracks.map((t: any, index: number) => {
        if (t.id === track.id) {
          startIndex = index;
        }
      });
    }
    // sort before
    this._sort(this.albumDetails);
    await setCurrentPlaylist({
      name: `${
        this.albumDetails.artist.albumArtist || this.albumDetails.artist.name
      } • ${this.albumDetails.name}`,
      tracks: this.albumDetails.tracks,
      index: startIndex,
      type: 'album',
      album: this.albumDetails,
    });
    await setCurrentTime(0);
    startPlaylist(this);
  }
  async _appendPlaylist(e: Event) {
    e.preventDefault();
    const currentPlaylist = (await getCurrentPlaylist()) || {};
    currentPlaylist.name = 'Queued albums';
    currentPlaylist.tracks = [
      ...currentPlaylist.tracks,
      ...this.albumDetails.tracks,
    ];
    currentPlaylist.index = currentPlaylist.index || 0;
    currentPlaylist.type = 'playlist';
    delete currentPlaylist.album;
    await setCurrentPlaylist(currentPlaylist);
  }
  private _sort(album: any) {
    album.tracks.sort((a: any, b: any): number => {
      if (a.disc < b.disc) {
        return -1;
      }
      if (a.disc === b.disc) {
        if (a.number < b.number) {
          return -1;
        } else {
          return 1;
        }
      }
      return 1;
    });
  }
  private _renderTrack(track: any) {
    return html`<track-in-list
      @click=${(e: Event) => {
        this._setPlaylist(e, track);
      }}
      .track=${track}
      class="${track.isPaused || track.isPlaying ? 'active' : ''}"
      type="album"
      context="album"
      data-id="${track.id}"
    ></track-in-list>`;
  }
  private _renderDisc(disc: any) {
    return html`
      <div class="album-details">
        ${this.sortedDiscs.length > 1
          ? html` <div class="header">Disc ${disc[0].disc}</div>`
          : nothing}
        ${disc.map((track: any) => this._renderTrack(track))}
      </div>
    `;
  }
  private handleScroll(): any {
    if (this.willScrollToTrack) {
      setTimeout(() => {
        const track = this.shadowRoot?.querySelector(
          `[data-id="${window.location.search.split('id=')[1]}"]`,
        );
        if (track) {
          track.scrollIntoView({ block: 'center' });
        }
      }, 100);
    }
  }
  render() {
    return html` <album-details
        artist="${this.artist}"
        album="${this.album}"
        @play=${(e: Event) => this._setPlaylist(e)}
        @queue=${(e: Event) => this._appendPlaylist(e)}
      ></album-details>
      <div class="container">
        ${this.sortedDiscs.map((disc: any) => this._renderDisc(disc))}
        ${this.handleScroll()}
      </div>`;
  }
}
