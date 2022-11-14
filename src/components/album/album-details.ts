import timeSpan from '@addasoft/timespan';
import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import albumDetails from '../../styles/album-details';
import buttons from '../../styles/buttons';
import container from '../../styles/container';
import responsive from '../../styles/responsive';
import smallMuted from '../../styles/small-muted';
import { global as EventBus } from '../../utils/EventBus';
import { getSettingByName, TOGGLE_SETTING } from '../../utils/settings';
import { hqIcon } from '../icons/hq';
import musicdb from '../musicdb';
import '../track/track';

@customElement('album-details')
export class AlbumDetails extends LitElement {
  @property()
  artist: string;
  @property()
  album: string;

  @state()
  albumDetails: any;
  @state()
  shrinkFactor: string;
  @state()
  replayGainApplied: boolean;

  static readonly SCROLLOFFSET = 160;

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
    this.shrinkFactor = '';
    this.replayGainApplied = false;
    getSettingByName('replaygain').then(async (replaygain: any) => {
      this.replayGainApplied = replaygain;
    });
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('scroll', this._handleScroll);
    EventBus.on(TOGGLE_SETTING, this._doToggleReplayGainSetting, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this._handleScroll);
    EventBus.off(TOGGLE_SETTING, this._doToggleReplayGainSetting, this);
  }
  _doToggleReplayGainSetting() {
    getSettingByName('replaygain').then(async (replaygain: any) => {
      this.replayGainApplied = replaygain;
    });
  }
  _handleScroll = () => {
    const scroll =
      window.scrollY >= AlbumDetails.SCROLLOFFSET
        ? 1
        : window.scrollY / AlbumDetails.SCROLLOFFSET;
    this.style.setProperty('--scroll', scroll.toString());
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
      <div class="jumbotron ${this.shrinkFactor}">
        <div class="container ${this.albumDetails?.dummy ? 'dummy ' : ''}">
          <album-art
            artist="${this.albumDetails?.artist?.albumArtist ||
            this.albumDetails?.artist?.name}"
            album="${this.albumDetails?.name}"
            ?static=${true}
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
