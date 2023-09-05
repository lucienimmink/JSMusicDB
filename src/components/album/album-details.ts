import timeSpan from '@addasoft/timespan';
import { i18next, localized, t } from '@weavedev/lit-i18next';
import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
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

@customElement('album-details')
@localized()
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
  private _toLocale(i18nLocale: string) {
    if (!i18nLocale) return 'en-GB';
    const t = i18nLocale.split('-');
    return `${t[0]}-${t[1].toUpperCase()}`;
  }
  calculateLength(tracks: Array<any>) {
    let duration = 0;
    if (tracks) {
      tracks.forEach(track => {
        duration += track.duration;
      });
      return timeSpan(duration, true, this._toLocale(i18next.language));
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

  private _renderButtons() {
    return html`<h4>
      <button class="btn btn-primary" @click=${(e: any) => this._playAlbum(e)}>
        ${t('labels.play-album')} <span>${t('labels.play-album2')}</span>
      </button>
      <button
        class="btn btn-secondary"
        @click=${(e: any) => this._queueAlbum(e)}
      >
        ${t('labels.queue-album')} <span>${t('labels.queue-album2')}</span>
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
        ${t('labels.songs', { count: this.albumDetails?.tracks?.length })} •
        ${this.calculateLength(this.albumDetails?.tracks)}
        <span class="small muted md-up-inline">
          • ${this.albumDetails?.type}
          ${this.replayGainApplied && this.albumDetails?.albumGain !== 0
            ? html`
                • ${t('labels.album-gain')} ${this.albumDetails?.albumGain} dB
              `
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
            ?static=${true}
          ></album-art>
          ${this._renderDetails()}
        </div>
      </div>
    `;
  }
}
