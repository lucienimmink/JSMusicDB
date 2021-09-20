import { LitElement, customElement, html, property } from 'lit-element';
import './album-details';
import '../track/track';
import musicdb from '../musicdb';
import {
  setCurrentPlaylist,
  startPlaylist,
  setCurrentTime,
  getCurrentPlaylist,
} from '../../utils/player';
import headers from '../../styles/headers';
import container from '../../styles/container';
import album from '../../styles/album';
import { REFRESH } from '../../utils/musicdb';
import { global as EventBus } from '../../utils/EventBus';

@customElement('tracks-in-album')
export class Album extends LitElement {
  @property()
  artist: string;
  @property()
  album: string;
  albumDetails: any;
  sortedDiscs: Array<any>;

  static get styles() {
    return [container, headers, album];
  }
  constructor() {
    super();
    this.artist = '';
    this.album = '';
    this.albumDetails = {};
    this.sortedDiscs = [];
    this._listen();
  }
  _listen() {
    EventBus.on(
      REFRESH,
      () => {
        this._getTracks();
      },
      this
    );
  }
  attributeChangedCallback(name: any, oldval: any, newval: any) {
    if (name === 'album') {
      this._getTracks(this.artist, newval);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }
  _getTracks(artist = this.artist, album = this.album) {
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
        this.requestUpdate();
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
      <album-details
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
                : html``}
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
      </div>
    `;
  }
}
