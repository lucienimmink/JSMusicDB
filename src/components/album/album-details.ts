import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../track/track';
import musicdb from '../musicdb';
import timeSpan from '../../utils/timespan';

import container from '../../styles/container';
import buttons from '../../styles/buttons';
import albumDetails from '../../styles/album-details';
import smallMuted from '../../styles/small-muted';
import { hqIcon } from '../icons/hq';
import responsive from '../../styles/responsive';
import { getSettingByName, TOGGLE_SETTING } from '../../utils/settings';
import { global as EventBus } from '../../utils/EventBus';

@customElement('album-details')
export class AlbumDetails extends LitElement {
  @property()
  artist: string;
  @property()
  album: string;
  albumDetails: any;
  shrunk: boolean;
  replayGainApplied: boolean;

  static get styles() {
    return [container, buttons, albumDetails, smallMuted, responsive];
  }

  constructor() {
    super();
    this.artist = '';
    this.album = '';
    this.albumDetails = {
      dummy: true,
      artist: { name: 'Dummy' },
      name: 'Dummy',
      year: 2000,
      tracks: [],
      type: 'dummy',
    };
    this.shrunk = false;
    this.replayGainApplied = false;
    getSettingByName('replaygain').then(async (replaygain: any) => {
      this.replayGainApplied = replaygain;
      this.requestUpdate();
    });
    this._listen();
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('scroll', this._handleScroll);
  }
  disconnectedCallback() {
    window.removeEventListener('scroll', this._handleScroll);
    super.disconnectedCallback();
  }

  _listen = () => {
    EventBus.on(
      TOGGLE_SETTING,
      () => {
        getSettingByName('replaygain').then(async (replaygain: any) => {
          this.replayGainApplied = replaygain;
        });
      },
      this
    );
  };

  _handleScroll = () => {
    if (window.pageYOffset > 0) {
      this.shrunk = true;
    } else {
      this.shrunk = false;
    }
    this.requestUpdate();
  };

  attributeChangedCallback(name: any, oldval: any, newval: any) {
    if (name === 'album') {
      this.getDetails(this.artist, newval);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }
  getDetails(artist = this.artist, album = this.album) {
    musicdb
      .then((mdb: any) => {
        this.albumDetails = mdb.albums[`${artist}|${album}`];
        this.requestUpdate();
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
  calculateLength(tracks: Array<any>) {
    let duration = 0;
    if (tracks) {
      tracks.forEach(track => {
        duration += track.duration;
      });
      return timeSpan(duration, true);
    }
    return 0;
  }
  _playAlbum(e: Event) {
    e.preventDefault();
    this.dispatchEvent(new Event('play'));
  }
  _queueAlbum(e: Event) {
    e.preventDefault();
    this.dispatchEvent(new Event('queue'));
  }
  render() {
    return html`
      <div class="jumbotron ${this.shrunk ? 'shrunk ' : ''}">
        <div class="container ${this.albumDetails?.dummy ? 'dummy ' : ''}">
          <album-art
            artist="${this.albumDetails?.artist?.albumArtist ||
            this.albumDetails?.artist?.name}"
            album="${this.albumDetails?.name}"
          ></album-art>
          <div class="details">
            <h2>${this.albumDetails?.name}</h2>
            <h3>
              ${this.albumDetails?.artist?.albumArtist ||
              this.albumDetails?.artist?.name}
              ${this.albumDetails?.type === 'mp4' ||
              this.albumDetails?.type === 'flac'
                ? html`<span class="small muted">${hqIcon}</span>`
                : nothing}
            </h3>
            <h4>
              ${this.albumDetails?.year
                ? html`${this.albumDetails?.year} •`
                : nothing}
              ${this.albumDetails?.tracks?.length}
              song${this.albumDetails?.tracks?.length === '1' ? '' : 's'} •
              ${this.calculateLength(this.albumDetails?.tracks)}
              <span class="small muted md-up-inline">
                • ${this.albumDetails?.type}
                ${this.replayGainApplied && this.albumDetails?.albumGain !== 0
                  ? html` • album gain ${this.albumDetails?.albumGain} dB `
                  : nothing}
              </span>
            </h4>
            <h4>
              <button
                class="btn btn-primary"
                @click=${(e: any) => this._playAlbum(e)}
              >
                Play album
              </button>
              <button
                class="btn btn-secondary"
                @click=${(e: any) => this._queueAlbum(e)}
              >
                Queue album
              </button>
            </h4>
          </div>
        </div>
      </div>
    `;
  }
}
