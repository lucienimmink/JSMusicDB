import timespan from '@addasoft/timespan';
import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import smallMuted from '../../styles/small-muted';
import trackModal from '../../styles/track-modal';
import { global as EventBus } from '../../utils/EventBus';
import { timesIcon } from '../icons/times';
import { TOGGLE_OVERFLOW_HIDDEN } from '../side-nav/side-nav';
import buttons from '../../styles/buttons';

export const OPEN_TRACK_MODAL = 'open-track-modal';
export const CLOSE_TRACK_MODAL = 'close-track-modal';

@customElement('track-info-modal')
export class Track extends LitElement {
  @state()
  track: any;

  static get styles() {
    return [smallMuted, buttons, trackModal];
  }
  constructor() {
    super();
    this.track = null;
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(OPEN_TRACK_MODAL, this._openModal, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(OPEN_TRACK_MODAL, this._openModal, this);
  }
  _openModal(target: any, track: any) {
    this.track = track;
    this.shadowRoot?.querySelector('dialog')?.showModal();
    EventBus.emit(TOGGLE_OVERFLOW_HIDDEN, this, true);
  }
  _closeModal(e: Event) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    // @ts-ignore
    this.shadowRoot?.querySelector('dialog')?.requestClose();
    EventBus.emit(TOGGLE_OVERFLOW_HIDDEN, this, false);
  }
  _calculateRowSpan() {
    let rowspan = 10;
    if (this.track?.samplerate) {
      rowspan += 4;
    }
    return rowspan;
  }
  _renderChannelsInfo(channels: number) {
    if (channels === 1) {
      return 'Mono';
    } else if (channels === 2) {
      return 'Stereo';
    } else if (channels > 2) {
      return `${channels} channels`;
    }
    return '';
  }
  _renderStreamInfoIfPresent() {
    if (this.track?.samplerate) {
      return html`
        <tr>
          <td class="small muted">Sample rate</td>
          <td class="small muted">Bit rate</td>
        </tr>
        <tr>
          <td>${this.track.samplerate / 1000} kHz</td>
          <td>${Math.round(this.track.bitrate / 1024)} kbps</td>
        </tr>
        <tr>
          ${this.track?.bits_per_sample
            ? html`<td class="small muted">Channels</td>`
            : html`<td class="small muted" colspan="2">Channels</td>`}
          ${this.track?.bits_per_sample
            ? html`<td class="small muted">Bit depth</td>`
            : nothing}
        </tr>
        <tr>
          ${this.track?.bits_per_sample
            ? html`<td>${this._renderChannelsInfo(this.track.channels)}</td>`
            : html`<td colspan="2">
                ${this._renderChannelsInfo(this.track.channels)}
              </td>`}
          ${this.track?.bits_per_sample
            ? html`<td>${this.track.bits_per_sample} bit</td>`
            : nothing}
        </tr>
      `;
    }
    return nothing;
  }
  render() {
    return html`<dialog @close=${this._closeModal} @cancel=${this._closeModal}>
      ${!this.track
        ? nothing
        : html`
            <h1>
              Properties
              <button
                @click=${this._closeModal}
                autofocus
                class="btn btn-transparent btn-icon"
              >
                ${timesIcon}
              </button>
            </h1>
            <table>
              <tr>
                <td class="small muted">Title</td>
                <td class="small muted">Artist</td>
                <td class="small muted">&nbsp;</td>
              </tr>
              <tr>
                <td>${this.track.title}</td>
                <td>${this.track.trackArtist}</td>
                <td rowspan="${this._calculateRowSpan()}" class="album-art">
                  <album-art
                    artist="${this.track?.album?.artist?.albumArtist ||
                    this.track?.album?.artist?.name}"
                    album="${this.track?.album?.name}"
                    mbid="${this.track?.album?.mbid}"
                    ?static=${true}
                    dimension="280"
                    visible="true"
                  ></album-art>
                </td>
              </tr>
              <tr>
                <td class="small muted">Album</td>
                <td class="small muted">Album artist</td>
              </tr>
              <tr>
                <td>${this.track.album.name}</td>
                <td>${this.track.album.artist.albumArtist}</td>
              </tr>
              <tr>
                <td class="small muted">Disc &bull; track number</td>
                <td class="small muted">Length</td>
              </tr>
              <tr>
                <td>${this.track.disc} &bull; ${this.track.number}</td>
                <td>${timespan(this.track?.duration)}</td>
              </tr>
              <tr>
                <td class="small muted">Year</td>
                <td class="small muted">Item type</td>
              </tr>
              <tr>
                <td>${this.track.album.year}</td>
                <td>.${this.track.type}</td>
              </tr>
              <tr>
                <td class="small muted">Track gain</td>
                <td class="small muted">Album gain</td>
              </tr>
              <tr>
                <td>${this.track.trackGain} dB</td>
                <td>${this.track.album.albumGain} dB</td>
              </tr>
              ${this._renderStreamInfoIfPresent()}
              <tr>
                <td class="small muted" colspan="2">Relative location</td>
              </tr>
              <tr>
                <td colspan="3">${this.track.source.url}</td>
              </tr>
            </table>
            <footer>
              <button
                @click=${this._closeModal}
                class="btn btn-primary btn-min-width"
              >
                Close
              </button>
            </footer>
          `}
    </dialog>`;
  }
}
