import { html, LitElement, nothing } from 'lit';
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
import { SWITCH_ROUTE } from '../../utils/router';
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
  @state()
  active = false;

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
  attributeChangedCallback(name: string, oldvalue: string, newvalue: string) {
    super.attributeChangedCallback(name, oldvalue, newvalue);
    if (name === 'album') {
      this._getTracks();
    }
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this._getTracks, this);
    EventBus.on(SWITCH_ROUTE, this.isActiveRoute, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._getTracks, this);
    EventBus.off(SWITCH_ROUTE, this.isActiveRoute, this);
  }
  isActiveRoute(event: Event, route: string) {
    this.active = route === 'album';
  }
  _getTracks(artist: any = this.artist, album = this.album) {
    if (artist instanceof Object) {
      artist = this.artist;
    }
    this.sortedDiscs = [];
    musicdb
      .then((mdb: any) => {
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
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
  async _setPlaylist(e: Event, track = { id: undefined }) {
    e.preventDefault();
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
    currentPlaylist.name = 'queued albums';
    currentPlaylist.tracks = [
      ...currentPlaylist.tracks,
      ...this.albumDetails.tracks,
    ];
    currentPlaylist.index = currentPlaylist.index || 0;
    currentPlaylist.type = 'playlist';
    delete currentPlaylist.album;
    await setCurrentPlaylist(currentPlaylist);
  }
  _sort(album: any) {
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
  render() {
    return html`
      ${this.active
        ? html` <album-details
              artist="${this.artist}"
              album="${this.album}"
              @play=${(e: Event) => this._setPlaylist(e)}
              @queue=${(e: Event) => this._appendPlaylist(e)}
            ></album-details>
            <div class="container">
              ${this.sortedDiscs.map(
                (disc: any) => html`
                  <div class="album-details">
                    ${this.sortedDiscs.length > 1
                      ? html` <div class="header">Disc ${disc[0].disc}</div>`
                      : nothing}
                    ${disc.map(
                      (track: any) => html`
                        <track-in-list
                          @click=${(e: Event) => {
                            this._setPlaylist(e, track);
                          }}
                          .track=${track}
                          type="album"
                        ></track-in-list>
                      `
                    )}
                  </div>
                `
              )}
            </div>`
        : nothing}
    `;
  }
}
