import timeSpan from '@addasoft/timespan';
import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import smallMuted from '../../styles/small-muted';
import trackNav from '../../styles/track-nav';
import { global as EventBus } from '../../utils/EventBus';
import { UPDATE_PLAYER } from '../../utils/player';
import { pauseIcon } from '../icons/pause';
import { playIcon } from '../icons/play';

@customElement('track-in-list')
export class Track extends LitElement {
  @property()
  track: any;
  @property({ type: String })
  type: string;
  @property({ type: Boolean })
  showAlbum: boolean;

  static get styles() {
    return [smallMuted, trackNav];
  }
  constructor() {
    super();
    this.track = null;
    this.type = 'album';
    this.showAlbum = false;
  }
  _updatePlayer = (target: any, { current }: { current: any }) => {
    this._update(current);
  };
  _update(track: any) {
    if (track?.id === this.track?.id) {
      this.track = { ...track };
      return;
    }
    if (this.track) {
      this.track.isPlaying = false;
      this.track.isPaused = false;
    }
    this.requestUpdate();
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(UPDATE_PLAYER, this._updatePlayer, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(UPDATE_PLAYER, this._updatePlayer, this);
  }

  private _renderTime() {
    return html`${timeSpan(this.track?.duration)} <br />
      ${this.track?.position > 0 && this.type === 'album'
        ? html`
            <span class="small muted if-active"
              >${timeSpan(this.track?.position)}</span
            >
          `
        : nothing}
      ${this.type !== 'album'
        ? html` <span class="small muted">${this.track?.type}</span> `
        : nothing}`;
  }
  render() {
    return html`
      <div
        class="track ${this.track?.isPlaying || this.track?.isPaused
          ? 'active'
          : ''}"
      >
        ${this.type === 'album'
          ? html`
              <span class="num">
                ${this.track?.isPlaying || this.track?.isPaused
                  ? html`
                      ${this.track?.isPlaying
                        ? html`${playIcon}`
                        : html`${pauseIcon}`}
                    `
                  : html` ${this.track?.number} `}
              </span>
            `
          : nothing}
        <span class="title">
          ${this.type !== 'album'
            ? html`
                ${this.track.isPlaying || this.track.isPaused
                  ? html`
                      ${this.track.isPlaying
                        ? html`${playIcon}`
                        : html`${pauseIcon}`}
                    `
                  : nothing}
              `
            : nothing}
          ${this.track?.title} <br />
          <span class="small muted"
            >${this.track?.trackArtist}${this.showAlbum
              ? html` • ${this.track?.album?.name}`
              : nothing}</span
          >
        </span>
        <span class="time"> ${this._renderTime()} </span>
      </div>
    `;
  }
}
