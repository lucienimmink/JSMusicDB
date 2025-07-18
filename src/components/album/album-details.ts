import timespan from '@addasoft/timespan';
import { LitElement, html, nothing } from 'lit';
import {
  customElement,
  property,
  state,
  eventOptions,
} from 'lit/decorators.js';
import albumDetails from '../../styles/album-details';
import buttons from '../../styles/buttons';
import container from '../../styles/container';
import responsive from '../../styles/responsive';
import smallMuted from '../../styles/small-muted';
import { global as EventBus } from '../../utils/EventBus';
import { TOGGLE_SETTING, getSettingByName } from '../../utils/settings';
import { hqIcon } from '../icons/hq';
import musicdb from '../musicdb';
import '../track/track';
import { LOCALE } from '../../utils/date';
import { TOGGLE_OVERFLOW_HIDDEN } from '../side-nav/side-nav';

@customElement('album-details')
export class AlbumDetails extends LitElement {
  @property()
  artist: string;
  @property()
  album: string;

  @state()
  albumDetails: any;
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
    this.replayGainApplied = false;
    getSettingByName('replaygain').then(async (replaygain: any) => {
      this.replayGainApplied = replaygain;
    });
  }

  connectedCallback() {
    super.connectedCallback();
    EventBus.on(TOGGLE_SETTING, this._doToggleReplayGainSetting, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(TOGGLE_SETTING, this._doToggleReplayGainSetting, this);
  }
  _doToggleReplayGainSetting() {
    getSettingByName('replaygain').then(async (replaygain: any) => {
      this.replayGainApplied = replaygain;
    });
  }

  attributeChangedCallback(name: any, oldval: any, newval: any) {
    if (name === 'album') {
      this.getDetails(this.artist, newval);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }
  async getDetails(artist = this.artist, album = this.album) {
    const mdb: any = await musicdb;
    this.albumDetails = mdb.albums[`${artist}|${album}`];
  }
  calculateLength(tracks: Array<any>) {
    let duration = 0;
    if (tracks) {
      tracks.forEach(track => {
        duration += track.duration;
      });
      return timespan(duration, true, LOCALE);
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
  @eventOptions({ passive: true })
  _openModal() {
    this.shadowRoot?.querySelector('dialog')?.showModal();
    EventBus.emit(TOGGLE_OVERFLOW_HIDDEN, this, true);
  }
  @eventOptions({ passive: true })
  _closeModal() {
    // @ts-ignore
    this.shadowRoot?.querySelector('dialog')?.requestClose();
    EventBus.emit(TOGGLE_OVERFLOW_HIDDEN, this, false);
  }
  _getModalDimension() {
    return Math.min(window.innerHeight, window.innerHeight) - 300;
  }

  private _renderButtons() {
    return html`<h4>
      <button class="btn btn-primary" @click=${this._playAlbum}>
        Play <span>album</span>
      </button>
      <button class="btn btn-secondary" @click=${this._queueAlbum}>
        Queue <span>album</span>
      </button>
    </h4>`;
  }
  private _renderDetails() {
    return html`<div class="details">
      <h2><span>${this.albumDetails?.name}</span></h2>
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
        track${this.albumDetails?.tracks?.length !== 1 ? 's' : ''} •
        ${this.calculateLength(this.albumDetails?.tracks)}
        <span class="small muted md-up-inline">
          • ${this.albumDetails?.type}
          ${this.replayGainApplied && this.albumDetails?.albumGain !== 0
            ? html` • Album gain: ${this.albumDetails?.albumGain} dB `
            : nothing}
        </span>
      </h4>
      ${this._renderButtons()}
    </div>`;
  }
  render() {
    return html`
      <div class="jumbotron">
        <div class="container ${this.albumDetails?.dummy ? 'dummy ' : ''}">
          <album-art
            artist="${this.albumDetails?.artist?.albumArtist ||
            this.albumDetails?.artist?.name}"
            album="${this.albumDetails?.name}"
            mbid="${this.albumDetails?.mbid}"
            ?static=${true}
            dimension="190"
            @click=${this._openModal}
          ></album-art>
          <dialog @close=${this._closeModal} @cancel=${this._closeModal}>
            <album-art
              artist="${this.albumDetails?.artist?.albumArtist ||
              this.albumDetails?.artist?.name}"
              album="${this.albumDetails?.name}"
              mbid="${this.albumDetails?.mbid}"
              dimension="${this._getModalDimension()}"
              visible="true"
              ?static=${true}
              @click=${this._closeModal}
            ></album-art>
          </dialog>
          ${this._renderDetails()}
        </div>
      </div>
    `;
  }
}
